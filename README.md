# lanreoluokun.com

Personal site — security architecture portfolio, ADRs, and projects. Built with Hugo (no theme; custom layouts in `/layouts`).

## Run locally
```
hugo server
```
Visit http://localhost:1313

## Deploy
Push to `main`. GitHub Actions (`.github/workflows/hugo.yml`) builds and deploys to GitHub Pages automatically.

In repo Settings → Pages, set Source to "GitHub Actions" (one-time setup).

## Custom domain
Add a `static/CNAME` file containing `lanreoluokun.com`, then point your domain's DNS:
- A records → GitHub Pages IPs (185.199.108.153, .109.153, .110.153, .111.153)
- or CNAME → <username>.github.io

## Add a new ADR or project
```
hugo new content adrs/adr-002-something.md
hugo new content projects/new-project.md
```
Set `recordID`, `status` (Accepted / Proposed / In Review), and `summary` in the front matter.
