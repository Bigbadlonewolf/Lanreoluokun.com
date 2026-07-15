# Lanre Oluokun — Security Architecture

**Live site:** [lanreoluokun.com](https://lanreoluokun.com/)

Architecture decisions, security engineering, and governance work — written down, not just talked about.

This is my working notebook: architecture decision records, portfolio projects, and the reasoning behind both. Ten years in retail banking, a rebuilt career in cloud and security architecture, and a habit of documenting decisions before defending them in a room.

---

## What's here

| Section | Description |
| --- | --- |
| **ADRs** | Architecture Decision Records with status (`Accepted` / `Proposed` / `In Review`). Written before the meeting, not after. |
| **Projects** | Portfolio work with real constraints, real blockers, and real trade-offs. |
| **About** | The arc: Lagos banker → security guard → cloud security architect. |

---

## Current portfolio

| Project | Description | Status |
| --- | --- | --- |
| **PRJ-001 — Compliance as Code** | OPA/Rego policy enforcement mapped to PCI DSS v4.0, SOC 2, and NIST 800-53. Gated CI pipeline. 50/50 passing policy tests. | ✅ Accepted |
| **PRJ-002 — SecureVault** | Event-driven GCP misconfiguration detection (SCC SHA → Pub/Sub → Cloud Function → email alerts). Currently blocked on trigger-source redesign. | 🔄 In Review |

---

## Tech stack

- **Generator:** Hugo (no theme; custom layouts in `/layouts`)
- **CI/CD:** GitHub Actions → GitHub Pages
- **Domain:** `lanreoluokun.com` (pending DNS cutover)

---

## Run locally

```bash
hugo server
```

Site available at `http://localhost:1313`.
