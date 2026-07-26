# Design Brief: lanreoluokun.com

**Product:** Lanre Oluokun's personal portfolio site (Hugo, GitHub Pages) — ADR-style record of architecture decisions, projects, and career history.
**Audience:** Recruiters and IT/security professionals in New York, specifically hiring managers for Security Architect / Executive Architect roles at financial institutions.
**Constraint:** Content stays intact. Every word in `content/about.md`, `content/projects/*.md`, `content/adrs/*.md`, and `hugo.toml` params is reused verbatim or reformatted — nothing rewritten, nothing invented. This brief changes layout, color, type, and motion only.

Current state: navy/serif-display/mono-label "institutional ledger" aesthetic, deliberately not startup-SaaS. That instinct was right for this audience — a security architect coming from retail banking should not look like a Framer template. This overhaul keeps that instinct but executes it with more weight and intention.

---

## 1. Architecture (page structure, content unchanged)

Current flow: Hero → Projects register → ADRs register (home) / About page via nav.

New flow, same content, restructured for scan-and-credibility in the first viewport:

1. **Hero** — name, role, location, tagline (verbatim from `hugo.toml` params). Add a vertical "seal" rule treatment (see Colors) instead of the current flat 2px line — this is the one purely decorative addition and it's typographic, not an image/icon.
2. **Credibility strip** (new section, zero new copy) — pulls the certifications and prior-employer names that already exist in `about.md` ("CISSP, CCSP, CISM, ISSAP, and GCP Professional Cloud Architect"; "First Bank of Nigeria", "BAT", "ATBOD", "LOG(N) Pacific") into a single horizontal strip directly under the hero, before the visitor has to click into About. Recruiters skim — credentials need to be visible in the first scroll, not buried on page two.
3. **Projects register** — same data-driven loop from `index.html`, restyled as cards instead of table rows (see Architecture detail below). Entry copy (`title`, `summary`, `status`) unchanged.
4. **Records (ADRs) register** — same treatment as Projects, visually distinguished by the existing status-badge system (Accepted / Proposed / In Review) — that system already does real work, keep it, just give it more visual weight.
5. **About** (separate page, nav-linked, unchanged route) — same prose, restyled `doc-body` typography only.
6. **Footer** — unchanged copy.

### Register → card conversion
Current `.register-entry` is a 3-column grid row (ID / title+desc / status). Convert to a card: record ID and status badge share a top row, title as a larger heading below it, description below that. This gives each entry more presence on hover (see Animation) and reads better on the credibility-strip-heavy homepage. Keep the underlying Hugo loop and data fields exactly as in `index.html` — this is a CSS/markup wrapper change, not a content or template-logic change.

---

## 2. Color system (full overhaul)

Current palette (navy/blue/ghost) is fine but flat — blue reads as generic "corporate SaaS link blue" rather than anything specific to the banking/security/governance story. New system:

| Token | Hex | Role |
|---|---|---|
| `--ink` (primary) | `#0B1220` | Near-black navy — headings, hero name, primary text. Slightly darker/cooler than current `#0C1526` for more contrast against the new warm background. |
| `--seal` (accent 1) | `#9A6A2F` | Muted bronze/copper. Used for the hero rule, the credibility-strip border, status-accepted alternative state, and the one place that should feel like an official stamp — this is the color a wax seal or an engraved certificate would use. |
| `--wire` (accent 2) | `#2C4A6E` | Desaturated steel-blue. Replaces the current bright `--blue` for links and interactive states — reads as "wire transfer / ledger ink," not "click here." |
| `--paper` (background) | `#FBF9F5` | Warm off-white, not pure `#FFFFFF`. Evokes a printed document/ledger page rather than a screen. This single change does more than any other to shift the site from "SaaS site with serif font" to "institutional record." |
| `--slate` (text hierarchy: muted) | `#5B6470` | Secondary text, eyebrows, metadata — slightly warmer than current `#6B7280` to sit with `--paper`. |
| `--border` | `#E3DDD2` | Warm-neutral border, replaces cool gray `#E5E7EB` to match `--paper`. |
| Status colors | Keep `--green`/`--amber`, replace `--blue` proposed-state with `--wire` | Status badges already carry real signal (Accepted/Proposed/In Review) — don't touch the semantics, just retint Proposed to match the new accent. |

