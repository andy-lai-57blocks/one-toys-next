// Long-form page content for tool pages, rendered by
// <ToolPageContent path="..." /> below the tool itself.
//
// Why this exists: tool pages used to ship with no body copy at all, which is
// why Google indexed them but never ranked them for real queries — there was
// nothing on the page to judge relevance against. The copy here is deliberately
// short and sits *below* the tool, so the tool stays the main subject of the
// page while search engines (and the people who type the questions in `faq`)
// get something to work with.
//
// Keyed by the same route paths as seoData.js. Add an entry to publish content
// for a page; pages without an entry render nothing extra.

/**
 * @typedef {Object} ToolSection
 * @property {string} title
 * @property {string[]} paragraphs
 * @property {string[]} [bullets]
 *
 * @typedef {Object} ToolFaqItem
 * @property {string} question
 * @property {string | string[]} answer
 *
 * @typedef {Object} ToolRelatedItem
 * @property {string} path
 * @property {string} title
 * @property {string} [description]
 *
 * @typedef {Object} ToolContent
 * @property {ToolSection[]} sections
 * @property {ToolFaqItem[]} [faq]
 * @property {ToolRelatedItem[]} [related]
 */

/** @type {Record<string, ToolContent>} */
export const toolContent = {
  '/code/jwt-decoder': {
    sections: [
      {
        title: 'What this JWT decoder shows you',
        paragraphs: [
          'Paste a JSON Web Token and the decoder splits it into its three parts — header, payload and signature — then renders the header and payload as readable JSON. Everything happens in your browser using the built-in Base64URL and JSON functions, so the token is never uploaded.',
          'Standard claims are annotated in plain English (iss, sub, aud, exp, iat and the rest), date claims are shown as both a local time and a relative one such as "expires in 2 hours", and risky settings are flagged — an unsigned alg=none header, a missing exp, an unusually long lifetime, or a token that has already expired.'
        ]
      },
      {
        title: 'A JWT is encoded, not encrypted',
        paragraphs: [
          'This is the single most important thing to understand about JWTs. The header and payload are Base64URL-encoded, which is a transport format, not a security measure — anyone holding the token can read every claim without any key.',
          'The signature protects integrity, not secrecy. It proves the token was issued by whoever holds the signing key and that the payload has not been altered, but it does not hide the payload. So never put passwords, personal data or API keys inside a JWT, and treat a token with the same care as a password when you copy it around. Decoding needs no key, which is exactly why this tool can do all of its work locally.'
        ]
      },
      {
        title: 'What to check before you trust a token',
        paragraphs: [
          'Decoding a token proves nothing about whether it is valid — you still have to verify the signature before trusting any claim. Beyond that, four checks catch most problems:'
        ],
        bullets: [
          'alg — reject anything that says alg=none (unsigned). For public clients prefer an asymmetric algorithm such as RS256 or ES256, where the verifier only needs the public key.',
          'exp / nbf / iat — has the token expired, or is it not valid yet? Small clock differences between issuer and verifier are common, which is why the decoder shows the relative time.',
          'iss / aud — did the token come from the issuer you expect, and is it addressed to your API? A token minted for a different service should be rejected even if its signature is valid.',
          "signature — verify it with the shared secret (HS256/HS384/HS512) or the issuer's public key (RS256/ES256) before you read a single claim as truth."
        ]
      }
    ],
    faq: [
      {
        question: 'Is a JWT encrypted?',
        answer:
          'No. A JWT is Base64URL-encoded, not encrypted. The header and payload can be read by anyone who has the token, with no key required. The signature guarantees the token has not been tampered with and was issued by the holder of the signing key — it does not make the contents secret. Never store passwords, personal data or API keys inside a JWT payload.'
      },
      {
        question: 'Is my token uploaded to a server?',
        answer:
          'No. Decoding and signature verification both run inside your browser using the Web Crypto API and the built-in Base64 and JSON functions. No request is made, so the token never leaves your device. You can confirm this yourself in the browser DevTools Network tab: paste a token and nothing appears.'
      },
      {
        question: 'Can I verify the signature here?',
        answer:
          'Yes, locally. Paste the shared secret to verify HMAC tokens (HS256, HS384, HS512), or the issuer\u2019s public key in PEM format to verify RS256 and ES256 tokens. Verification runs in the browser with Web Crypto, so neither the secret nor the key is transmitted.'
      },
      {
        question: 'What does alg=none mean?',
        answer:
          'It means the token is not signed at all. A server that accepts it cannot tell a genuine token from a forged one, so anyone can rewrite the payload. alg=none is a well-known vulnerability and a correct verifier rejects it. If a token uses it, the decoder flags it as high risk.'
      },
      {
        question: 'What do the standard JWT claims mean?',
        answer:
          'iss is who issued the token, sub is who it is about, aud is who it is for, exp is when it expires, nbf is the earliest time it becomes valid, iat is when it was issued, and jti is a unique id used for revocation. The decoder annotates each one and shows the date claims in your local time.'
      },
      {
        question: 'Why does my token show as expired?',
        answer:
          'Because its exp claim is in the past. That is normal for access tokens, which are deliberately short-lived — often 5 to 60 minutes. Request a fresh one with a refresh token. If exp looks wrong, check the issuer\u2019s clock: JWTs use UTC seconds, and clock skew between machines is a common cause.'
      }
    ],
    related: [
      { path: '/code/json', title: 'JSON Formatter', description: 'pretty-print the decoded header or payload' },
      { path: '/code/json-fixer', title: 'JSON Fixer', description: 'repair malformed JSON you pasted by mistake' },
      { path: '/code/base64', title: 'Base64 Encoder/Decoder', description: 'inspect the Base64URL segments by hand' },
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'work with the URL-safe characters in a token' },
      { path: '/code/uuid', title: 'UUID Generator', description: 'create ids for jti and other claims' },
      { path: '/code/password', title: 'Password Generator', description: 'make strong secrets for HS256 signing' }
    ]
  },

  '/code/json': {
    sections: [
      {
        title: 'What this JSON formatter does',
        paragraphs: [
          'Paste JSON and the tool pretty-prints it with indentation and syntax highlighting, minifies it to the smallest valid form, or validates it and points at the first problem. It also reverses the common escapes you run into when copying data around: JSON string escapes, HTML entities, URL encoding and \\uXXXX sequences, via the Smart Unescape button.',
          'Everything runs in your browser, so API responses, config files and tokens are never uploaded.'
        ]
      },
      {
        title: 'Format, minify, validate',
        paragraphs: [
          'The three buttons answer different questions, and it helps to know which one you want:',
        ],
        bullets: [
          'Format (pretty-print) adds newlines and indentation so a human can read the structure. Use it for debugging and for reviewing API responses.',
          'Minify removes every unnecessary space and newline, producing the smallest valid text. Use it before embedding JSON in a query string, a config value or a payload you pay to transfer.',
          'Validate only checks syntax and reports the first error with its position. It does not change your data.'
        ]
      }
    ],
    faq: [
      {
        question: 'What makes JSON invalid?',
        answer:
          'The usual suspects are a trailing comma after the last item, single quotes instead of double quotes, unquoted keys, comments, and an unescaped control character inside a string. JSON is stricter than the JavaScript that many people write by hand. If you already have broken JSON, the JSON Fixer can repair most of these automatically.'
      },
      {
        question: 'Does it support JSON5, JSONC or NDJSON?',
        answer:
          'Strict JSON only. Comments, trailing commas and single quotes are valid in JSON5 and JSONC but not in JSON, so a validator will reject them. The JSON Fixer can strip those extras if you need to convert them to standard JSON.'
      },
      {
        question: 'Is my JSON uploaded anywhere?',
        answer:
          'No. Parsing, formatting and validation all happen in your browser with the built-in JSON parser. Nothing is sent over the network, which you can confirm in the DevTools Network tab.'
      },
      {
        question: 'What is the difference between formatting and minifying?',
        answer:
          'Formatting adds whitespace to make the structure readable; minifying removes all optional whitespace to make the text as small as possible. The data is identical in both cases.'
      }
    ],
    related: [
      { path: '/code/json-fixer', title: 'JSON Fixer', description: 'repair invalid JSON before formatting it' },
      { path: '/code/json-escaper', title: 'JSON Escaper', description: 'escape and unescape JSON string values' },
      { path: '/code/xml', title: 'XML Formatter', description: 'the same treatment for XML documents' },
      { path: '/code/jwt-decoder', title: 'JWT Decoder', description: 'read the JSON payload inside a token' },
      { path: '/code/base64', title: 'Base64 Encoder/Decoder', description: 'decode base64 that wraps JSON' }
    ]
  },

  '/code/json-fixer': {
    sections: [
      {
        title: 'What this JSON fixer repairs',
        paragraphs: [
          'Paste JSON that will not parse and the fixer makes the safe corrections that turn it back into valid JSON: it strips Markdown code fences, removes // and /* */ comments, drops trailing commas, converts single-quoted strings and keys to double quotes, and recovers the JSON object from the prose around it.',
        ]
      },
      {
        title: 'Built for model output',
        paragraphs: [
          'Language models routinely wrap JSON in explanation, fence it with triple backticks, or add a trailing comma. That output is not valid JSON, but it is usually recoverable, and this tool is tuned for exactly that shape of input.',
          'The fixer only makes changes that preserve meaning. If a value is genuinely ambiguous it reports an error rather than guessing, so you can trust that a successful repair did not silently change your data.'
        ]
      }
    ],
    faq: [
      {
        question: 'Can it fix JSON that a language model produced?',
        answer:
          'Yes, that is the main use case. It removes code fences, surrounding explanation, comments and trailing commas, and converts Python-style single quotes, which covers almost everything an LLM adds around otherwise valid JSON.'
      },
      {
        question: 'What will it not fix?',
        answer:
          'It will not invent missing data or repair text that was never valid JSON, such as unquoted keys with spaces, truncated objects or prose that merely mentions JSON. When a fix would require guessing, the tool reports an error instead of producing something wrong.'
      },
      {
        question: 'How is this different from the JSON Formatter?',
        answer:
          'The JSON Formatter assumes valid input and makes it readable. The JSON Fixer assumes invalid input and makes it valid. In practice you fix first, then format.'
      },
      {
        question: 'Is my data uploaded?',
        answer:
          'No. The repair runs entirely in your browser. This matters here more than usual, because the broken JSON people paste often contains API keys or production data.'
      }
    ],
    related: [
      { path: '/code/json', title: 'JSON Formatter', description: 'pretty-print the repaired result' },
      { path: '/code/json-escaper', title: 'JSON Escaper', description: 'escape strings for embedding in JSON' },
      { path: '/code/jwt-decoder', title: 'JWT Decoder', description: 'decode the JSON payload of a token' },
      { path: '/code/base64', title: 'Base64 Encoder/Decoder', description: 'decode base64-wrapped JSON' },
      { path: '/code/gzip', title: 'Gzip Compression', description: 'decompress gzipped API responses' }
    ]
  },

  '/code/xml': {
    sections: [
      {
        title: 'What this XML formatter does',
        paragraphs: [
          'Paste XML to pretty-print it with proper indentation, minify it, or validate that it is well-formed. The formatter keeps CDATA sections and attributes intact and highlights the structure so you can find the element you need in a large document.',
        ]
      },
      {
        title: 'Well-formed is not the same as valid',
        paragraphs: [
          'This tool checks that the document is well-formed: tags balance, attributes are quoted, and there is exactly one root element. It does not validate against a schema (XSD or DTD), so a document can be perfectly well-formed and still not match the schema your application expects.'
        ]
      }
    ],
    faq: [
      {
        question: 'What is the difference between well-formed and valid XML?',
        answer:
          'Well-formed means the syntax is correct: every tag is closed and nested properly. Valid means the document also conforms to a schema such as an XSD or DTD. This formatter checks well-formedness, which is what most day-to-day debugging needs.'
      },
      {
        question: 'Does it handle namespaces and CDATA?',
        answer:
          'Yes. Namespaced elements and attributes are preserved as written, and CDATA sections are kept intact rather than being escaped or reformatted.'
      },
      {
        question: 'Why does my XML fail to parse?',
        answer:
          'The most common causes are an unescaped ampersand (&) or angle bracket in text, mismatched tags, and multiple root elements. Escape stray ampersands as &amp; and check that every opening tag has a matching close.'
      },
      {
        question: 'Is my XML uploaded?',
        answer:
          'No. Formatting and validation happen entirely in your browser, so configuration files and API payloads stay on your device.'
      }
    ],
    related: [
      { path: '/code/xml-escaper', title: 'XML Escaper', description: 'escape the characters that break XML' },
      { path: '/code/vast', title: 'VAST Formatter', description: 'format and validate VAST video ad XML' },
      { path: '/code/html', title: 'HTML Encoder/Decoder', description: 'encode and decode HTML entities' },
      { path: '/code/json', title: 'JSON Formatter', description: 'the JSON equivalent of this tool' },
      { path: '/code/base64', title: 'Base64 Encoder/Decoder', description: 'decode base64-encoded XML' }
    ]
  },

  '/code/vast': {
    sections: [
      {
        title: 'What this VAST formatter does',
        paragraphs: [
          'Paste a VAST document to pretty-print it, minify it, or check that it is well-formed. VAST (Video Ad Serving Template) is the XML dialect that ad servers and video players use to describe an ad: which media files to play, how long they are, when to fire tracking beacons, and what to show if the ad fails.',
        ]
      },
      {
        title: 'Supported versions',
        paragraphs: [
          'The formatter handles VAST 2.0, 3.0 and 4.0. It formats and validates the XML structure; it does not fetch the ad tag or play the creative, so you can inspect a tag without any network request leaving your browser.'
        ]
      }
    ],
    faq: [
      {
        question: 'What is VAST?',
        answer:
          'VAST (Video Ad Serving Template) is an XML schema published by the IAB that standardises communication between an ad server and a video player. A VAST tag or document tells the player which creative to play and which tracking URLs to call.'
      },
      {
        question: 'Does this tool request the ad tag over the network?',
        answer:
          'No. It only formats the XML you paste. It never fetches the tag, so tracking pixels are not fired and nothing leaves your browser, which makes it safe for inspecting live tags.'
      },
      {
        question: 'Which VAST versions are supported?',
        answer:
          'VAST 2.0, 3.0 and 4.0. Newer tags usually remain structurally compatible, and the formatter will still pretty-print them.'
      },
      {
        question: 'What is the difference between VAST and VPAID?',
        answer:
          'VAST describes what to play; VPAID is an older JavaScript interface that let the creative control the player. VPAID is deprecated in favour of SIMID, and this tool focuses on the VAST XML.'
      }
    ],
    related: [
      { path: '/code/xml', title: 'XML Formatter', description: 'format any XML document' },
      { path: '/code/xml-escaper', title: 'XML Escaper', description: 'escape special characters in VAST text' },
      { path: '/media/hls', title: 'HLS Stream Player', description: 'play and inspect the video stream itself' },
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'decode the parameters inside an ad tag URL' },
      { path: '/code/json', title: 'JSON Formatter', description: 'format JSON ad API responses' }
    ]
  },

  '/code/base64': {
    sections: [
      {
        title: 'What Base64 encoding is for',
        paragraphs: [
          'Base64 turns arbitrary bytes into plain ASCII text so they can travel through systems that only handle text: email attachments, JSON fields, HTTP headers, data URLs and configuration values. The text is about 33% larger than the original bytes, which is the price of that safety.',
        ]
      },
      {
        title: 'It is encoding, not encryption',
        paragraphs: [
          'Base64 is reversible by anyone, with no key. It hides nothing, so never use it to protect a password, a token or personal data. If you need secrecy, encrypt first and then Base64-encode the ciphertext.'
        ]
      }
    ],
    faq: [
      {
        question: 'Is Base64 encryption?',
        answer:
          'No. Base64 is a reversible encoding, not a cipher. Anyone can decode it without a key, so it provides no confidentiality. Use it for transport safety, not for protecting secrets.'
      },
      {
        question: 'Why does my Base64 output end with one or two equals signs?',
        answer:
          'Those are padding characters. Base64 works in blocks of four characters, so when the input length is not a multiple of three the encoder adds = signs to fill the last block. Padding is optional in some contexts and required in others.'
      },
      {
        question: 'What is the difference between +/ and -_ in Base64?',
        answer:
          'Standard Base64 uses + and /. The URL-safe variant, called Base64URL, replaces them with - and _ so the result can be used inside a URL or a filename without escaping. JWTs use Base64URL.'
      },
      {
        question: 'Does Base64 make my data smaller?',
        answer:
          'No, it makes it about a third larger. If your goal is size, compress the data first with gzip and then Base64-encode the compressed bytes.'
      }
    ],
    related: [
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'percent-encode text for use in URLs' },
      { path: '/code/gzip', title: 'Gzip Compression', description: 'compress before encoding to cut the size' },
      { path: '/code/jwt-decoder', title: 'JWT Decoder', description: 'decode Base64URL segments in a token' },
      { path: '/code/json-escaper', title: 'JSON Escaper', description: 'escape strings for JSON payloads' },
      { path: '/code/html', title: 'HTML Encoder/Decoder', description: 'encode HTML entities' }
    ]
  },

  '/code/url': {
    sections: [
      {
        title: 'What URL encoding is for',
        paragraphs: [
          'URLs may only contain a limited set of characters. Anything outside that set, such as a space, an ampersand that is part of a value, a non-English character or an emoji, must be percent-encoded: replaced by a % sign followed by its hexadecimal byte value.',
          'This tool encodes a string for safe use in a URL and decodes percent-encoded text back to something readable, so you can see what a tracking link or redirect actually contains.'
        ]
      },
      {
        title: 'Encode the value, not the whole URL',
        paragraphs: [
          'A common mistake is encoding an entire URL, which also escapes the :// and the ? separators and breaks it. Encode only the individual parameter values. If you are building a URL by hand, encode each value, then assemble the URL with unencoded separators.'
        ]
      }
    ],
    faq: [
      {
        question: 'What is the difference between %20 and +?',
        answer:
          'In a URL path, a space is %20. In a query string, both %20 and + can represent a space, and + is the older form-encoding convention. When in doubt use %20, which is unambiguous in every part of a URL.'
      },
      {
        question: 'Should I encode the whole URL or just the parameters?',
        answer:
          'Only the parameter values. Encoding the entire URL also escapes the scheme separator, the slashes and the question mark, which produces a broken link. Encode each value, then build the URL around them.'
      },
      {
        question: 'Which characters actually need encoding?',
        answer:
          'Anything outside the unreserved set (letters, digits, hyphen, underscore, dot, tilde), plus any character that has a reserved meaning in the position you are using it. In practice, encode anything that is not a plain letter, digit or -_.~.'
      },
      {
        question: 'Is my text sent to a server?',
        answer:
          'No. Encoding and decoding use the browser built-in functions and never leave your device, so it is safe for signed URLs and tokens.'
      }
    ],
    related: [
      { path: '/code/base64', title: 'Base64 Encoder/Decoder', description: 'encode binary data as text' },
      { path: '/code/html', title: 'HTML Encoder/Decoder', description: 'encode HTML entities' },
      { path: '/code/json-escaper', title: 'JSON Escaper', description: 'escape strings for JSON' },
      { path: '/code/vast', title: 'VAST Formatter', description: 'inspect the XML behind ad tags' },
      { path: '/code/json', title: 'JSON Formatter', description: 'read API responses that carry URLs' }
    ]
  },

  '/code/html': {
    sections: [
      {
        title: 'What HTML encoding does',
        paragraphs: [
          'HTML treats a handful of characters as markup: < and > open and close tags, & starts an entity, and quotes delimit attributes. When you need those characters to appear as literal text, you replace them with entities such as &lt; and &amp;. This tool encodes text for safe insertion into HTML and decodes entities back into readable characters.',
        ]
      },
      {
        title: 'Encoding is not sanitising',
        paragraphs: [
          'Escaping the five characters above stops text from being interpreted as markup, which prevents a whole class of cross-site scripting bugs. It is not, on its own, a complete defence: attribute contexts, URLs and JavaScript contexts each have their own rules. Treat this as one correct layer, not a security guarantee.'
        ]
      }
    ],
    faq: [
      {
        question: 'Which characters need to be encoded in HTML?',
        answer:
          'The critical five are & < > " and \'. The ampersand must be encoded first, otherwise you double-encode the entities you just created. Encoding < and > is what stops text from being parsed as a tag.'
      },
      {
        question: 'What is the difference between named and numeric entities?',
        answer:
          'A named entity such as &amp; is easier to read; a numeric one such as &#38; or &#x26; works for any Unicode character and never depends on the browser knowing the name. Both decode to the same character.'
      },
      {
        question: 'Should I encode or decode?',
        answer:
          'Encode when you are about to insert untrusted text into an HTML document. Decode when you are reading HTML source and want to see the actual characters, for example when cleaning up text copied from a web page.'
      },
      {
        question: 'Does encoding prevent XSS?',
        answer:
          'Correctly escaping for the context you are writing into prevents the most common injection bugs, but XSS depends on where the value lands. Escape for the exact context (HTML text, attribute, URL, JavaScript) and never rely on a single blanket transform.'
      }
    ],
    related: [
      { path: '/code/xml-escaper', title: 'XML Escaper', description: 'escape XML rather than HTML' },
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'percent-encode text for URLs' },
      { path: '/code/json-escaper', title: 'JSON Escaper', description: 'escape strings for JSON' },
      { path: '/text/markdown', title: 'Markdown Preview', description: 'render Markdown that often contains HTML' },
      { path: '/code/xml', title: 'XML Formatter', description: 'format XML documents' }
    ]
  },

  '/code/xml-escaper': {
    sections: [
      {
        title: 'What XML escaping does',
        paragraphs: [
          'XML uses the same markup delimiters as HTML, so text that contains <, >, &, quotes or apostrophes must be escaped before it can sit safely inside an element or an attribute. This tool converts text to escaped XML and back again.',
        ]
      },
      {
        title: 'Escaping or CDATA?',
        paragraphs: [
          'There are two ways to include awkward text in XML. Escaping replaces the special characters with entities, which is always safe. A CDATA section wraps the text verbatim, which keeps it readable but cannot contain the string ]]>. For generated or machine-written XML, escaping is the more predictable choice.'
        ]
      }
    ],
    faq: [
      {
        question: 'Which characters are escaped in XML?',
        answer:
          'The five predefined entities are &amp; &lt; &gt; &quot; and &apos;. Escaping & last is important: if you escape it first you will corrupt the entities you just produced.'
      },
      {
        question: 'When should I use CDATA instead of escaping?',
        answer:
          'Use CDATA when the content is large, contains many special characters, or should stay human-readable, such as embedded HTML. Remember that a CDATA section cannot contain the sequence ]]>, and that escaping is required inside attributes.'
      },
      {
        question: 'Is XML escaping the same as HTML escaping?',
        answer:
          'The five core entities are identical. The difference is that HTML defines hundreds of named entities and browsers are forgiving, whereas XML only knows the five predefined ones plus numeric character references, and is strict.'
      },
      {
        question: 'Is my text uploaded?',
        answer:
          'No. Escaping and unescaping run entirely in your browser, so feed files and API payloads stay private.'
      }
    ],
    related: [
      { path: '/code/xml', title: 'XML Formatter', description: 'pretty-print and validate XML' },
      { path: '/code/html', title: 'HTML Encoder/Decoder', description: 'encode HTML entities instead' },
      { path: '/code/vast', title: 'VAST Formatter', description: 'format VAST video ad XML' },
      { path: '/code/json-escaper', title: 'JSON Escaper', description: 'escape strings for JSON' },
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'encode text for URLs' }
    ]
  },

  '/code/json-escaper': {
    sections: [
      {
        title: 'What JSON string escaping does',
        paragraphs: [
          'Inside a JSON string, a double quote ends the string and a backslash starts an escape, so both must themselves be escaped. Newlines, tabs and other control characters must be written as \\n, \\t and \\uXXXX. This tool takes raw text and produces the escaped form you can paste into a JSON string, or reverses it.',
        ]
      },
      {
        title: 'Where this bites in practice',
        paragraphs: [
          'The classic failure is building a JSON payload by hand or by string concatenation and forgetting to escape a quote or a newline, producing JSON that will not parse. The same problem appears again with model output, where an LLM is asked to return JSON and emits an unescaped quote inside a string. Escape the value here, then validate.'
        ]
      }
    ],
    faq: [
      {
        question: 'Which characters must be escaped in a JSON string?',
        answer:
          'A double quote, a backslash, and every control character below U+0020 (newline, tab, carriage return and so on). Everything else, including non-ASCII letters and emoji, may appear literally because JSON is UTF-8.'
      },
      {
        question: 'Do I need to escape non-English characters?',
        answer:
          'No. JSON is UTF-8 by default, so accented letters and emoji can appear as-is. Escaping them as \\uXXXX is valid and sometimes necessary when the receiving system is not UTF-8 aware, but it makes the text much harder to read.'
      },
      {
        question: 'Is this the same escaping used for HTML?',
        answer:
          'No. HTML escaping replaces < and & with entities; JSON escaping deals with quotes, backslashes and control characters. They are different rule sets for different contexts and cannot be substituted for one another.'
      },
      {
        question: 'Is my text sent anywhere?',
        answer:
          'No. Escaping and unescaping happen locally in your browser, so payloads containing credentials or customer data stay on your machine.'
      }
    ],
    related: [
      { path: '/code/json', title: 'JSON Formatter', description: 'validate and pretty-print JSON' },
      { path: '/code/json-fixer', title: 'JSON Fixer', description: 'repair JSON with unescaped characters' },
      { path: '/code/html', title: 'HTML Encoder/Decoder', description: 'escape for HTML instead' },
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'encode values for URLs' },
      { path: '/code/xml-escaper', title: 'XML Escaper', description: 'escape for XML instead' }
    ]
  },

  '/code/gzip': {
    sections: [
      {
        title: 'What gzip compression is for',
        paragraphs: [
          'Gzip compresses text using the DEFLATE algorithm, typically shrinking JSON, HTML, CSS, logs and other repetitive text by 60 to 90 percent. This tool compresses text and gzip data in your browser, and can show the result as Base64 so it can be pasted into a text-only field.',
        ]
      },
      {
        title: 'Compression is not encryption',
        paragraphs: [
          'Compressed data is not protected. Anyone can decompress it with no key. Compress to save space or bandwidth, never to keep something secret.'
        ]
      }
    ],
    faq: [
      {
        question: 'Is gzip compression the same as encryption?',
        answer:
          'No. Gzip is a lossless compression format with no key. Anyone holding the bytes can decompress them, so it provides no confidentiality. Encrypt separately if the data is sensitive.'
      },
      {
        question: 'Why is the output shown as Base64?',
        answer:
          'Gzip produces binary data, which cannot be pasted into a JSON field, a URL or a plain text editor without corruption. Base64 turns those bytes into safe ASCII text so they can travel through text-only channels.'
      },
      {
        question: 'How much smaller will my data get?',
        answer:
          'It depends entirely on redundancy. Repetitive text such as JSON or logs often shrinks by 80 to 90 percent. Data that is already compressed, such as a JPEG or a zip file, will barely shrink at all and may even grow slightly.'
      },
      {
        question: 'Does it work for large files?',
        answer:
          'It is designed for text you paste into a browser tab, using the native CompressionStream API where available. Very large inputs are limited by your available memory rather than by a server-side size limit.'
      }
    ],
    related: [
      { path: '/code/base64', title: 'Base64 Encoder/Decoder', description: 'encode the compressed bytes as text' },
      { path: '/code/json', title: 'JSON Formatter', description: 'compress and inspect large JSON' },
      { path: '/code/json-fixer', title: 'JSON Fixer', description: 'repair malformed JSON' },
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'encode compressed data for a URL' },
      { path: '/code/uuid', title: 'UUID Generator', description: 'generate ids and keys' }
    ]
  },

  '/code/uuid': {
    sections: [
      {
        title: 'What a UUID is',
        paragraphs: [
          'A UUID (universally unique identifier), also called a GUID, is a 128-bit value written as 32 hexadecimal digits in five groups, such as 123e4567-e89b-12d3-a456-426614174000. It is designed to be unique without a central authority, which is why databases, APIs and distributed systems use it as an identifier.',
        ]
      },
      {
        title: 'Which version to use',
        paragraphs: [
          'Version 4 is random and is what you want almost all of the time: it leaks nothing and needs no coordination. Version 1 combines a timestamp with the machine MAC address, which makes ids roughly sortable but exposes the generating machine, so prefer v4 unless you specifically need time ordering.'
        ]
      }
    ],
    faq: [
      {
        question: 'What is the difference between UUID v1 and v4?',
        answer:
          'Version 4 is 122 random bits with no structure. Version 1 embeds a timestamp and the node (usually the MAC address), so v1 values sort by creation time but can leak the machine that made them. Use v4 unless you need time-based ordering.'
      },
      {
        question: 'Can two UUIDs collide?',
        answer:
          'For version 4 the chance is negligible: you would need to generate about 2.7 x 10^18 of them before a 50 percent chance of one collision. In practice collisions are not a concern.'
      },
      {
        question: 'Is a UUID cryptographically secure?',
        answer:
          'It depends on the generator. A v4 UUID from a cryptographic source is random, but a UUID is not a secret and should not be used as an API key or a password. Use the password generator for credentials.'
      },
      {
        question: 'What is the Nil UUID?',
        answer:
          'It is the all-zero UUID, 00000000-0000-0000-0000-000000000000, conventionally used to mean no value. It is never a valid random identifier.'
      }
    ],
    related: [
      { path: '/code/password', title: 'Password Generator', description: 'generate secrets rather than ids' },
      { path: '/code/jwt-decoder', title: 'JWT Decoder', description: 'inspect jti and other claims' },
      { path: '/code/json', title: 'JSON Formatter', description: 'format payloads containing ids' },
      { path: '/code/base64', title: 'Base64 Encoder/Decoder', description: 'encode and decode identifiers' },
      { path: '/code/gzip', title: 'Gzip Compression', description: 'compress bulk id lists' }
    ]
  },

  '/code/password': {
    sections: [
      {
        title: 'How this password generator works',
        paragraphs: [
          'The generator builds passwords from a cryptographically secure random source in your browser, not from Math.random. You choose the length and which character classes to include: lower case, upper case, digits and symbols.',
        ]
      },
      {
        title: 'Longer beats complicated',
        paragraphs: [
          'Strength comes from length far more than from exotic symbols. A long passphrase of random words is both stronger and easier to remember than a short string of punctuation. Where a service allows it, prefer 20 characters or more.',
          'Generating a password here is only half the job: store it in a password manager rather than reusing it, and turn on two-factor authentication where you can.'
        ]
      }
    ],
    faq: [
      {
        question: 'Is this generator actually random?',
        answer:
          'Yes. It uses the Web Crypto API (crypto.getRandomValues), the same cryptographically secure source browsers use for TLS, rather than the predictable Math.random.'
      },
      {
        question: 'How long should my password be?',
        answer:
          'Sixteen characters is a reasonable modern minimum for a random password, and 20 or more is better. Length adds strength exponentially, so adding characters helps far more than adding symbol types.'
      },
      {
        question: 'Is the password sent anywhere?',
        answer:
          'No. Generation happens entirely in your browser and nothing is transmitted or logged, which you can verify in the DevTools Network tab.'
      },
      {
        question: 'Should I use the generated password directly on a website?',
        answer:
          'Yes, but paste it into a password manager first so it is saved and you can retrieve it. A strong password you cannot remember and did not store is useless.'
      }
    ],
    related: [
      { path: '/code/uuid', title: 'UUID Generator', description: 'generate unique ids' },
      { path: '/code/jwt-decoder', title: 'JWT Decoder', description: 'inspect tokens and their claims' },
      { path: '/code/gzip', title: 'Gzip Compression', description: 'compress text before storing it' },
      { path: '/code/base64', title: 'Base64 Encoder/Decoder', description: 'encode credentials for transport' },
      { path: '/code/json', title: 'JSON Formatter', description: 'format config that holds keys' }
    ]
  },

  '/text/case-converter': {
    sections: [
      {
        title: 'What this case converter does',
        paragraphs: [
          'Convert text between the naming conventions and letter cases you actually use: UPPER CASE, lower case, Sentence case, Title Case, camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE.',
          'It runs entirely in your browser, so text from documents, tickets or customer data never leaves your machine.'
        ]
      },
      {
        title: 'Which case to use where',
        paragraphs: ['The conventions are not arbitrary; each one signals a different context:'],
        bullets: [
          'camelCase and PascalCase for variable and class names in JavaScript, Java and C#.',
          'snake_case and CONSTANT_CASE for Python, SQL columns and environment variables.',
          'kebab-case for URLs, CSS class names and file names, because hyphens are safe in all three.',
          'Title Case for headings and titles; Sentence case for prose, which most style guides now prefer for UI copy.'
        ]
      }
    ],
    faq: [
      {
        question: 'What is the difference between camelCase and PascalCase?',
        answer:
          'Both join words without separators and capitalise the first letter of each later word. camelCase starts with a lower-case letter (myVariableName); PascalCase starts with an upper-case letter (MyClassName).'
      },
      {
        question: 'What counts as Title Case?',
        answer:
          'Title Case capitalises the significant words in a heading. Style guides differ on short words such as of, and, and the, which are usually left lower-case unless they start or end the title.'
      },
      {
        question: 'Will it break accented or non-English characters?',
        answer:
          'No. Case conversion uses Unicode rules, so accented Latin letters, Greek and Cyrillic are converted correctly rather than being mangled or dropped.'
      },
      {
        question: 'Does it send my text anywhere?',
        answer:
          'No. The conversion happens locally in your browser with no network requests.'
      }
    ],
    related: [
      { path: '/text/space-remover', title: 'Space Remover', description: 'clean up whitespace before converting' },
      { path: '/text/character-count', title: 'Character Counter', description: 'check the length of the result' },
      { path: '/text/markdown', title: 'Markdown Preview', description: 'render formatted text as HTML' },
      { path: '/code/json-escaper', title: 'JSON Escaper', description: 'escape strings for JSON payloads' },
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'encode text for URLs and slugs' }
    ]
  },

  '/text/character-count': {
    sections: [
      {
        title: 'What this counter measures',
        paragraphs: [
          'Paste text to see its character count (with and without spaces), word count, sentence and paragraph counts, line count and an estimated reading time. Everything updates as you type.',
        ]
      },
      {
        title: 'Why the limits exist',
        paragraphs: [
          'Most platforms truncate silently, so the count matters before you publish:',
        ],
        bullets: [
          'Search result titles are truncated at roughly 60 characters and meta descriptions at roughly 155.',
          'A post on X is limited to 280 characters; SMS is 160 per segment.',
          'A meta description that is too long is simply cut off in the results, which loses the call to action.'
        ]
      }
    ],
    faq: [
      {
        question: 'Do spaces count as characters?',
        answer:
          'They do in most platform limits, which is why this tool reports both the total and the count excluding spaces. When checking a limit, use the total including spaces.'
      },
      {
        question: 'How is reading time calculated?',
        answer:
          'It divides the word count by a typical adult reading speed of about 200 to 250 words per minute. Treat it as an estimate, since speed varies widely with content and reader.'
      },
      {
        question: 'How long should a meta description be?',
        answer:
          'Aim for about 150 to 155 characters. Longer descriptions are truncated in search results, so put the key message and the call to action in the first 120 characters.'
      },
      {
        question: 'Is my text uploaded?',
        answer:
          'No. Counting happens in your browser only, so draft content and private notes stay on your device.'
      }
    ],
    related: [
      { path: '/text/case-converter', title: 'Case Converter', description: 'change the case of your text' },
      { path: '/text/space-remover', title: 'Space Remover', description: 'normalise whitespace before counting' },
      { path: '/text/lorem', title: 'Lorem Ipsum Generator', description: 'generate placeholder text of a set length' },
      { path: '/text/markdown', title: 'Markdown Preview', description: 'preview formatted drafts' },
      { path: '/code/vast', title: 'VAST Formatter', description: 'check ad tag XML integrity' }
    ]
  },

  '/text/space-remover': {
    sections: [
      {
        title: 'What this tool cleans up',
        paragraphs: [
          'Remove or normalise the whitespace that sneaks into copied text: collapse runs of spaces into one, trim leading and trailing space from every line, delete all spaces, or strip tabs and line breaks entirely.',
        ]
      },
      {
        title: 'Trim, collapse or remove everything',
        paragraphs: [
          'The three operations fix different problems, and picking the right one matters:',
        ],
        bullets: [
          'Trim removes only the space at the start and end of each line, which is what you want for pasted lists.',
          'Collapse replaces every run of spaces with a single space, which fixes text copied out of PDFs and web pages.',
          'Remove all deletes every space, which is useful when joining a code or removing spaces from an ID.'
        ]
      }
    ],
    faq: [
      {
        question: 'What is the difference between trimming and collapsing spaces?',
        answer:
          'Trimming only removes whitespace at the beginning and end of a line. Collapsing finds runs of spaces inside the text and replaces them with a single space. Text with internal alignment usually needs collapsing, not trimming.'
      },
      {
        question: 'Can it remove line breaks as well as spaces?',
        answer:
          'Yes. There are separate actions for removing line breaks and for removing tabs, so you can flatten a wrapped paragraph without destroying anything else.'
      },
      {
        question: 'Will it break my code indentation?',
        answer:
          'It can, if you choose the wrong action. Removing all spaces or collapsing runs will destroy indentation in code or YAML. Use trim only when you need to clean up pasted code.'
      },
      {
        question: 'Is my text sent to a server?',
        answer:
          'No. All processing happens locally in your browser.'
      }
    ],
    related: [
      { path: '/text/case-converter', title: 'Case Converter', description: 'change letter case' },
      { path: '/text/character-count', title: 'Character Counter', description: 'measure the cleaned text' },
      { path: '/code/json', title: 'JSON Formatter', description: 'format JSON that will not parse' },
      { path: '/code/json-escaper', title: 'JSON Escaper', description: 'escape control characters' },
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'encode spaces as %20' }
    ]
  },

  '/text/lorem': {
    sections: [
      {
        title: 'What Lorem Ipsum is',
        paragraphs: [
          'Lorem Ipsum is placeholder text drawn from a first-century Latin text, used by typesetters since the 1500s. It exists because readable content distracts reviewers: when the words are meaningless, attention goes to layout, spacing and hierarchy instead.',
          'Generate paragraphs, sentences or words and copy them straight into a design or template.'
        ]
      },
      {
        title: 'When not to use placeholder text',
        paragraphs: [
          'Placeholder text hides the problems that real content exposes. Long product names, right-to-left languages, extreme word lengths and real translations all break layouts that looked fine with Latin filler. For anything shipped to users, test with content that resembles the real thing.'
        ]
      }
    ],
    faq: [
      {
        question: 'Is Lorem Ipsum real Latin?',
        answer:
          'It is derived from a passage of Ciceros De Finibus Bonorum et Malorum, but the words have been shuffled and altered over centuries of use, so it is not a coherent Latin sentence.'
      },
      {
        question: 'Why do designers use placeholder text instead of real copy?',
        answer:
          'So reviewers judge the layout rather than the message. Real text invites editing and debate about wording, which is not what a layout review is for.'
      },
      {
        question: 'Can I generate a specific number of words or paragraphs?',
        answer:
          'Yes. You can generate by paragraph, by sentence or by word count, which makes it easy to fill a container of a known size or to stress-test an unusually long label.'
      },
      {
        question: 'Does it generate HTML?',
        answer:
          'It generates plain text that you can paste into any template. If you need markup, generate paragraphs here and wrap them in your own tags, or use the Markdown preview tool to check the result.'
      }
    ],
    related: [
      { path: '/text/character-count', title: 'Character Counter', description: 'measure the generated text' },
      { path: '/text/markdown', title: 'Markdown Preview', description: 'preview it as rendered HTML' },
      { path: '/text/case-converter', title: 'Case Converter', description: 'change the case of filler text' },
      { path: '/code/html', title: 'HTML Encoder/Decoder', description: 'escape text before inserting it into HTML' },
      { path: '/text/space-remover', title: 'Space Remover', description: 'clean up pasted text' }
    ]
  },

  '/text/markdown': {
    sections: [
      {
        title: 'What this Markdown preview does',
        paragraphs: [
          'Type Markdown on the left and see the rendered result on the right, updating as you type. The renderer implements GitHub Flavored Markdown, so tables, task lists, strikethrough and fenced code blocks with syntax highlighting all work.',
        ]
      },
      {
        title: 'Markdown is not HTML',
        paragraphs: [
          'Markdown is a lightweight syntax that compiles to HTML. It is deliberately not a superset of HTML: raw HTML inside a Markdown document is passed through by most renderers, which is convenient and also a security risk. Never render Markdown from an untrusted source without sanitising the output first.'
        ]
      }
    ],
    faq: [
      {
        question: 'What is the difference between Markdown and HTML?',
        answer:
          'Markdown is a concise plain-text syntax for structure such as headings, lists and links. It is compiled into HTML for display. HTML is the final markup and can express far more, at the cost of being verbose and harder to write by hand.'
      },
      {
        question: 'Which flavour of Markdown is supported?',
        answer:
          'GitHub Flavored Markdown (GFM), which is the CommonMark specification plus tables, task lists, strikethrough and autolinks. It is what GitHub, GitLab and most modern documentation sites use.'
      },
      {
        question: 'Is raw HTML in my Markdown a security risk?',
        answer:
          'It can be. If you render Markdown that came from an untrusted user without sanitising the HTML output, embedded scripts or event attributes can execute. Sanitise the rendered HTML on the server before displaying it to others.'
      },
      {
        question: 'Is my content uploaded?',
        answer:
          'No. Parsing and rendering happen entirely in your browser, so drafts never leave your device.'
      }
    ],
    related: [
      { path: '/code/html', title: 'HTML Encoder/Decoder', description: 'escape the HTML that comes out' },
      { path: '/text/lorem', title: 'Lorem Ipsum Generator', description: 'generate filler content to preview' },
      { path: '/text/character-count', title: 'Character Counter', description: 'measure the length of your draft' },
      { path: '/code/json-escaper', title: 'JSON Escaper', description: 'escape text for JSON payloads' },
      { path: '/code/xml-escaper', title: 'XML Escaper', description: 'escape text for XML' }
    ]
  },

  '/datetime/timestamp': {
    sections: [
      {
        title: 'What a Unix timestamp is',
        paragraphs: [
          'A Unix timestamp is the number of seconds elapsed since 1 January 1970 at 00:00 UTC, ignoring leap seconds. Because it is a single number in UTC, it is unambiguous: it carries no time zone, so the same value means the same instant everywhere. That is why databases, logs and APIs store timestamps this way.',
          'This tool converts a timestamp to a readable date in your local time zone and back again, in both seconds and milliseconds.'
        ]
      },
      {
        title: 'Seconds or milliseconds?',
        paragraphs: [
          'The classic Unix timestamp is in seconds, but many APIs and JavaScript return milliseconds, which produces a value three digits longer. If a timestamp converts to a date tens of thousands of years in the future, it is almost certainly milliseconds being read as seconds.'
        ]
      }
    ],
    faq: [
      {
        question: 'Why does the timestamp start in 1970?',
        answer:
          'The Unix epoch, 1 January 1970, was chosen as a convenient reference point when the Unix operating system was designed. Timestamps are offsets from that instant, so a value before it is simply negative.'
      },
      {
        question: 'Is a timestamp in seconds or milliseconds?',
        answer:
          'Both exist. A seconds timestamp today is ten digits; a milliseconds timestamp is thirteen. If the converted date is absurdly far in the future, you are reading milliseconds as seconds.'
      },
      {
        question: 'Does a timestamp include a time zone?',
        answer:
          'No, that is the point. A Unix timestamp is an absolute instant in UTC. The time zone only enters the picture when you format it for display, which is why the same value shows different clock times around the world.'
      },
      {
        question: 'What is the year 2038 problem?',
        answer:
          'Systems that store a Unix timestamp in a signed 32-bit integer overflow on 19 January 2038, wrapping to a negative value. Modern systems use 64-bit integers, which will not overflow for billions of years.'
      }
    ],
    related: [
      { path: '/datetime/timezone', title: 'Timezone Converter', description: 'convert between time zones' },
      { path: '/datetime/format', title: 'Date Formatter', description: 'format a date in a specific pattern' },
      { path: '/datetime/calculator', title: 'Date Calculator', description: 'add or subtract time from a date' },
      { path: '/datetime/cron-parser', title: 'Cron Parser', description: 'turn schedules into next run times' },
      { path: '/code/json', title: 'JSON Formatter', description: 'read API responses with timestamps' }
    ]
  },

  '/datetime/timezone': {
    sections: [
      {
        title: 'What this converter does',
        paragraphs: [
          'Convert a date and time from one time zone to another, using the IANA time zone database so daylight saving transitions are handled correctly for the date you enter, not just today.',
        ]
      },
      {
        title: 'Why daylight saving trips people up',
        paragraphs: [
          'The offset between two zones changes twice a year and the dates differ by country, so a fixed offset is wrong for part of the year. Some zones have also changed their rules at short notice. Always convert using named zones such as Europe/Berlin and America/New_York rather than fixed offsets like UTC+1.'
        ]
      }
    ],
    faq: [
      {
        question: 'What is the difference between UTC and GMT?',
        answer:
          'For practical purposes they are the same offset, zero. GMT is a time zone name with historical baggage; UTC is the modern standard. Use UTC in data and logs, and convert to a local zone only for display.'
      },
      {
        question: 'Why are time zone abbreviations such as IST ambiguous?',
        answer:
          'Abbreviations are not unique. IST can mean India Standard Time, Irish Standard Time or Israel Standard Time, with different offsets. Use IANA names such as Asia/Kolkata, which are unambiguous.'
      },
      {
        question: 'Does it handle daylight saving automatically?',
        answer:
          'Yes. Conversions use the full IANA rules for the date you entered, so an August date in New York uses EDT and a January date uses EST, without you doing anything.'
      },
      {
        question: 'Why do meetings sometimes shift by an hour after a rule change?',
        answer:
          'Because one of the countries changed its daylight saving dates. Recurring meetings stored as a fixed offset drift; meetings stored with a named zone follow the new rules.'
      }
    ],
    related: [
      { path: '/datetime/timestamp', title: 'Timestamp Converter', description: 'convert Unix timestamps to local time' },
      { path: '/datetime/format', title: 'Date Formatter', description: 'format the converted date' },
      { path: '/datetime/calculator', title: 'Date Calculator', description: 'add and subtract time spans' },
      { path: '/datetime/cron-parser', title: 'Cron Parser', description: 'see schedules in your own time zone' },
      { path: '/code/json', title: 'JSON Formatter', description: 'inspect timestamps in API payloads' }
    ]
  },

  '/datetime/calculator': {
    sections: [
      {
        title: 'What this date calculator does',
        paragraphs: [
          'Add or subtract days, weeks, months or years from a date, or measure the difference between two dates in days, weeks, months and years. Useful for deadlines, invoice terms, retention windows and contract end dates.',
        ]
      },
      {
        title: 'Counting dates is not simple arithmetic',
        paragraphs: [
          'Months have different lengths, which makes month arithmetic ambiguous: adding one month to 31 January has no obvious answer, since 31 February does not exist. This calculator clamps to the last valid day of the target month, which is the same convention most databases use. When a calculation is contractual, check which convention applies: counting the start day, the end day, or business days excluding weekends.'
        ]
      }
    ],
    faq: [
      {
        question: 'Is the start date counted in the difference?',
        answer:
          'The difference is the elapsed time between the two dates, so the start date is not counted as a full day. For contracts that say N days from a date, check whether the convention includes the start day.'
      },
      {
        question: 'How does adding one month to 31 January work?',
        answer:
          'There is no 31 February, so the result clamps to the last valid day of the target month, 28 or 29 February. This matches the behaviour of most databases and is the safest convention.'
      },
      {
        question: 'Does it count business days?',
        answer:
          'The calculator works in calendar days. Business day counts depend on which weekends and public holidays a country observes, so those should be checked against the relevant calendar rather than assumed.'
      },
      {
        question: 'Is it affected by my time zone?',
        answer:
          'Date arithmetic is performed on calendar dates rather than instants, so a date does not shift because of your time zone. Convert instants to local dates first if your input came from a timestamp.'
      }
    ],
    related: [
      { path: '/datetime/timestamp', title: 'Timestamp Converter', description: 'turn epoch values into dates' },
      { path: '/datetime/timezone', title: 'Timezone Converter', description: 'convert between zones' },
      { path: '/datetime/format', title: 'Date Formatter', description: 'format the resulting date' },
      { path: '/datetime/cron-parser', title: 'Cron Parser', description: 'preview scheduled run times' },
      { path: '/text/character-count', title: 'Character Counter', description: 'check the length of generated text' }
    ]
  },

  '/datetime/format': {
    sections: [
      {
        title: 'What this date formatter does',
        paragraphs: [
          'Turn a date into any output pattern using tokens such as yyyy, MM, dd, HH and mm, and see the result immediately. It is the fastest way to check that a format string produces what you expect before putting it in code or a report.',
        ]
      },
      {
        title: 'Prefer ISO 8601 in data',
        paragraphs: [
          'When the value is going into an API, a database or a log, use ISO 8601 (2026-10-10T14:30:00Z). It sorts correctly as text, is unambiguous about the offset, and parses identically in every language. Reserve local formats such as 10/10/2026 for display, since they are read differently on either side of the Atlantic.'
        ]
      }
    ],
    faq: [
      {
        question: 'What is ISO 8601?',
        answer:
          'An international standard for writing dates and times as YYYY-MM-DDThh:mm:ss with an optional time zone offset or Z for UTC. It is unambiguous, sorts alphabetically in chronological order, and is the default for JSON APIs.'
      },
      {
        question: 'Why do my dates show the wrong month or day?',
        answer:
          'Usually because of a case error in the format tokens. In most patterns MM is the month and mm is minutes, and dd is the day while DD means something else in some languages. The preview makes this immediately visible.'
      },
      {
        question: 'Should I format in local time or UTC?',
        answer:
          'Store and transmit in UTC, and format into the users local time zone only at the point of display. Mixing the two is the most common source of dates that are off by hours.'
      },
      {
        question: 'What is the difference between a date and an instant?',
        answer:
          'An instant is a specific moment in time and needs a time zone to be meaningful. A date such as a birthday is just a calendar day and should not be converted between zones at all.'
      }
    ],
    related: [
      { path: '/datetime/timestamp', title: 'Timestamp Converter', description: 'convert epoch values to dates' },
      { path: '/datetime/timezone', title: 'Timezone Converter', description: 'convert between time zones' },
      { path: '/datetime/calculator', title: 'Date Calculator', description: 'add and subtract dates' },
      { path: '/datetime/cron-parser', title: 'Cron Parser', description: 'read scheduled run times' },
      { path: '/code/json', title: 'JSON Formatter', description: 'inspect dates inside JSON' }
    ]
  },

  '/datetime/cron-parser': {
    sections: [
      {
        title: 'What this cron parser does',
        paragraphs: [
          'Paste a cron expression to see what it means in plain English and the next several times it will run, converted into your own time zone. It accepts the standard five-field crontab (minute, hour, day of month, month, day of week) and the six-field form with a leading seconds field.',
        ]
      },
      {
        title: 'Cron syntax is not standardised',
        paragraphs: [
          'The five fields are broadly compatible, but dialects diverge in the details: whether Sunday is 0 or 7, whether a step is written */5 or 0/5, and what happens when both the day-of-month and day-of-week fields are restricted. Quartz, systemd timers and Kubernetes all differ. Check the dialect of the scheduler you are actually deploying to.'
        ]
      }
    ],
    faq: [
      {
        question: 'What does */5 mean in a cron expression?',
        answer:
          'It means every 5th value of that field. In the minute field, */5 means at minutes 0, 5, 10 and so on, so the job runs every five minutes.'
      },
      {
        question: 'What is the difference between five and six field cron?',
        answer:
          'Five fields start at minutes: minute, hour, day of month, month, day of week. Six-field variants used by Quartz add a leading seconds field. This parser accepts both, and the preview tells you which it read.'
      },
      {
        question: 'Does it handle daylight saving?',
        answer:
          'The next run times are computed with the daylight saving rules of the selected time zone, so they stay correct across a transition. Note that schedulers themselves differ in how they behave during the skipped hour, so verify with your platform for jobs that run at 02:00 or 03:00.'
      },
      {
        question: 'What happens if both day-of-month and day-of-week are set?',
        answer:
          'This is the classic trap. In classic cron the job runs when either field matches, not both, which surprises almost everyone. Quartz behaves differently and requires both. The plain-English description spells out which reading applies.'
      }
    ],
    related: [
      { path: '/datetime/timezone', title: 'Timezone Converter', description: 'check the zone your schedule runs in' },
      { path: '/datetime/timestamp', title: 'Timestamp Converter', description: 'convert the next run times' },
      { path: '/datetime/format', title: 'Date Formatter', description: 'format the scheduled dates' },
      { path: '/datetime/calculator', title: 'Date Calculator', description: 'work out intervals and deadlines' },
      { path: '/code/json', title: 'JSON Formatter', description: 'inspect job configuration' }
    ]
  },

  '/media/image-compress': {
    sections: [
      {
        title: 'What this image compressor does',
        paragraphs: [
          'Reduce the file size of JPEG, PNG and WebP images and resize them, entirely in your browser. Choose the output format and quality, see the exact before-and-after size, then download the result. Your images are never uploaded to a server, which matters for client work, screenshots and anything under NDA.',
        ]
      },
      {
        title: 'Picking a format and quality',
        paragraphs: [
          'JPEG at quality 75 to 85 is the sweet spot for photographs and produces dramatic savings with no visible loss. PNG is lossless and best for screenshots, logos and images with transparency, but it compresses poorly, so converting a photo to WebP usually wins. WebP is now supported by every current browser and typically beats both.'
        ]
      }
    ],
    faq: [
      {
        question: 'Are my images uploaded?',
        answer:
          'No. Decoding, resizing and re-encoding all happen in your browser, so the file never leaves your device. You can confirm this in the DevTools Network tab while compressing.'
      },
      {
        question: 'How do I compress a JPEG to a specific size, such as 100 KB?',
        answer:
          'Lower the quality first and watch the reported output size; if that is not enough, reduce the pixel dimensions as well. Most of the size in a photo comes from its dimensions, so resizing is usually more effective than dropping quality further.'
      },
      {
        question: 'Will compressing reduce the quality?',
        answer:
          'JPEG and WebP compression is lossy, so some data is discarded, but at quality 80 most viewers cannot tell. PNG is lossless, so its size only comes down by resizing or by reducing the colour palette.'
      },
      {
        question: 'Does it remove EXIF metadata?',
        answer:
          'Re-encoding through the canvas produces a clean image without the original EXIF block, so location data and camera details are dropped. That is usually desirable when publishing images, but keep the original if you need that metadata.'
      }
    ],
    related: [
      { path: '/media/hls', title: 'HLS Stream Player', description: 'play and inspect video streams' },
      { path: '/code/base64', title: 'Base64 Encoder/Decoder', description: 'inline small images as data URLs' },
      { path: '/code/json', title: 'JSON Formatter', description: 'inspect image metadata in API responses' },
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'encode image URLs with parameters' },
      { path: '/code/uuid', title: 'UUID Generator', description: 'name the output files uniquely' }
    ]
  },

  '/media/hls': {
    sections: [
      {
        title: 'What HLS is',
        paragraphs: [
          'HTTP Live Streaming splits a video into short segments and describes them in an .m3u8 playlist that a player downloads in sequence. The playlist can list several renditions at different bitrates, which lets the player switch quality as bandwidth changes. It is why HLS works through ordinary web servers and CDNs without special streaming software.',
          'This tool plays an .m3u8 URL and shows what the playlist actually contains: the variant streams, their resolution and bitrate, and the segment durations.'
        ]
      },
      {
        title: 'HLS is not a file format',
        paragraphs: [
          'There is no .hls file to download. The playlist is a text file that points at segments, usually MPEG-TS or fMP4. Saving the playlist gives you a list of URLs, not the video, and the segments may be short-lived for a live stream.'
        ]
      }
    ],
    faq: [
      {
        question: 'What is an m3u8 file?',
        answer:
          'It is a UTF-8 playlist in the M3U format, used by HLS. A master playlist lists the available renditions; a media playlist lists the segments of one rendition along with their durations and sequence numbers.'
      },
      {
        question: 'Why will my stream not play here?',
        answer:
          'The usual cause is CORS: the server hosting the playlist must send an Access-Control-Allow-Origin header permitting your page to fetch it. Cross-origin playlists and segments that do not send the header will be blocked by the browser regardless of the tool.'
      },
      {
        question: 'Does it support DRM-protected streams?',
        answer:
          'No. Encrypted HLS requires a licence server and a key exchange that this player does not perform, so protected content will not play. It is intended for open test streams and debugging.'
      },
      {
        question: 'Is HLS the same as MP4?',
        answer:
          'No. MP4 is a container file holding the whole video. HLS is an adaptive streaming protocol that delivers many small segment files, which is why it can start quickly and switch quality mid-playback.'
      }
    ],
    related: [
      { path: '/code/vast', title: 'VAST Formatter', description: 'format the ad XML served alongside video' },
      { path: '/code/url', title: 'URL Encoder/Decoder', description: 'decode playlist and tag URLs' },
      { path: '/media/image-compress', title: 'Image Compressor', description: 'prepare thumbnails and posters' },
      { path: '/code/base64', title: 'Base64 Encoder/Decoder', description: 'handle base64 data in manifests' },
      { path: '/code/json', title: 'JSON Formatter', description: 'inspect player API responses' }
    ]
  }
};

/**
 * @param {string} path
 * @returns {ToolContent | null}
 */
export function getToolContent(path) {
  return toolContent[path] || null;
}
