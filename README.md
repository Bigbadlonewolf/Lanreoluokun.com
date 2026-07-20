# Lanre Oluokun — Security Architecture

**Live site:** [bigbadlonewolf.github.io/Lanreoluokun.com](https://bigbadlonewolf.github.io/Lanreoluokun.com/)

Architecture decisions, security engineering, and governance work — written down, not just talked about.

This is my working notebook: architecture decision records, portfolio projects, and the reasoning behind both. Ten years in retail banking, a rebuilt career in cloud and security architecture, and a habit of documenting decisions before defending them in a room.

---

## What's here

| Section | Description |
| --- | --- |
| **ADRs** | Architecture Decision Records with status (`Accepted` / `Proposed` / `In Review`). Written before the meeting, not after. |
| **Projects** | Portfolio work with real constraints, real blockers, and real trade-offs. |
| **About** | The arc: Lagos retail banker → career rebuild → cloud security architect. |

---

## Current portfolio

| Project | Description | Status |
| --- | --- | --- |
| **PRJ-001 — Compliance as Code** | OPA/Rego policy enforcement mapped to PCI DSS v4.0, SOC 2, and NIST 800-53. Gated CI pipeline. 113/113 passing policy tests. | ✅ Shipped |
| **PRJ-002 — SecureVault** | Event-driven GCP misconfiguration detection (SCC SHA → Pub/Sub → Cloud Function → email alerts). Architecture complete; deployment pending. | 🔄 In Review |
| **PRJ-003 — BankVault** | Just-in-time privilege elevation broker on GCP Privileged Access Manager. Validated with `terraform validate` and a green pytest suite; not deployed. | ✅ Architecture accepted, not deployed |
| **GCP Hardened Landing Zone** | Terraform landing zone for GCP financial workloads with OPA policy gates, mapped to PCI DSS v4.0, NIST 800-53, and SOC 2. | ✅ Deployed in a test GCP project (per repo README) |

---

## Tech stack

- **Generator:** Hugo (no theme; custom layouts in `/layouts`)
- **CI/CD:** GitHub Actions → GitHub Pages
- **Hosting:** GitHub Pages at `bigbadlonewolf.github.io/Lanreoluokun.com`

---

## Run locally

```bash
hugo server
```

Site available at `http://localhost:1313`.