**Gradient:** none in the hero — a gradient reads as product-marketing. Instead, the hero rule (40px → full credibility-strip-width bronze line) is the single accent move. Restraint is the credibility signal for this audience.

**Why this works for this audience:** finance/security hiring managers respond to *understatement with precision* — a warm paper background and a bronze "seal" accent borrow visual vocabulary from certificates, ledgers, and engraved documents (things this audience already associates with credibility), while the cool steel-blue keeps it from tipping into "law firm letterhead." Pure white + bright blue, by contrast, reads as generic SaaS regardless of font choice.

---

## 3. Animation brief

Current site has zero JS animation — CSS only, instant state changes, `prefers-reduced-motion` already respected (keep that media query as-is). Add restrained motion, not SaaS-style scroll spectacle:

| Element | Effect | Timing / easing |
|---|---|---|
| Hero (name, credentials, rule, tagline, links) | Staggered fade-up on page load only (not scroll-triggered — it's above the fold) | Each element: `opacity 0→1`, `translateY(8px→0)`, `480ms cubic-bezier(0.16, 1, 0.3, 1)`, staggered `80ms` apart starting with the name |
| Credibility strip | Fade-in on scroll-into-view (IntersectionObserver, one-shot) | `400ms ease-out`, no translate — this section should feel stamped in place, not slide |
| Register cards (Projects, ADRs) | Fade-up on scroll-into-view, staggered per card | `360ms cubic-bezier(0.22, 1, 0.36, 1)`, `60ms` stagger, translateY `12px→0` |
| Register card hover | Subtle lift + bronze border accent | `transform: translateY(-2px)`, border-color transitions to `--seal`, `180ms ease-out` — no shadow bloat, a 1px border-color shift plus a 2px lift reads as precise, not playful |
| Status badge | No animation | Static — this is a factual label (Accepted/Proposed/In Review), animating it would undercut its credibility as a real status indicator |
| Nav links / footer links | Underline draws in from left on hover | `width 0→100%` via `::after`, `160ms ease-out` |
| Hero rule (bronze line under name) | Draws left-to-right on load, after name fades in | `width 0→40px` (hero) or full credibility-strip width, `320ms ease-out`, delayed `240ms` after name |

All scroll-triggered animation uses a single shared `IntersectionObserver` (one entry, `threshold: 0.15`), not per-element listeners — keep the JS footprint small for a static Hugo/GH Pages site. Everything above is already covered by the existing `@media (prefers-reduced-motion: reduce)` block in `main.css` (`* { transition: none !important; animation: none !important; }`) — no changes needed there, just confirm new JS-driven animations also check `matchMedia('(prefers-reduced-motion: reduce)')` before attaching the observer.

---

## 4. Credibility strip (replaces generic "social proof")

No customer testimonials exist (this is a portfolio, not a SaaS product) — the equivalent trust signal for a recruiter audience is **credentials + employer pedigree**, both already written in `about.md`. Reformat, don't rewrite:

- **Certifications row:** CISSP · CCSP · CISM · ISSAP · GCP Professional Cloud Architect (pulled verbatim from `about.md` line 13, split on the existing text)
- **Career strip:** First Bank of Nigeria → BAT → ATBOD → LOG(N) Pacific (pulled verbatim from `about.md`, rendered as a compact left-to-right sequence with thin connecting rule, not a full timeline component — keep it to one line on desktop, wraps on mobile)
- **Placement:** Directly below the hero, above the Projects register — first-viewport-or-one-scroll visibility. This is the highest-leverage placement for cold traffic (recruiters who found the GitHub Pages link and have ~5 seconds before deciding to keep reading).
- **Format:** Plain text strip with bronze (`--seal`) dividers between items, mono font (`--mono`) at small size — matches the existing `.eyebrow` / `.entry-id` typographic language already in the codebase, so it reads as part of the system rather than a bolted-on badge row.

---

## Next step
Run `/website-builder build` against this brief to implement directly into `hugo.toml`, `layouts/`, and `static/css/main.css` in `projects/hugo-site/lanre-site/`. No new content files needed — this is a layout/CSS/JS pass only.
