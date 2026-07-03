---
title: "Gating Terraform Plan on a live GCP credential"
date: 2026-07-03
summary: "How I changed SecureVault's CI so format, init, and validate still run when the GCP service-account key is absent, while plan only runs when the credential is present."
status: "Note"
---

The SecureVault CI pipeline has a `terraform` job that used to fail hard whenever `secrets.GCP_TERRAFORM_SA_KEY` was missing. That was wasteful: the backend is local, so `terraform fmt -check`, `terraform init`, and `terraform validate` need no credentials at all. Only `terraform plan` talks to the real GCP project.

## What changed

I split the job into credential-aware and credential-free steps:

1. **Early detection.** A `Check for GCP credentials` step writes `available=true|false` to `$GITHUB_OUTPUT`.
2. **Gate only the credential-hungry steps.** `Authenticate to GCP`, `Terraform Plan`, and `Post Plan to PR` now run only when the secret is present.
3. **Keep the free verification unconditional.** `Terraform Format Check`, `Terraform Init`, and `Terraform Validate` always run, so a missing secret never hides syntax or formatting problems.
4. **Explicit skip message.** An unconditional final step prints either:
   - `GCP_TERRAFORM_SA_KEY is configured; terraform plan ran (or attempted to run).`
   - `GCP_TERRAFORM_SA_KEY not configured; skipped terraform plan (fmt/init/validate still ran).`

This turns a confusing failure into a clean, documented success with partial output.

## Why it matters

In a portfolio repo, not every fork or scratch branch has the live GCP credential configured. Failing the whole job discards useful signal and trains people to ignore CI. Running `fmt`, `init`, and `validate` everywhere while gating only `plan` keeps the feedback loop tight and the blast radius small.

Commit: [`b788f47`](https://github.com/Bigbadlonewolf/SecureVault/commit/b788f47)
