// Deterministic JSON repair engine (PRD section 9.4, rules R-1 ~ R-10, extended
// with R-11 ~ R-18 for the cases real LLM / Python / JS / CJK-IME output hits).
//
// Deliberately NOT an AI call: the site is a static export with no server, and
// the whole point of the tool is that the pasted data never leaves the browser.
// Every rule is a pure string transform — no network access, no dependency.
//
// Design notes:
// - One left-to-right, string-literal-aware pass. Regex-only rules would happily
//   rewrite prose sitting around the JSON, which breaks AC-D2.
// - Re-quoting and comma insertion only happen in genuine grammar positions and
//   only INSIDE a container, so prose like "Objects use {} syntax" is left alone.
// - Candidate extraction prefers the largest balanced value that actually parses,
//   so an illustrative `{}` inside prose never wins over the real payload.
// - A cut-off document is completed, never trimmed down to its first balanced
//   fragment: answering with an inner object is silent data loss (R-18).
// - The hot loop compares char codes instead of calling helpers or indexing
//   objects, because AC-D4 asks for 1 MB in under 50 ms.

export const RULES = [
  { id: 'R-1', label: 'Stripped Markdown code fence' },
  { id: 'R-2', label: 'Extracted JSON from surrounding text' },
  { id: 'R-3', label: 'Removed trailing comma' },
  { id: 'R-4', label: 'Converted single quotes to double quotes' },
  { id: 'R-5', label: 'Quoted a bare object key' },
  { id: 'R-6', label: 'Removed a comment' },
  { id: 'R-7', label: 'Mapped a Python literal (True/False/None)' },
  { id: 'R-8', label: 'Normalised smart quotes / invisible characters' },
  { id: 'R-9', label: 'Escaped a raw newline inside a string' },
  { id: 'R-10', label: 'Wrapped multiple top-level values in an array' },
  { id: 'R-11', label: 'Inserted a missing comma' },
  { id: 'R-12', label: 'Removed an empty element' },
  { id: 'R-13', label: 'Fixed an invalid escape sequence' },
  { id: 'R-14', label: 'Converted NaN / Infinity to null' },
  { id: 'R-15', label: 'Replaced "=" with ":" after a key' },
  { id: 'R-16', label: 'Quoted an unquoted string value' },
  { id: 'R-17', label: 'Converted full-width characters to ASCII' },
  { id: 'R-18', label: 'Completed a truncated (cut-off) document' },
];
const PY_LITERALS = { True: 'true', False: 'false', None: 'null' };
const NULLISH = { NaN: true, Infinity: true, undefined: true };

// Characters that may legally follow a backslash inside a JSON string.
const VALID_ESCAPES = '"\\/bfnrtu';
const CONTROL_ESCAPES = { 8: '\\b', 9: '\\t', 10: '\\n', 12: '\\f', 13: '\\r' };

// Char codes used by the scanner.
const TAB = 9;
const LF = 10;
const CR = 13;
const SPACE = 32;
const QUOTE = 34; // "
const DOLLAR = 36; // $
const APOS = 39; // '
const PLUS = 43; // +
const COMMA = 44; // ,
const MINUS = 45; // -
const DOT = 46; // .
const SLASH = 47; // /
const ZERO = 48;
const NINE = 57;
const LBRACKET = 91; // [
const BACKSLASH = 92;
const RBRACKET = 93; // ]
const UNDERSCORE = 95;
const LBRACE = 123; // {
const RBRACE = 125; // }
const COLON = 58; // :
const EQUALS = 61; // =
const GT = 62; // >
const UPPER_A = 65;
const UPPER_Z = 90;
const LOWER_A = 97;
const LOWER_Z = 122;
const UPPER_E = 69;
const LOWER_E = 101;

const isWhitespace = (ch) => ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f';
const isDigit = (ch) => ch >= '0' && ch <= '9';

// Character-class tests used by the truncation scanner (R-18). They take a raw
// char code so the scan stays allocation-free on large inputs.
const isNumberChar = (code) =>
  (code >= ZERO && code <= NINE) ||
  code === DOT ||
  code === LOWER_E ||
  code === UPPER_E ||
  code === PLUS ||
  code === MINUS;
const isWordChar = (code) =>
  (code >= UPPER_A && code <= UPPER_Z) ||
  (code >= LOWER_A && code <= LOWER_Z) ||
  (code >= ZERO && code <= NINE) ||
  code === UNDERSCORE ||
  code === DOLLAR;

