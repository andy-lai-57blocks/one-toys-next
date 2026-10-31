# Paste-ready listing copy

Every figure here was checked against `src/utils/toolsData.js` — **27 tools across 4
categories** (Code 13, Text 5, DateTime 5, Media 4). Do not inflate these numbers; an
inflated count is the fastest way to look machine-generated to both a reviewer and a
crawler.

---

## Taglines

- 52 chars: `27 free dev tools that run entirely in your browser.`
- 58 chars: `Developer tools that never send your data to a server.`
- 71 chars: `JSON, JWT, cron, timezones and image tools — all client-side.`

## Short description (~160 chars)

> 27 free developer utilities — JSON, Base64, JWT, cron, timezones, image compression.
> Everything runs in your browser, so nothing you paste or upload is ever sent anywhere.

## Medium description (~300 chars)

> For developers who would rather not paste a production JWT or an internal config file
> into an unknown web service, One Toys runs all 27 of its tools inside the browser tab.
> Format and repair JSON, decode JWTs, convert timestamps and timezones, parse cron
> expressions, generate UUIDs and passwords, compress images, extract text from
> screenshots, and build QR codes. Free, no signup, no uploads, no file-size paywall.

## Long description (~700 chars)

> One Toys is a collection of 27 free developer utilities that run entirely client-side.
>
> **Code** — JSON formatter and JSON repair, Base64, URL encoding, HTML/XML/JSON
> escaping, Gzip, JWT decoder, UUID and password generators, VAST formatter.
> **Text** — case converter, character counter, whitespace remover, Lorem Ipsum,
> Markdown preview.
> **DateTime** — Unix timestamp converter, timezone converter across 62 zones, date
> arithmetic, strftime-style formatting, cron expression parser.
> **Media** — image compressor (WebP/JPEG/indexed PNG), image-to-text OCR, QR code
> generator, HLS player.
>
> There is no backend. Text and files are processed in the browser and never uploaded,
> which is the point: the tools people reach for most often are the ones handling
> credentials and internal data. No account, no usage limits, no paywall.

## Categories / tags (pick what the form offers)

`Developer Tools` · `Web Development` · `Productivity` · `Utilities` · `Privacy` ·
`JSON` · `Base64` · `JWT` · `Cron` · `Timezones` · `Image Compression` · `OCR`

## What makes it different (for the "why" field)

- **Nothing is uploaded.** JWT decoding, JSON repair and image compression all happen in
  the tab. The site has no server-side processing and no upload endpoint.
- **JSON Fixer repairs, it does not just reformat.** 18 rules, including truncation
  recovery — it completes a cut-off document instead of silently dropping the tail.
- **Image compression keeps PNG as PNG.** A hand-written indexed-PNG encoder shrinks
  screenshots and graphics while preserving alpha, instead of forcing WebP.
- **No account, no quota, no "upgrade to remove the watermark".**

## Honest limitations (put these in, reviewers notice when you don't)

- Everything is client-side, so very large inputs are bounded by browser memory.
- The OCR tool downloads its language model (5-8 MB) from jsDelivr on first use, then
  the browser caches it.
- The site is supported by ads (Google AdSense); that is the only third party that sees
  a request.
- 27 tools, not hundreds. The set is deliberately small and each one is meant to be the
  best free version of itself.

## Screenshots to prepare (1280x800, light theme)

1. `/code/json-fixer/` with a broken document repaired — the differentiator.
2. `/code/jwt-decoder/` with a decoded payload visible.
3. `/media/image-compress/` showing the before/after size delta.
4. `/datetime/timezone/` with several zones and deltas.
5. Site logo / OG image: `public/og-image.png` (already exists, 1200x630).
