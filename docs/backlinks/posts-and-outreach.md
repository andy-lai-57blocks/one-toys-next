# Post & outreach drafts

Drafts, not final copy — adjust the voice to yours before posting. The one rule that
matters: **lead with the engineering, not the product.** A post that opens with "I built
a tools site" gets ignored; one that opens with a measurement gets upvoted.

---

## 1. Show HN

**Title** (HN strips marketing speak; keep it concrete):

> Show HN: 27 developer tools that never send your data to a server

**Body:**

```
I kept seeing people paste production JWTs, AWS config dumps and internal JSON into
random online formatters, so I built a set of the usual developer utilities where the
processing happens inside the tab.

27 tools: JSON format/repair, Base64, URL/HTML/XML escaping, gzip, JWT decode, UUID,
password, cron parser, timestamp/timezone conversion, image compression, OCR, QR codes.

The interesting engineering, if you want to skip the site:

- It's a Next.js static export. There is no backend and no upload endpoint at all —
  which also means no server to leak anything.
- The JSON tool is a repairer, not a formatter. It handles unquoted keys, single quotes,
  trailing commas, full-width CJK punctuation, and — the case that made me write my own —
  truncated documents, where a naive "largest balanced value" heuristic silently throws
  away everything after the cut.
- Image compression keeps PNG as PNG. Canvas can only emit 32-bit PNG, so I wrote an
  indexed-PNG encoder (median cut + k-means, exact histogram for images under 60k
  colours). Real files: -74% / -69% / -71% / -72%. Counter-intuitive finding: adaptive
  scanline filtering makes indexed output 11-34% *bigger*, because palette indices are
  not numerically related — filter 0 wins.
- OCR runs tesseract.js lazily, with the model fetched on demand. Tesseract's default
  PSM (auto) is wrong for screenshots; single-block plus a 2400px upscale took mean
  accuracy from 97.0% to 99.8% across 10 fixtures.

Known gaps: no dark/light auto-switch on first visit, no PWA install, OCR still fails on
angled photos and handwriting, and very large inputs are bounded by browser memory.

https://one-toys.com
```

**Rules:** post once. Reply to every comment for the first 3 hours. Do not ask for
upvotes anywhere (that is a bannable offence and HN detects voting rings).

---

## 2. r/InternetIsBeautiful

**Title:**

> A set of 27 developer tools that run entirely in your browser — nothing you paste is uploaded

**Body:**

```
All 27 utilities (JSON, Base64, JWT, cron, timezones, image compression, OCR, QR)
process locally. No account, no uploads, no file-size paywall.

https://one-toys.com
```

Keep it that short. That subreddit removes anything that reads like an ad pitch, and a
long feature list reads like one.

---

## 3. r/webdev — Showoff Saturday

Post **only** in the Saturday thread. Frame as a build note:

```
Built a 27-tool developer utility site as a Next.js static export. Constraints that
shaped it: no backend at all, so every tool had to work client-side.

Two things I'd do again:
- Hand-writing an indexed PNG encoder instead of shipping WebP. Canvas can't emit
  indexed PNG, and for screenshots/graphics it beats lossy WebP on quality-per-byte.
  The quantiser was where all the quality came from (exact histogram under 60k colours).
- Keeping the tool pages lean. Most are 130-150 kB first load; the ace editor is the
  only heavy dependency and it's imported per-page, not through a barrel file.

Happy to answer anything about the static-export setup or the image pipeline.
```

---

## 4. dev.to / Hashnode article outlines (these are the ones that earn links)

### Post A — "The browser can't write an indexed PNG, so I wrote one"

1. The problem: `canvas.toBlob('image/png')` only emits 24/32-bit truecolour. On 2 of 5
   real files it returned something *larger* than the input.
2. Median cut, then k-means refinement. Why bucketing at 4 bits wrecked flat graphics
   (38.1 dB → 50.1 dB once the histogram became exact under 60k colours).
3. Reserving the ~24 most frequent exact colours so text and flat fills don't drift.
4. Assignment LUT at 6 bits/channel (5+5 with alpha) — 4 bits silently merges
   16-value neighbourhoods.
5. The surprise: **filter 0 beats adaptive filtering on indexed data** (11-34% smaller).
   Palette indices aren't numerically related, so delta coding amplifies noise.
6. No dithering, on purpose: 2-6x file size for a benefit that only matters on smooth
   gradients — exactly where PNG is the wrong container.
7. Results table + link to the tool.
8. Validate against an independent decoder (`cwebp`, `sips`), never your own reader.

### Post B — "Tesseract's defaults are wrong for screenshots"

1. Fixture methodology (clean / dark / low-contrast / 12px / 10-11px / JPEG noise / 3°
   skew) + Levenshtein similarity.
2. PSM auto reorders blocks on skewed scans → 52%. PSM 6 (single block) → 100%.
3. Upscaling to a 2400px long edge: the single biggest win (10px text 94% → 100%).
4. Median-based auto-invert for dark-mode screenshots; percentile contrast stretch.
5. `worker.reinitialize()` resets parameters — re-apply PSM after every language switch.
6. Final numbers: 97.0% → 99.8% mean, 8/10 exact.

### Post C — "A JSON formatter is not a JSON fixer"

1. What formatters do vs what people actually need (broken input).
2. The 18 rules, and the ordering bug that matters: repair truncation **before**
   "extract the largest balanced value", or `{"a":1}{"b":2}` silently loses a document.
3. Full-width CJK punctuation: fold it in structural positions and inside keys, never
   inside a quoted value (a Chinese user writing `"张三：测试"` means that colon).
4. Why auto-formatting is text-level, not `JSON.parse` + `stringify` (big integers,
   duplicate keys, numeric-looking key order all survive).

---

## 5. Email outreach (only for genuine round-ups)

Send to authors of **existing** "best free developer tools" / "privacy-friendly tools"
round-ups that already list a competitor but not you. Never to a scraped list.

```
Subject: One Toys — free client-side dev tools (for your <specific post> round-up)

Hi <name>,

I read your <post title> and noticed <specific tool> is in there. I built something in a
similar space that might fit alongside it: one-toys.com — 27 client-side developer
utilities (JSON repair, JWT decode, cron, timezones, image compression).

The relevant angle for your piece: there is no backend, so nothing pasted into it is
uploaded — which is why the JWT and JSON tools get used on production data.

No pressure to include it. If it's useful, screenshots are at /og-image.png and I'm
happy to answer anything.

<name>
```

3-5 a week, personalised, no follow-up more than once. Practically all of them will say
no; the 1-in-20 that says yes is worth more than every directory listing combined.
