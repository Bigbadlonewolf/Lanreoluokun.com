# CLAUDE.md — lanreoluokun.com (Hugo)

Guidance for working in this project. Read this before touching files here.

## Structure
- This folder is the site's git repo, remote `Bigbadlonewolf/Lanreoluokun.com`, deployed to GitHub Pages. Content, layouts, and CI all live here.

## Site
Personal site for Lanre Oluokun — security architecture portfolio and ADRs (architecture decision records) written before decisions are defended, not after.

- Live: <https://bigbadlonewolf.github.io/Lanreoluokun.com/>
- Generator: Hugo, no theme — custom layouts in `layouts/`
- CI/CD: GitHub Actions → GitHub Pages
- Domain: `lanreoluokun.com` (pending DNS cutover)
- Redesigned 2026-06-30: warm/bronze palette, credibility strip

## Commands
```bash
hugo server   # local dev, http://localhost:1313
```

## Content
- ADRs — status one of `Accepted` / `Proposed` / `In Review`
- Portfolio projects — real constraints/blockers/trade-offs, not idealized case studies
- About — career arc: Lagos banker → security guard → cloud security architect

Current portfolio entries live in `content/` — check there for PRJ-00x numbering before adding a new project entry.

Sections under `content/`: `design-cases/` (DC-00x, the seven-step framework), `posts/` (ADRs, added 2026-08-20, reachable from the `ADRs` menu entry at weight 3), plus `_index.md` and `about.md`.

## Deploy

`.github/workflows/hugo.yml` triggers on `push: branches: ["main"]` and runs `build` → `deploy` → `actions/deploy-pages@v4` with no approval gate. **The push to `main` is the publish.** It also accepts `workflow_dispatch`. Branch pushes do not trigger it, so commit on a branch when the change needs review first.

**The workflow pins Hugo `0.123.7`; a current local install is far newer** (`0.163.3` as of 2026-08-20). A green `hugo --minify` locally does not prove the CI build. Watch the run — `gh run watch <id> --exit-status` — rather than assuming.

**Git converts LF to CRLF on every file added here.** There is no `.gitattributes`. Expect the warning on each `git add`; it is also why an archive hashed on Windows differs from one hashed in CI.

## Diagrams — no mermaid, by design

Every diagram is a hand-authored SVG in `assets/diagrams/`, pulled in with `{{< diagram src="<name>" caption="..." >}}`. The shortcode inlines the file so it inherits the page's theme tokens; an `<img>` cannot see the CSS custom properties that `data-theme` flips. A missing asset is a build error, not a silent gap.

**There is no mermaid support anywhere in the site.** A ```mermaid fence renders as a wall of raw source in the published page — this reached production once and had to be replaced. Author the SVG instead, using the existing vocabulary in `static/css/main.css`: `d-zone`, `d-zone-solid`, `d-box`, `d-box-accent`, `d-box-muted`, `d-edge`, `d-edge-accent`, `d-edge-dash`, `d-rule`, `d-bar`, `d-arrow`, `d-arrow-accent`, `d-t`, `d-t-sm`, `d-t-body`, `d-label`, `d-emph`, `d-t-on-accent`, `d-t-on-accent-sm`, `d-strike`. All existing files use `viewBox="0 0 820 …"`, carry `role="img"` with `<title>`/`<desc>`, and prefix marker ids per diagram to avoid collisions.

**Hand-written tables of contents go stale silently.** The headings in these documents are numbered, so Hugo generates `#1-context`, not `#context`. A TOC written against unnumbered headings produces links that resolve to nothing and nobody notices — 21 of 23 were dead on one published page. Derive anchors from the rendered ids, or check with a grep of `<h[1-6] id=` against `href=#` in `public/`.
