---
title: "BankVault"
recordID: "PRJ-003"
status: "Reference architecture - validated (terraform validate + pytest green), not deployed"
date: 2026-07-08
weight: 2
summary: "A just-in-time privilege elevation broker for a mortgage lender's loan pipeline, built on Google Cloud Privileged Access Manager. An underwriter gets 30 minutes of access to exactly one credit report, gated on a fresh login, with every request, grant, denial, and expiry flag written to an append-only ledger."
---

**Repo:** [github.com/Bigbadlonewolf/bankvault](https://github.com/Bigbadlonewolf/bankvault) · **CI:** ![Pytest](https://github.com/Bigbadlonewolf/bankvault/actions/workflows/pytest.yml/badge.svg) ![Terraform Validate](https://github.com/Bigbadlonewolf/bankvault/actions/workflows/terraform-validate.yml/badge.svg)

Ask a lender who can read a borrower's credit file today and you will usually get a list of roles rather than a list of people. Standing access is the default almost everywhere, and it survives quarterly review cycles that were never designed to catch a reassignment made in week two.

BankVault removes the standing access entirely. An underwriter who needs a credit report asks for it, proves the login is fresh, gets 30 minutes scoped to that one object, and loses it automatically when the grant expires. Nobody holds a key when they are not using it.

## What it does

The flow is deliberately narrow. One actor, one resource, one regulated data class.

An underwriter requests access to a specific borrower's credit report. The broker checks that the login is fresh, refusing to accept a session token that is merely still valid. If it passes, and a separate approver signs off, Google's Privileged Access Manager issues a 30-minute grant against a per-application entitlement whose IAM Condition pins access to that one object path. GCP evaluates the condition on every access for the life of the grant, and PAM expires the grant on its own when the window closes.

Every request, every grant, every denial, and every expiry flag lands in an append-only BigQuery ledger. A separate viewer-only job checks for grants that outlive their window and flags them.

## The decisions, and what they cost

The architecture is written down before it's defended, including the parts that are uncomfortable.

Access is denied when the identity provider is unreachable. That means BankVault's availability is bounded by the IdP's, and a loan decision with an SLA does not stop having one because Okta is down. I took that trade knowingly, because an identity control that keeps granting access when it cannot verify who is asking has a bypass, and the bypass opens under exactly the conditions an attacker wants.

The reconciliation job detects an overrun. It does not revoke one. So the honest claim is "detected within roughly one 15-minute sweep," not "contained within 15 minutes." Those are different sentences and only one of them is true.

And ADR-001 was reversed one week after I wrote it, when GCP's Privileged Access Manager reached the maturity that made my custom grant lifecycle redundant. The original ADR named that trigger condition explicitly. When it fired, I deleted the custom revocation function rather than defend code whose only remaining justification was that it already existed.

## Architecture decision records

Five ADRs, each with its trade-offs and unverified assumptions stated rather than buried:

- [ADR-001: Build vs. Buy, and the week I reversed it](/posts/adr-001-build-vs-buy-jit-broker/) - why enterprise PAM is the wrong mechanism for resource-scoped cloud IAM grants, and the documented reversal of the build half
- [ADR-002: Two directories is one too many](/posts/adr-002-workforce-identity-federation-vs-iap/) - Workforce Identity Federation over Cloud IAP, so a leaver dies in one directory rather than surviving in a second
- [ADR-003: Scope and actor definition](/posts/adr-003-scope-and-actor-definition/) - one underwriter, one credit report, and the GLBA Safeguards Rule basis for both
- [ADR-004: MFA freshness as the Zero Trust signal](/posts/adr-004-mfa-freshness-zero-trust-signal/) - a fresh login on every request, fail-closed when the IdP is down, and where that check actually runs
- [ADR-005: PAM grant lifecycle, detect not contain](/posts/adr-005-pam-grant-revocation-lifecycle/) - a 30-minute object-scoped grant that PAM expires on its own, plus a watchdog that flags but deliberately does not contain

## Stack

Google Cloud throughout. Privileged Access Manager owns approval and the 30-minute expiry; one entitlement per application carries the object-scope IAM Condition. IAM Conditions (CEL) enforce that scope on every access. Cloud Functions Gen 2 in Python run the broker (the MFA-freshness gate in front of PAM) and the detect-only reconciliation job, each on its own least-privilege service account. BigQuery holds the append-only audit ledger, with a second independent Cloud Logging export as a backstop. Cloud Scheduler and Pub/Sub drive the reconciliation sweep. Terraform defines all of it, and `terraform validate` plus a mocked pytest suite run green in CI.

## Current state

The architecture is accepted and the reference implementation validates: `terraform validate` passes against the real provider (PAM entitlement schema and all), the mocked pytest suite is green, and the MkDocs site builds under `--strict`. The broker, the reconciliation job, and both service accounts are built, which the earlier cut had not finished.

The gaps are listed rather than glossed. The broker's `verify_mfa_freshness` reads the OIDC token's `auth_time` but does not yet verify the token signature against the live IdP JWKS, so that path is a documented stub. The exact PAM grant-request API semantics (who the grantee is when a broker service account requests on an underwriter's behalf) are flagged for verification against the live API before any deploy. Automated containment (wiring the reconcile flag to a real revocation) is deliberately out of scope until it has an alerting and rollback story of its own. And none of it is deployed: this is Terraform, Python, and docs, verified but not run against a live project.

## Explore the code

**[github.com/Bigbadlonewolf/bankvault](https://github.com/Bigbadlonewolf/bankvault)**
