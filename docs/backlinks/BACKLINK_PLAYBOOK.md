# Backlink playbook — one-toys.com

Status: **0 known inbound links.** Domain registered 2025-08-28 (~14 months old).
Technical SEO is clean (see repo memory `seo-indexing.md`); authority is the gap.

---

## 0. What actually moves the needle

| Link type | Example | Ranking value |
| --- | --- | --- |
| Editorial link in a real article | someone writes "use one-toys for this" | **high** |
| Listing on a curated, human-edited directory | AlternativeTo, SaaSHub | low individually, cumulative |
| Profile / social / forum link | HN, Reddit, dev.to, V2EX | low, mostly `nofollow` — but they drive **discovery** (crawlers and humans) |
| Link exchange, paid link, "partners" page, comment spam | — | **negative risk.** Link spam under Google's policies → manual action |

So: directories are the *floor*, not the strategy. The ceiling comes from **content other
people want to cite** (section 4). Plan for 3-6 months before the domain has enough
authority to rank for competitive terms.

**Do not** use "submit to 1000 directories" services. They create low-quality links that
Google attributes to you.

---

## 1. Measure first (10 minutes, do this before submitting anything)

- **Google Search Console → Links.** This is the ground truth for what Google has
  actually credited. It will be empty today; that is the baseline.
- **Ahrefs Webmaster Tools** (free) — https://ahrefs.com/webmaster-tools — gives a
  Referring Domains count and a `site:` / DR proxy. Re-check monthly.
- **Vercel Analytics → Referrers.** Already installed (`@vercel/analytics` in
  `src/app/layout.tsx`). This shows which listing actually sends *humans*, which
  Search Console cannot tell you.

Do not put `?utm_*` on links you do not control — you cannot, and if a site does it
yourself, the parameterised URL can get crawled separately. Referrer data is enough.

---

## 2. Tier 0 — UNBLOCKED 2026-10-31

| Page | Status |
| --- | --- |
| `/about` | **Live in code** — who runs the site, why everything is client-side, what the site does not do, the honest limitations. |
| `/privacy` | **Live in code** — states plainly what stays on the device and names the third parties that do see requests: Vercel, Google AdSense, jsDelivr (OCR model), the HLS stream host. |
| `/contact` | **Live in code** — `andy@57blocks.com`, plus what a reproducible bug report needs. |
| Footer | **Live in code** — About / Privacy / Contact + the four categories on every page. |
| `Organization` + `sameAs` | Partly done: `/about` emits an `AboutPage` with an `Organization` node (name, URL, email). **`sameAs` is still empty** — add GitHub / X / LinkedIn URLs once they exist. |
| Screenshots | Still needed: 1280x800 PNGs of JSON Fixer, JWT Decoder, Image Compress, Timezone. |

Still outstanding before submitting: create the public GitHub repo (see Tier 1 #7), and collect the four
screenshots.

---

## 3. Tier 1 — listings worth submitting to

One per week, not all in one day (a burst of new links on a 14-month domain looks
manufactured).

| # | Target | Where | Cost | Notes |
| --- | --- | --- | --- | --- |
| 1 | **AlternativeTo** | https://alternativeto.net/manage/add-app/ | free, login | Highest-traffic dev-tool directory. List as an alternative to *JSON Formatter*, *CyberChef*, *TinyPNG*, *JWT.io* — one listing per tool where it genuinely competes. |
| 2 | **SaaSHub** | https://www.saashub.com/submit | free tier | Accepts free tools. Edit the listing after approval. |
| 3 | **Product Hunt** | https://www.producthunt.com/posts/new | free | Needs a live launch: copy + 3 screenshots + first comment. Prepare the comment (it is what people actually read). |
| 4 | **Indie Hackers** | https://www.indiehackers.com | free | "Products" entry + a build-story post; the post is the part that earns the link. |
| 5 | **Slant** | https://www.slant.co | free | Add as an option under existing "best X for Y" questions. |
| 6 | **Peerlist / Uneed / Tiny Startups** | verify each submit path first | mostly free, some queued | Launch-day links. Low value, near-zero effort. |
| 7 | **GitHub** | publish a public repo | free | The current remote is `personal.git` (internal). Publishing even a small part — e.g. `src/utils/imagePng/` — with a README pointing at the live demo is a clean, permanent, contextual link. **Highest ratio of value to effort on this list.** |

Skip anything that asks for a reciprocal link or a payment to "expedite review" — that is
a link scheme and it is attributable to you.

---

## 4. Tier 2 — communities (real traffic, mostly `nofollow`)

Read the rules of each before posting. One badly-received self-promo post can get a
domain banned from a subreddit permanently.

| Venue | Angle | Rule to respect |
| --- | --- | --- |
| **Hacker News — Show HN** | "Show HN: 27 developer tools that never send your data to a server" | One shot. Must be *interesting to hackers* — lead with the engineering (static export, client-side OCR, hand-written PNG encoder), not the marketing. |
| **r/InternetIsBeautiful** | browser-only tools, no signup | Strict: no referral/self-promo feel, title must describe the site plainly. |
| **r/webdev — Showoff Saturday** | Saturdays only | Self-promo outside that thread is removed. |
| **r/javascript, r/SideProject** | build-story framing | Check sidebar before posting. |
| **dev.to / Hashnode** | technical write-ups (see below) | Self-published; the article body is where you get a real contextual link. |
| **V2EX 分享创造 · 掘金 · 少数派** | if the CN market matters | Much lower competition for a Chinese-language post than EN. |

**Do not** drop links in Stack Overflow answers. They get deleted, and repeated attempts
get the account banned.

---

## 5. Tier 3 — the only thing that produces editorial links

Nobody links to "another online tool". They link to *a claim with evidence in it*. The
repo already contains three genuinely linkable findings — write them up, publish on
dev.to/Hashnode (canonical to a `/blog` route on one-toys.com later), and the links
follow:

1. **"We hand-wrote an indexed PNG encoder because the browser can't"** — the
   measured results are strong: -74% / -69% / -71% / -72% on real files, 50.1 dB from
   exact-histogram quantisation, and the counter-intuitive bit (filter 0 beats adaptive
   filtering on indexed data, 11-34% smaller). This is HN-front-page material.
2. **"Tesseract's default PSM is wrong for screenshots"** — 97.0% → 99.8% mean
   accuracy across 10 fixtures, with the single biggest win being upscaling to a 2400px
   long edge. Concrete numbers, reproducible.
3. **"A JSON formatter is not a JSON fixer"** — the 18 repair rules and the truncation
   bug where the "largest balanced value" heuristic silently discards the user's data.

Each post ends with "the tool is here: https://one-toys.com/code/json-fixer/" — that is
the link. Three good posts beat a hundred directory listings.

---

## 6. Cadence

- Week 1: Tier 0 pages land → Tier 1 #1 and #2.
- Week 2-4: one Tier 1 per week + publish post #1.
- Month 2: Show HN + Reddit, timed to post #2 existing (so the site looks alive).
- Month 3+: one technical post per month; re-check Search Console → Links monthly.

Log everything in `tracker.csv` in this folder. If a listing is still `pending` after
6 weeks, assume it was rejected and move on.