// Fold a RAW source char code onto the code the scanner will actually act on.
// Full-width ASCII, the ideographic space and the dash family all collapse to
// their ASCII equivalents. The scanner's look-ahead peeks read the raw source,
// so they have to run the same fold (`{name： 5}` must recognise the colon).
const canonicalCode = (c) => {
  if (c >= 0xff01 && c <= 0xff5e) return c - 0xfee0;
  if (c === 0x3000) return SPACE;
  if ((c >= 0x2010 && c <= 0x2015) || c === 0x2212) return MINUS;
  return c;
};

// Fold a raw slice onto half-width. `String.replace` returns the same string
// untouched when nothing matches, so calling this unconditionally is cheap.
const FOLDABLE = /[\uFF01-\uFF5E\u3000\u2010-\u2015\u2212]/g;
const foldChars = (text) =>
  text.replace(FOLDABLE, (c) => String.fromCharCode(canonicalCode(c.charCodeAt(0))));

const tryParse = (text) => {
  try {
    return { ok: true, value: JSON.parse(text), error: null };
  } catch (error) {
    return { ok: false, value: undefined, error: error instanceof Error ? error.message : String(error) };
  }
};

/* R-8 --------------------------------------------------------------------- */
// BOM, zero-width joiners and non-breaking spaces: invisible, and never
// meaningful in JSON structure, so they are stripped globally.
const normalizeInvisible = (text) =>
  text
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B\u200C\u2060\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ');

/* R-17 -------------------------------------------------------------------- */
// Handled inside the scanner, not globally. U+FF01..U+FF5E are the FULL-WIDTH
// forms of ASCII 0x21..0x7E — `｛＂ａ＂：１｝`, typed with a CJK IME in the wrong
// mode. Converting them globally would corrupt Chinese content that legitimately
// uses full-width punctuation (`"张三：测试"`), so the scanner converts them
// only in STRUCTURAL positions and inside a KEY, never inside a value.

/* R-1 --------------------------------------------------------------------- */
const stripCodeFence = (text) => {
  const match = /```[ \t]*[A-Za-z0-9_-]*[ \t]*\r?\n?([\s\S]*?)```/.exec(text);
  return match ? match[1] : null;
};

/* Bracket matching, shared by R-2 and R-10 -------------------------------- */
const matchBalanced = (text, start) => {
  if (start < 0) return -1;
  const open = text[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let quote = null;

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return i + 1; // exclusive end
    }
  }
  return -1; // unbalanced -> truncated input
};

/* R-2 --------------------------------------------------------------------- */
// Collect every balanced container, then prefer the largest one that parses.
// This is what stops `Objects use {} syntax, here: {"a":1}` from answering `{}`.
const MAX_CANDIDATES = 400;

const bestCandidate = (...texts) => {
  let best = null;
  let bestScore = -1;

  for (const text of texts) {
    const found = [];
    for (let i = 0; i < text.length && found.length < MAX_CANDIDATES; i += 1) {
      const ch = text[i];
      if (ch !== '{' && ch !== '[') continue;
      const end = matchBalanced(text, i);
      if (end > 0) found.push(text.slice(i, end));
    }

    for (const candidate of found) {
      if (!tryParse(candidate).ok) continue;
      // Prefer a non-empty container, then the longest: the real payload is
      // almost always bigger than an illustrative `{}` in the prose.
      const score = (/[^\s[\]{}]/.test(candidate) ? 1_000_000 : 0) + candidate.length;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
  }

  return best;
};

/* R-10 -------------------------------------------------------------------- */
// NDJSON / concatenated objects. Returns null unless every top-level value in
// the text parses on its own, so prose that merely contains JSON is rejected
// and left to R-2.
const splitTopLevelValues = (text) => {
  const parts = [];
  const n = text.length;
  let i = 0;

  while (i < n) {
    while (i < n && isWhitespace(text[i])) i += 1;
    if (i >= n) break;

    const ch = text[i];
    if (ch === '{' || ch === '[') {
      const end = matchBalanced(text, i);
      if (end < 0) return null;
      parts.push(text.slice(i, end));
      i = end;
      continue;
    }

    const primitive = /^(?:-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|"(?:[^"\\]|\\.)*"|true|false|null)/.exec(
      text.slice(i),
    );
    if (!primitive) return null;
    parts.push(primitive[0]);
    i += primitive[0].length;
  }

  return parts.length > 0 ? parts : null;
};

