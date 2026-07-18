---
title: "ADR-005: PAM Grant/Revocation Lifecycle"
date: 2026-07-08
draft: false
tags: ["adr", "security-architecture", "gcp", "iam", "pam"]
categories: ["architecture-decisions"]
description: "Architecture decision on BankVault's grant lifecycle: why native PAM expiry plus a detective reconciliation job, and the honest limits of that choice."
---

Approving access is the easy part. The hard part is making sure it goes away on time, every time, without anyone having to remember to click revoke. This decision hands the clock to Google's Privileged Access Manager: access to one credit report, scoped to one object, that expires on its own after 30 minutes, with a separate watchdog that flags any grant overstaying its window. It also states, plainly, what that design does not protect against.

> **TL;DR**
>
> - **Decision:** PAM issues a 30-minute, object-scoped grant after the freshness check. A separate viewer-only job flags overruns but does not auto-revoke.
> - **Status:** Accepted
> - **Owner:** Lanre Oluokun
> - **Date:** 2026-07-08

**Implementation:** the reconciliation job and its viewer-only service account are built; `verify_mfa_freshness` reads `auth_time`, but JWKS signature verification is still stubbed. Validated with `terraform validate` and a mocked pytest suite, not deployed.

## Context

This lifecycle governs how long a loan underwriter's access to GLBA-regulated NPI in Cloud Storage lasts once ADR-004's freshness check has already passed. ADR-003 fixed actor/scope; ADR-004 gates the grant *request* on a fresh MFA event. This ADR does not re-check freshness during the access window. That boundary is stated explicitly, not assumed.

## Decision

GCP Privileged Access Manager (GA) issues the grant via a project-level entitlement, `maxRequestDuration = 1800s` (30 minutes). The role binding carries a static IAM Condition scoping access to the one credit-report object from ADR-003, evaluated on every access attempt for the life of the grant. The broker's dedicated service account (sole eligible requester on this entitlement, no exportable keys once org policy is applied) calls PAM's grant API after the ADR-004 check passes.

```
resource.type == "storage.googleapis.com/Object" &&
resource.name == "projects/_/buckets/{BANKVAULT_NPI_BUCKET}/objects/{CREDIT_REPORT_OBJECT}"
```

## Consequences

**Positive:** GA lifecycle enforcement. Continuous per-access resource-path check. Broker and monitoring identities kept separate, bounding blast radius on either side.

**Negative:** MFA freshness gates grant issuance only, not the full 30-minute window. A session compromised after a valid grant is active inherits that access with no further freshness re-check for the remaining window. Static CEL doesn't generalize past one actor/object without rearchitecting. PAM's own behavior on a missed auto-expiry is undocumented.

## Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|---|---|---|---|
| Custom IAM Conditions + Cloud Function grant/revoke layer | Full control over revocation triggers | Reimplements a GA lifecycle GCP already manages | Rejected |
| Session-bound revocation | Tighter security window | Requires OIDC back-channel logout support from the IdP, unverified as available | Deferred, revisit once back-channel logout capability is confirmed |
| Standing access, manual revocation | Simplest to build | Defeats the JIT/Zero Trust premise | Rejected |

## Rationale

PAM automates the specific, repeated judgment the Safeguards Rule requires (reconsidering legitimate business need for access) by re-deciding it per request rather than on a periodic manual cycle. This supports one control within a Safeguards Rule program; it is not compliance on its own.

## Monitoring

A separate service account, holding only `roles/privilegedaccessmanager.viewer` on this entitlement, runs a Cloud Scheduler job every 15 minutes invoking a Cloud Function that lists active grants and compares each against the `expireTime` PAM itself returns for that grant. Overruns are logged to Cloud Logging. Detective only: **the job flags, it does not revoke.**

## Residual Risk

This is a detection bound, not an exposure bound. If PAM's expiry silently fails, the overrun is flagged within roughly one 15-minute sweep of the window closing, but access remains active until a person acts on that log entry. There is no automatic revoke. The honest claim is "detected within ~15 minutes of the window closing," not "contained within 15 minutes." Acceptable for portfolio scope, since PAM's expiry is expected to work and this is a backstop for an undocumented failure mode rather than a primary control. Would need tightening before any real deployment.

## Known Gaps (Implementation, Not Architecture)

- `verify_mfa_freshness` reads `auth_time` but does not yet verify the token signature against the live IdP JWKS.
- Automatic-revoke (containment) is deliberately not built: it needs its own alerting and rollback story before running unattended against the access plane.
- PAM grant-request API semantics (grantee when a broker service account requests on an underwriter's behalf) to be confirmed against the live API before deploy.
- `iam.disableServiceAccountKeyCreation` org policy not yet applied or confirmed.

## Prerequisites / Assumptions Requiring Verification

- Target GCS bucket has uniform bucket-level access enabled (required for the IAM Condition to apply).
- Exact-match CEL syntax on a full object path, inside a PAM entitlement condition specifically, is a standard CEL pattern but unconfirmed against a worked GCP example. Treat as likely, not verified.
- Cloud Logging write occurs synchronously with grant activation/expiry.
- OIDC back-channel logout availability on the identity provider (Google Identity / workforce identity federation), unverified.

---

View the raw ADR on GitHub → [docs/adr/005-pam-grant-revocation-lifecycle.md](https://github.com/Bigbadlonewolf/bankvault/blob/main/docs/adr/005-pam-grant-revocation-lifecycle.md)
