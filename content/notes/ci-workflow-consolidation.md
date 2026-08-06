---
title: "Consolidating SecureVault's CI/CD workflows"
date: 2026-07-03
summary: "Why I deleted two workflow files, pinned every CI tool, and replaced a fake deploy gate with a real Checks API verification."
status: "Note"
---

SecureVault had four workflow files with overlapping responsibilities. That produced duplicate security scans, a manually dispatchable zombie plan workflow, and a deploy job whose "verification" step was just an `echo`.

## What changed

### Deleted

- `.github/workflows/security-scan.yml`: duplicated the `security` job already in `ci.yml`.
- `.github/workflows/terraform-plan.yml`: claimed to be superseded by `ci.yml` but remained manually dispatchable, creating an ungated second plan path.

### Updated `.github/workflows/ci.yml`

All CI now runs through one file. Tool versions are pinned for deterministic builds:

- `bandit==1.7.9`
- `pip-audit==2.7.3`
- `pytest==8.2.2`
- `bridgecrewio/checkov-action@v12`
- `trufflesecurity/trufflehog@v3.80.1`

### Rewrote `.github/workflows/deploy.yml`

The old `verify` job printed a reminder and exited cleanly no matter what CI actually showed. I replaced it with a job that queries the GitHub Checks API for the latest `main` commit and fails the workflow if any required check is red. Only when verification passes does the `deploy` job run `terraform apply` and deploy the Cloud Function.

## Why it matters

Consolidation removes duplicate CI runs and conflicting status checks. Pinning tools prevents surprise breakages from `@master`/`@main` drift. A real deployment gate means the pipeline enforces safety instead of relying on a human remembering to check CI first.

Commit: `4de87ee` (SecureVault, private repository)
