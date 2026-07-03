---
title: "Fixing two CI gremlins in SecureVault"
date: 2026-07-03
summary: "Node.js 20 deprecation warnings and a Terraform Plan step that reported 0s duration: what caused them and how I fixed them."
status: "Note"
---

I noticed the CI pipeline for SecureVault was showing two warnings that kept bugging me.

## Node.js 20 deprecation warnings

GitHub started flagging `actions/checkout@v4` and `actions/setup-python@v5` as running on a deprecated Node.js 20 runtime and forcing them onto Node.js 24. The fix was simple: bump both actions to their latest patch releases:

- `actions/checkout@v4.2.2`
- `actions/setup-python@v5.4.0`

I applied this to all three jobs in `.github/workflows/ci.yml`: Python tests, security scan, and Terraform plan.

## Terraform plan at 0s

The Terraform plan job was only running on `pull_request`, which meant every `push` to `main` showed the job as skipped with a 0s duration. It also hid the plan output from the run logs. I removed the `github.event_name == 'pull_request'` guard while keeping the repository guard so forks without GCP secrets still skip cleanly. The job already ran `terraform init`, `terraform validate`, and `terraform plan` from `./terraform`; now it actually executes and prints the plan to stdout.

## Result

- No more Node.js 20 annotations.
- The Terraform Plan job shows real runtime and real output.
- No `terraform apply` was added. This stays plan-only in CI.

Commit: [`5d76298`](https://github.com/Bigbadlonewolf/SecureVault/commit/5d76298)