// R-10 proper: wrap a run of complete values into one array. Null unless every
// part parses on its own, so prose that merely contains JSON is rejected here and
// left to R-2.
const tryWrapTopLevel = (text) => {
  const parts = splitTopLevelValues(text);
  if (parts && parts.length > 1 && parts.every((part) => tryParse(part).ok)) {
    return `[${parts.join(',')}]`;
  }
  return null;
};

/* R-18 -------------------------------------------------------------------- */
// A cut-off document, not a mis-written one: the model ran out of tokens, the
// stream dropped, the clipboard selection was short. Nothing is missing in the
// middle, so the repair is to finish the tail — close what is still open and
// discard at most one half-written token.
//
// This has to be attempted BEFORE R-2. R-2 searches for "the largest balanced
// container that parses", which on `{"users": [{"name": "John"}, {"name": "Jane",`
// finds the inner `{"name": "John"}` and answers with that: a perfectly plausible
// object that quietly throws away the rest of the document. Completing the text
// is the only repair that keeps the user's data.
//
// Every candidate is verified with JSON.parse before it is accepted, so a wrong
// guess can never reach the output.
const MAX_TRUNCATION_CUTS = 12;

const BRACKET_CLOSE = { '{': '}', '[': ']' };

const closersFor = (stack) => {
  let out = '';
  for (let i = stack.length - 1; i >= 0; i -= 1) out += BRACKET_CLOSE[stack[i].ch];
  return out;
};

// One left-to-right pass recording the still-open containers and the last few
// positions at which a complete value ended. Those positions are the only places
// a cut-off document may be cut without inventing content, and only the tail ones
// are kept — the cut is by definition near the end, so the record is a small ring
// rather than a list that would grow with the document.
const scanStructure = (text) => {
  const stack = []; // { ch, at } for every unmatched opening bracket
  const cuts = []; // { end, closers } right after a complete value
  let quote = null;

  const record = (end) => {
    if (cuts.length === MAX_TRUNCATION_CUTS) cuts.shift();
    cuts.push({ end, closers: closersFor(stack) });
  };

  const n = text.length;
  let i = 0;

  while (i < n) {
    const ch = text[i];

    if (quote) {
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === quote) {
        quote = null;
        record(i + 1);
      }
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      i += 1;
      continue;
    }

    if (ch === '{' || ch === '[') {
      stack.push({ ch, at: i });
      i += 1;
      continue;
    }

    if (ch === '}' || ch === ']') {
      if (stack.length) stack.pop();
      record(i + 1);
      i += 1;
      continue;
    }

    if (ch === '-' || isDigit(ch)) {
      let j = i + 1;
      while (j < n && isNumberChar(text.charCodeAt(j))) j += 1;
      record(j);
      i = j;
      continue;
    }

    if (isWordChar(text.charCodeAt(i))) {
      let j = i + 1;
      while (j < n && isWordChar(text.charCodeAt(j))) j += 1;
      record(j);
      i = j;
      continue;
    }

    i += 1;
  }

  return { stack, cuts, quote };
};

// `{"a"` / `{"a":` / `[{"b"` — a key that never got its value can never parse and
// no value may be invented for it, so the key and its separator are dropped.
const TRAILING_KEY = /"(?:[^"\\]|\\.)*"?$|'(?:[^'\\]|\\.)*'?$/;

const stripDanglingKey = (text) => {
  const trimmed = text.replace(/[\s:]+$/, '');
  const match = TRAILING_KEY.exec(trimmed);
  if (!match) return null;

  const cut = trimmed.length - match[0].length;
  let before = cut - 1;
  while (before >= 0 && isWhitespace(text[before])) before -= 1;
  // It is only a key if it sits directly after an opening bracket or a comma;
  // otherwise it was a value and some other repair should handle it.
  if (before < 0 || (text[before] !== '{' && text[before] !== ',')) return null;

  const prefix = text.slice(0, text[before] === ',' ? before : cut);
  return `${prefix}${closersFor(scanStructure(prefix).stack)}`;
};

const KEYWORDS = ['true', 'false', 'null'];

