---
title: "BankVault"
recordID: "PRJ-003"
status: "In progress - architecture accepted, implementation partial"
date: 2026-07-08
summary: "A just-in-time privilege elevation broker for a mortgage lender's loan pipeline. An underwriter gets 30 minutes of access to exactly one credit report, gated on a fresh MFA event, with every grant, denial, and revocation written to an append-only ledger."
---

Ask a lender who can read a borrower's credit file today and you will usually get a list of roles rather than a list of people. Standing access is the default almost everywhere, and it survives quarterly review cycles that were never designed to catch a reassignment made in week two.

BankVault removes the standing access entirely. An underwriter who needs a credit report asks for it, proves the login is fresh, gets 30 minutes scoped to that one object, and loses it automatically. Nobody holds a key when they are not using it.

## What it does

The flow is deliberately narrow. One actor, one resource, one regulated data class.

An underwriter requests access to a specific borrower's credit report. The broker re-authenticates them through the identity provider, refusing to accept a session token that is merely still valid. If the login is fresh, Google's Privileged Access Manager issues a 30-minute entitlement carrying an IAM Condition that pins access to that single object path. GCP evaluates the condition on every access attempt for the life of the grant.

Every grant, every denial, and every revocation lands in an append-only BigQuery ledger. A separate viewer-only job checks for grants that outlive their window and flags them.

## The decisions, and what they cost

The architecture is written down before it's defended, including the parts that are uncomfortable.

Access is denied when the identity provider is unreachable. That means BankVault's availability is bounded by the IdP's, and a loan decision with an SLA does not stop having one because Okta is down. I took that trade knowingly, because an identity control that keeps granting access when it cannot verify who is asking has a bypass, and the bypass opens under exactly the conditions an attacker wants.

The reconciliation job detects an overrun. It does not revoke one. So the honest claim is "detected within roughly 45 minutes," not "contained within 45 minutes." Those are different sentences and only one of them is true.

And ADR-001 was reversed one week after I wrote it, when GCP's Privileged Access Manager reached GA and made my custom grant lifecycle redundant. The original ADR named that trigger condition explicitly. When it fired, I did what I said I'd do rather than defend code whose only remaining justification was that it already existed.

## Architecture decision records

Five ADRs, each with its trade-offs and unverified assumptions stated rather than buried:

- [ADR-001: Build vs. Buy, and the week I reversed it](/posts/adr-001-build-vs-buy-jit-broker/) - why enterprise PAM is the wrong mechanism for resource-scoped cloud IAM grants, and the documented reversal of the build half
- [ADR-002: Two directories is one too many](/posts/adr-002-workforce-identity-federation-vs-iap/) - Workforce Identity Federation over Cloud IAP, so a leaver dies in one directory rather than surviving in a second
- [ADR-003: Scope and actor definition](/posts/adr-003-scope-and-actor-definition/) - one underwriter, one credit report, and the GLBA Safeguards Rule basis for both
- [ADR-004: MFA freshness as the Zero Trust signal](/posts/adr-004-mfa-freshness-zero-trust-signal/) - a fresh login on every request, fail-closed when the IdP is down, and the five costs of that choice
- [ADR-005: PAM grant and revocation lifecycle](/posts/adr-005-pam-grant-revocation-lifecycle/) - a 30-minute object-scoped grant that expires on its own, plus a watchdog that flags but does not contain

## Stack

Google Cloud throughout. Privileged Access Manager issues the grants. IAM Conditions (CEL) enforce the resource scope on every access. Cloud Functions Gen 2 in Python run the broker and the reconciliation job. Secret Manager holds session tokens under a prefix the broker's own service account is IAM-conditioned to, so it cannot read any other secret in the project. BigQuery holds the audit ledger. Cloud Scheduler and Pub/Sub drive the watchdog. Terraform defines all of it.

## Current state

The architecture is accepted. Implementation is partial and the gaps are listed rather than glossed: the identity-validation path in `main.py` is still stubbed, the reconciliation job and its dedicated service account are not built, and the org policy disabling service account key creation has not been applied.

## Explore the code

**[github.com/Bigbadlonewolf/bankvault](https://github.com/Bigbadlonewolf/bankvault)**