// A keyword cut well past its first characters ("tru", "fals", "nul") is
// completed rather than passed through as a string. Shorter fragments ("t", "n")
// are deliberately left alone: those really could be a string being typed, and
// guessing "null" for an "n" would be a worse answer than leaving it visible.
// R-16 has usually already wrapped the fragment in quotes by the time this runs,
// hence the optional quotes.
const KEYWORD_TAIL = /(^|[\s:,{\[])"?(tru|fals|nul)"?$/;

const closeKeyword = (text) => {
  const match = KEYWORD_TAIL.exec(text);
  if (!match) return null;

  const full = KEYWORDS.find((word) => word.startsWith(match[2]));
  if (!full) return null;

  const head = text.slice(0, match.index + match[1].length);
  return `${head}${full}${closersFor(scanStructure(head).stack)}`;
};

// Candidates are generated most-specific-first, so the first one that parses is
// both the most conservative reading and the one that keeps the most data.
const completeValue = (tail, scan) => {
  const { stack, cuts, quote } = scan;
  const closers = closersFor(stack);

  const attempts = [
    // 1. Complete a keyword that was cut in half — the only case where dropping
    //    the tail would lose information that is plainly recoverable.
    closeKeyword(tail),

    // 2. Finish the open string, then close every bracket. Keeps the partial
    //    value, which is normally what the user wants to inspect.
    `${tail}${quote || ''}${closers}`,
  ];

  // 3. Retract to where the last complete value ended. This is what handles a
  //    dangling comma, a half-written number or a swallowed trailer.
  for (let i = cuts.length - 1; i >= 0; i -= 1) {
    attempts.push(`${tail.slice(0, cuts[i].end)}${cuts[i].closers}`);
  }

  // 4. Drop a key that never got a value.
  attempts.push(stripDanglingKey(tail));

  return attempts.find((attempt) => attempt != null && tryParse(attempt).ok) ?? null;
};

const completeTruncation = (text) => {
  const scan = scanStructure(text);
  if (!scan.stack.length) return null; // nothing left open -> not a cut-off document

  // Everything before the earliest unmatched container is intact, so only the
  // tail is ever modified.
  const cut = scan.stack[0].at;
  if (cut === 0) return completeValue(text, scan);

  const head = text.slice(0, cut);
  const tail = text.slice(cut);
  const completed = completeValue(tail, scanStructure(tail));
  return completed == null ? null : head + completed;
};

/* R-3 ~ R-9, R-11 ~ R-16 -------------------------------------------------- */
// One pass with a small grammar state machine: `prev` is the kind of the last
// token emitted, and `stack` records the enclosing containers. That is enough
// to know when a comma is missing, when `=` is standing in for `:`, and when a
// bare word is an unquoted value rather than prose.
const rewriteTokens = (source, mark) => {
  let out = '';
  let i = 0;
  const n = source.length;
  let quote = null; // active string closer, matched against RAW source chars
  let quoteIsKey = false; // role of the string currently being read
  let quoteSingle = false; // opened by a single quote (half or full width)
  let prev = 'none'; // none | open | comma | colon | key | value
  const stack = [];

  const insertCommaIfMissing = () => {
    if (prev === 'value' && stack.length > 0) {
      // Put the comma BEFORE any whitespace already emitted, so the result reads
      // `{"a":1, "b":2}` rather than the valid-but-ugly `{"a":1 ,"b":2}`.
      const trailing = /[ \t\n\r\f]*$/.exec(out)[0];
      out = `${out.slice(0, out.length - trailing.length)},${trailing}`;
      mark(11);
      prev = 'comma';
    }
  };

  while (i < n) {
    const rawCh = source[i]; // untouched source char, used for delimiter matching
    let ch = rawCh;
    let code = source.charCodeAt(i);

    /* ---- inside a string literal ---- */
    if (quote) {
      if (code === BACKSLASH) {
        const next = source[i + 1];
        if (next === undefined) {
          out += '\\';
          i += 1;
        } else if (next === "'" || next === '\uFF07') {
          out += "'"; // \' is never a legal JSON escape
          mark(13);
          i += 2;
        } else if (next === 'u') {
          out += source.slice(i, i + 6);
          i += 6;
        } else if (VALID_ESCAPES.includes(next)) {
          out += ch + next;
          i += 2;
        } else {
          out += next; // stray backslash -> drop it
          mark(13);
          i += 2;
        }
        continue;
      }
      if (ch === quote) {
        out += '"'; // strings always close with a double quote
        quote = null;
        // Role comes from when the string OPENED, so a quoted key stays a key
        // and a following `=` can still be recognised (R-15).
        prev = quoteIsKey ? 'key' : 'value';
        i += 1;
        continue;
      }
      if (quoteSingle && code === QUOTE) {
        out += '\\"';
        mark(4);
        i += 1;
        continue;
      }

      // Canonical char for content handling. Full-width is converted only inside
      // a KEY: in a value it is far more likely to be real content.
      let bodyCh = ch;
      let bodyCode = code;
      if (quoteIsKey) {
        const folded = canonicalCode(bodyCode);
        if (folded !== bodyCode) {
          bodyCode = folded;
          bodyCh = String.fromCharCode(folded);
          mark(17);
        }
      }

      if (bodyCode < SPACE) {
        out += CONTROL_ESCAPES[bodyCode] ?? `\\u${bodyCode.toString(16).padStart(4, '0')}`;
        mark(bodyCode === LF || bodyCode === CR ? 9 : 13);
        i += 1;
        continue;
      }
      out += bodyCh;
      i += 1;
      continue;
    }

    /* ---- outside a string ---- */

    // R-17 (structural) — full-width ASCII and other look-alikes must be folded
    // back before any branch looks at the char, otherwise `｛` is not a brace.
    if (code >= 0xff01 && code <= 0xff5e) {
      code -= 0xfee0;
      ch = String.fromCharCode(code);
      mark(17);
    } else if (code === 0x3000) {
      code = SPACE;
      ch = ' ';
      mark(17);
    } else if ((code >= 0x2010 && code <= 0x2015) || code === 0x2212) {
      code = MINUS; // hyphen / en dash / em dash / minus sign
      ch = '-';
      mark(17);
    }

    // whitespace (the most common character in a pretty-printed document)
    if (code === SPACE || code === TAB || code === LF || code === CR || code === 12) {
      out += ch;
      i += 1;
      continue;
    }

    // R-6 comments
    if (code === SLASH) {
      const next = source[i + 1];
      if (next === '/') {
        mark(6);
        i += 2;
        while (i < n && source.charCodeAt(i) !== LF) i += 1;
        continue;
      }
      if (next === '*') {
        mark(6);
        i += 2;
        while (i < n && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
        i += 2;
        continue;
      }
    }

    // containers
    if (code === LBRACE || code === LBRACKET) {
      insertCommaIfMissing();
      out += ch;
      stack.push(ch);
      prev = 'open';
      i += 1;
      continue;
    }
    if (code === RBRACE || code === RBRACKET) {
      // A separator that never got a value after it (`{1,,}`: the first comma
      // was emitted, then the stray one was dropped) is now dangling. Remove it
      // silently — whichever comma was at fault has already been reported.
      if (prev === 'comma') out = out.replace(/,[\s]*$/, '');
      out += ch;
      stack.pop();
      prev = 'value';
      i += 1;
      continue;
    }

    // R-12 empty element is checked BEFORE R-3: for `{1,,}` the first comma is
    // the real separator, so the second one is the stray one.
    if (code === COMMA) {
      if (prev === 'comma' || prev === 'open') {
        mark(12);
        i += 1;
        continue;
      }
      let j = i + 1;
      while (j < n && isWhitespace(source[j])) j += 1;
      const after = canonicalCode(source.charCodeAt(j));
      if (after === RBRACE || after === RBRACKET) {
        mark(3);
        i += 1;
        continue;
      }
      out += ch;
      prev = 'comma';
      i += 1;
      continue;
    }

    // R-15 "=" used where ":" belongs
    if (code === EQUALS && prev === 'key') {
      out += ':';
      prev = 'colon';
      mark(15);
      i += 1;
      if (source.charCodeAt(i) === GT) i += 1; // tolerate `=>`
      continue;
    }

    if (code === COLON) {
      out += ch;
      prev = 'colon';
      i += 1;
      continue;
    }

    // numbers (kept verbatim so large integers never lose precision)
    if (
      (code >= ZERO && code <= NINE) ||
      (code === MINUS && isDigit(String.fromCharCode(canonicalCode(source.charCodeAt(i + 1)))))
    ) {
      insertCommaIfMissing();
      let j = i + 1;
      let folded = source.charCodeAt(i) !== code;
      while (j < n) {
        const raw = source.charCodeAt(j);
        const c = raw < 0x80 ? raw : canonicalCode(raw);
        if (
          (c >= ZERO && c <= NINE) ||
          c === PLUS ||
          c === MINUS ||
          c === DOT ||
          c === LOWER_E ||
          c === UPPER_E
        ) {
          if (c !== raw) folded = true;
          j += 1;
        } else {
          break;
        }
      }
      const run = source.slice(i, j);
      out += folded ? foldChars(run) : run;
      prev = 'value';
      i = j;
      continue;
    }

    // R-4 / R-8 string opener (double, single, or smart quote)
    const smartCloser =
      code === 0x201c || code === 0x201d
        ? '\u201D'
        : code === 0x2018 || code === 0x2019
          ? '\u2019'
          : null;

    // A letter-quote-letter apostrophe (Here's, don't, it's) is a contraction in
    // surrounding prose, not a string delimiter. Treating it as one swallows the
    // real payload and leaves the tool answering with an example `{}` instead.
    if (code === APOS) {
      const before = source.charCodeAt(i - 1);
      const after = source.charCodeAt(i + 1);
      const isLetter = (c) =>
        (c >= LOWER_A && c <= LOWER_Z) || (c >= UPPER_A && c <= UPPER_Z);
      if (isLetter(before) && isLetter(after)) {
        out += ch;
        i += 1;
        continue;
      }
    }

    if (code === QUOTE || code === APOS || smartCloser) {
      insertCommaIfMissing();
      const inObject = stack[stack.length - 1] === '{';
      quoteIsKey = inObject && (prev === 'open' || prev === 'comma');
      if (smartCloser) {
        mark(8);
        quote = smartCloser;
        quoteSingle = code === 0x2018 || code === 0x2019;
      } else {
        if (code === APOS) mark(4);
        // Match the delimiter against the RAW source char: a full-width `＂` was
        // just folded to `"`, but the closing character in the text is still `＂`.
        quote = rawCh;
        quoteSingle = code === APOS;
      }
      out += '"';
      prev = quoteIsKey ? 'key' : 'value';
      i += 1;
      continue;
    }

    // bare words: keys, Python literals, null-ish, unquoted values
    if (
      (code >= LOWER_A && code <= LOWER_Z) ||
      (code >= UPPER_A && code <= UPPER_Z) ||
      code === UNDERSCORE ||
      code === DOLLAR
    ) {
      let j = i + 1;
      let folded = source.charCodeAt(i) !== code;
      while (j < n) {
        const raw = source.charCodeAt(j);
        const c = raw < 0x80 ? raw : canonicalCode(raw);
        if (
          (c >= LOWER_A && c <= LOWER_Z) ||
          (c >= UPPER_A && c <= UPPER_Z) ||
          (c >= ZERO && c <= NINE) ||
          c === UNDERSCORE ||
          c === DOLLAR
        ) {
          if (c !== raw) folded = true;
          j += 1;
        } else {
          break;
        }
      }
      const identRun = source.slice(i, j);
      const word = folded ? foldChars(identRun) : identRun;

      const inObject = stack[stack.length - 1] === '{';
      const keyPosition = inObject && (prev === 'open' || prev === 'comma');
      const insideContainer = stack.length > 0;

      // R-5 keys may contain '-', '.' (e.g. `max-retries`).
      if (keyPosition) {
        let e = j;
        while (e < n) {
          const c = canonicalCode(source.charCodeAt(e));
          if (
            (c >= LOWER_A && c <= LOWER_Z) ||
            (c >= UPPER_A && c <= UPPER_Z) ||
            (c >= ZERO && c <= NINE) ||
            c === UNDERSCORE ||
            c === DOLLAR ||
            c === MINUS ||
            c === DOT
          ) {
            e += 1;
          } else {
            break;
          }
        }
        let f = e;
        while (f < n && isWhitespace(source[f])) f += 1;
        const separator = canonicalCode(source.charCodeAt(f));
        if (separator === COLON || separator === EQUALS) {
          out += `"${foldChars(source.slice(i, e))}"`;
          mark(5);
          prev = 'key';
          i = e;
          continue;
        }
      }

      // R-14
      if (insideContainer && prev === 'colon' && NULLISH[word]) {
        out += 'null';
        mark(14);
        prev = 'value';
        i = j;
        continue;
      }

      // R-7
      if (insideContainer && PY_LITERALS[word] && prev !== 'key') {
        insertCommaIfMissing();
        out += PY_LITERALS[word];
        mark(7);
        prev = 'value';
        i = j;
        continue;
      }

      // R-16: everything up to the next structural delimiter is one string. The
      // delimiter scan folds first, so a full-width `，` or `｝` still ends it.
      if (insideContainer && prev === 'colon') {
        insertCommaIfMissing();
        let e = i;
        while (e < n) {
          const c = canonicalCode(source.charCodeAt(e));
          if (c === COMMA || c === RBRACE || c === RBRACKET || c === COLON) break;
          e += 1;
        }
        const body = foldChars(source.slice(i, e).trimEnd());
        out += `"${body.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
        mark(16);
        prev = 'value';
        i += body.length; // trailing whitespace is re-emitted by the main loop
        continue;
      }

      // Prose, or something we must not rewrite — leave it for the parser.
      out += word;
      i = j;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
};

// Re-indenting a very large document would stall the browser — and the Ace
// editor cannot usefully render a megabyte of indented text anyway — so above
// this size the repaired text is returned as-is.
const MAX_PRETTY_LENGTH = 256 * 1024;

/* Pretty printing ---------------------------------------------------------- */
// Re-indent a VALID JSON document at the TEXT level. Deliberately not
// `JSON.stringify(JSON.parse(x), null, 2)`, which would silently rewrite the
// document: large integers lose precision (12345678901234567890 becomes
// ...567000), duplicate keys collapse, `1.0`/`1e2`/`-0` are normalised and
// numeric-looking keys get reordered. This pass only moves whitespace, so every
// literal survives byte-for-byte.
const prettify = (json, indent = '  ') => {
  let out = '';
  let depth = 0;
  let pad = '';
  let quote = null;
  let i = 0;
  const n = json.length;
  // Cached indent strings — one `repeat` per depth instead of per container.
  const pads = [''];
  const padFor = (d) => {
    while (pads.length <= d) pads.push(pads[pads.length - 1] + indent);
    return pads[d];
  };

  while (i < n) {
    const ch = json[i];

    if (quote) {
      if (ch === '\\') {
        out += ch + (json[i + 1] ?? '');
        i += 2;
        continue;
      }
      out += ch;
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }

    // Drop the old whitespace outside strings; we emit our own.
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i += 1;
      continue;
    }

    if (ch === '"') {
      quote = '"';
      out += ch;
      i += 1;
      continue;
    }

    if (ch === '{' || ch === '[') {
      let j = i + 1;
      while (j < n && isWhitespace(json[j])) j += 1;
      const close = ch === '{' ? '}' : ']';
      if (json[j] === close) {
        out += ch + close; // keep empty containers on one line
        i = j + 1;
        continue;
      }
      depth += 1;
      pad = padFor(depth);
      out += `${ch}\n${pad}`;
      i += 1;
      continue;
    }

    if (ch === '}' || ch === ']') {
      depth -= 1;
      pad = padFor(depth);
      out += `\n${pad}${ch}`;
      i += 1;
      continue;
    }

    if (ch === ',') {
      out += `,\n${pad}`;
      i += 1;
      continue;
    }

    if (ch === ':') {
      out += ': ';
      i += 1;
      continue;
    }

    // Copy a whole run of literal characters in one slice rather than one append
    // per character. Numbers, true/false/null and their separators live here.
    let j = i + 1;
    while (j < n) {
      const c = json.charCodeAt(j);
      if (
        c === QUOTE ||
        c === LBRACE ||
        c === RBRACE ||
        c === LBRACKET ||
        c === RBRACKET ||
        c === COMMA ||
        c === COLON ||
        c === SPACE ||
        c === TAB ||
        c === LF ||
        c === CR
      ) {
        break;
      }
      j += 1;
    }
    out += json.slice(i, j);
    i = j;
  }

  return out;
};

/* Error reporting (AC-D5) -------------------------------------------------- */
const positionOf = (message) => {
  const match = /position (\d+)/.exec(message || '');
  return match ? Number(match[1]) : null;
};

const signalsTruncation = (message) => /Unexpected end of (JSON input|input)/i.test(message || '');

const lineColumnOf = (text, position) => {
  let line = 1;
  let column = 1;
  for (let i = 0; i < position && i < text.length; i += 1) {
    if (text[i] === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
};

const hintFor = (message, truncated) => {
  if (truncated) {
    return 'The value is cut short — the outermost object or array is never closed. Paste the complete JSON and check for a missing final } or ].';
  }
  const token = /Unexpected token '?(.)'?/.exec(message || '');
  if (token) {
    const shown = token[1] === '\n' ? 'a line break' : `"${token[1]}"`;
    return `Unexpected ${shown} at that spot. The usual causes are a missing comma between two entries, a string that is never closed, or a stray character left over from a copy-paste.`;
  }
  return 'JSON.parse stopped there. Compare the characters immediately before that position against the JSON grammar.';
};

/**
 * Repair a broken JSON document using rules R-1 ~ R-17.
 *
 * @param {string} input
 * @param {{pretty?: boolean}} [options] `pretty` re-indents the result (default
 *   true). It only moves whitespace, so literals are never altered.
 * @returns {{
 *   status: 'empty'|'valid'|'fixed'|'failed',
 *   output: string,
 *   rules: Array<{id: string, label: string, count: number}>,
 *   error: {message: string, line: number|null, column: number|null, hint: string, truncated: boolean}|null,
 *   stats: {repairs: number}|null
 * }}
 */
export const fixJson = (input, options = {}) => {
  const { pretty = true } = options;
  const source = typeof input === 'string' ? input : '';
  const format = (text) =>
    pretty && text.length <= MAX_PRETTY_LENGTH ? prettify(text) : text;
  const hits = new Array(RULES.length + 1).fill(0);
  const mark = (ruleNumber) => {
    hits[ruleNumber] += 1;
  };

  if (!source.trim()) {
    return { status: 'empty', output: '', rules: [], error: null, stats: null };
  }

  const collectRules = () =>
    RULES.filter((rule) => hits[Number(rule.id.slice(2))] > 0).map((rule) => ({
      ...rule,
      count: hits[Number(rule.id.slice(2))],
    }));

  // Already valid: report it and leave the text untouched, so the tool never
  // reformats something the user did not ask to change.
  const direct = tryParse(source);
  if (direct.ok) {
    return {
      status: 'valid',
      output: format(source),
      rules: [],
      error: null,
      stats: { repairs: 0 },
    };
  }

  let text = source;

  const invisibleFixed = normalizeInvisible(text);
  if (invisibleFixed !== text) {
    mark(8);
    text = invisibleFixed;
  }

  const unfenced = stripCodeFence(text);
  if (unfenced != null) {
    mark(1);
    text = unfenced;
  }

  text = rewriteTokens(text, mark);

  let parsed = tryParse(text);
  if (!parsed.ok) {
    // R-18 runs first: a cut-off document can only be repaired by completing it,
    // and R-2/R-10 would otherwise answer with a fragment and silently drop the
    // rest of the user's data.
    const completed = completeTruncation(text);
    if (completed != null) {
      if (tryParse(completed).ok) {
        mark(18);
        text = completed;
      } else {
        const wrapped = tryWrapTopLevel(completed);
        if (wrapped != null) {
          // A cut-off NDJSON stream: the last record was completed, the earlier
          // complete ones still need wrapping.
          mark(18);
          mark(10);
          text = wrapped;
        } else {
          const extracted = bestCandidate(completed);
          if (extracted != null && tryParse(extracted).ok) {
            mark(18);
            mark(2);
            text = extracted;
          }
        }
      }
    }
  }

  parsed = tryParse(text);
  if (!parsed.ok) {
    // R-10 before R-2: when the input is several complete values, wrapping them
    // all is right and extracting only the first would silently drop data.
    const wrapped = tryWrapTopLevel(text);
    if (wrapped != null) {
      mark(10);
      text = wrapped;
    } else {
      // Try the rewritten text first, then the original: if the scanner had to
      // swallow something, the untouched source still holds the real payload.
      const candidate = bestCandidate(text, source);
      if (candidate && candidate.trim() !== text.trim()) {
        mark(2);
        text = candidate;
      }
    }
    parsed = tryParse(text);
  }

  const rules = collectRules();
  const repairs = rules.reduce((total, rule) => total + rule.count, 0);

  if (parsed.ok) {
    return {
      status: 'fixed',
      output: format(text),
      rules,
      error: null,
      stats: { repairs },
    };
  }

  // AC-D5: never claim success. Locate the problem in what the user pasted.
  // V8 reports "Unexpected end of JSON input" without a position, so truncated
  // input is located at the end of the text instead of losing the location.
  const openIndex = source.search(/[{[]/);
  const truncation =
    signalsTruncation(direct.error) || (openIndex >= 0 && matchBalanced(source, openIndex) < 0);
  const position = positionOf(direct.error) ?? (truncation ? source.length : null);
  const { line, column } =
    position == null ? { line: null, column: null } : lineColumnOf(source, position);

  const error = {
    message: direct.error,
    line,
    column,
    truncated: truncation,
    hint: hintFor(direct.error, truncation),
  };

  // The location and the hint travel inside the result text so the output panel
  // stays the single place that reports a failure (house tool layout has nothing
  // rendered below the editor).
  const location = line == null ? null : `Around line ${line}, column ${column}.`;

  return {
    status: 'failed',
    output: [`Error: ${error.message}`, location, error.hint].filter(Boolean).join('\n\n'),
    rules,
    error,
    stats: { repairs },
  };
};

export default fixJson;
