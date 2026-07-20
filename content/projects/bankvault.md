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

An underwriter requests access to a specific borrower's credit report. A pre-flight broker checks that the login is fresh and the request is well formed, refusing anything built on a session token that is merely still valid. The underwriter then requests the grant themselves, a separate approver signs off, and Google's Privileged Access Manager issues a 30-minute grant against a per-application entitlement whose IAM Condition pins access to that one object path. GCP evaluates the condition on every access for the life of the grant, and PAM expires the grant on its own when the window closes.

The underwriter calling PAM directly is not an oversight. It is the correction in [ADR-006](/posts/adr-006-who-requests-the-grant/), and it is the most useful thing in this project.

Every request, every denial, and every expiry flag lands in an append-only BigQuery ledger. Grant issuance and expiry come from PAM's own admin-activity audit logs, exported independently, because the broker never observes a grant being created and should not claim to. A separate viewer-only job checks for grants that outlive their window and flags them.

## The decisions, and what they cost

The architecture is written down before it's defended, including the parts that are uncomfortable.

Access is denied when the identity provider is unreachable. That means BankVault's availability is bounded by the IdP's, and a loan decision with an SLA does not stop having one because Okta is down. I took that trade knowingly, because an identity control that keeps granting access when it cannot verify who is asking has a bypass, and the bypass opens under exactly the conditions an attacker wants.

The reconciliation job detects an overrun. It does not revoke one. So the honest claim is "detected within roughly one 15-minute sweep," not "contained within 15 minutes." Those are different sentences and only one of them is true.

And ADR-001 was reversed one week after I wrote it, when GCP's Privileged Access Manager reached the maturity that made my custom grant lifecycle redundant. The original ADR named that trigger condition explicitly. When it fired, I deleted the custom revocation function rather than defend code whose only remaining justification was that it already existed.

## The second reversal, and what it cost

What survived the first reversal was a broker that checked login freshness and then called `grants.create` on the underwriter's behalf. That function carried a note in its own docstring saying the grantee semantics had to be verified before anyone deployed it. Verifying it killed the design.

Google's documentation is explicit: if a group is a requester on an entitlement, every member can request a grant, but only the individual account that requests it receives the elevated privileges. There is no grantee field and no on-behalf-of parameter. Privileges attach to the caller.

So a broker-mediated grant would not have elevated the underwriter. It would have elevated the broker's service account, an always-on identity holding read access to borrower credit reports that appears in nobody's quarterly review. That is worse than the standing access the project exists to remove.

The broker stopped creating grants. The cost showed up in the freshness claim. Enforcement moved to an Access Context Manager reauthentication binding, and ACM's session length accepts zero, or a value between one hour and twenty-four hours, and nothing in between. **Enforced login recency is one hour, not the fifteen minutes the earlier design claimed.** The broker still rejects anything staler than fifteen minutes and writes that `auth_time` to the ledger, so the evidence is tighter than the enforcement. Two sentences, both true, and I only get to keep them if I do not collapse them into one.

There is a second cost. PAM is not an independently targetable application for a scoped ACM binding, so the reauthentication requirement covers the underwriter group's entire Google Cloud session rather than the credit-report path. Everyone in that group reauthenticates hourly for work that has nothing to do with this control.

## Architecture decision records

Six ADRs, each with its trade-offs and unverified assumptions stated rather than buried:

- [ADR-001: Build vs. Buy, and the week I reversed it](/posts/adr-001-build-vs-buy-jit-broker/) - why enterprise PAM is the wrong mechanism for resource-scoped cloud IAM grants, and the documented reversal of the build half
- [ADR-002: Two directories is one too many](/posts/adr-002-workforce-identity-federation-vs-iap/) - Workforce Identity Federation over Cloud IAP, so a leaver dies in one directory rather than surviving in a second
- [ADR-003: Scope and actor definition](/posts/adr-003-scope-and-actor-definition/) - one underwriter, one credit report, and the GLBA Safeguards Rule basis for both
- [ADR-004: MFA freshness as the Zero Trust signal](/posts/adr-004-mfa-freshness-zero-trust-signal/) - a fresh login on every request, fail-closed when the IdP is down, and where that check actually runs
- [ADR-005: PAM grant lifecycle, detect not contain](/posts/adr-005-pam-grant-revocation-lifecycle/) - a 30-minute object-scoped grant that PAM expires on its own, plus a watchdog that flags but deliberately does not contain
- [ADR-006: The broker cannot request the grant](/posts/adr-006-who-requests-the-grant/) - PAM elevates the caller, so the intermediary design would have granted standing credit-report access to a service account

## Stack

Google Cloud throughout. Privileged Access Manager owns approval and the 30-minute expiry; one entitlement per application carries the object-scope IAM Condition. IAM Conditions (CEL) enforce that scope on every access. Cloud Functions Gen 2 in Python run the pre-flight broker (validation, a freshness check, and the per-request ledger row; it cannot create grants) and the detect-only reconciliation job, each on its own least-privilege service account. BigQuery holds the append-only audit ledger, with a second independent Cloud Logging export as a backstop. Cloud Scheduler and Pub/Sub drive the reconciliation sweep. Terraform defines all of it, and `terraform validate` plus a mocked pytest suite run green in CI.

## Current state

The architecture is accepted and the reference implementation validates: `terraform validate` passes against the real provider (PAM entitlement schema and all), the mocked pytest suite is green, and the MkDocs site builds under `--strict`. The broker, the reconciliation job, and both service accounts are built, which the earlier cut had not finished.

The gaps are listed rather than glossed. The broker's `verify_mfa_freshness` reads the OIDC token's `auth_time` but does not yet verify the token signature against the live IdP JWKS, so that path is a documented stub. Automated containment (wiring the reconcile flag to a real revocation) is deliberately out of scope until it has an alerting and rollback story of its own. One entitlement per loan application does not scale, which follows from the IAM Condition being static per entitlement rather than being something I would defend.

The Access Context Manager binding is documented, not provisioned. There is no access-context-manager resource in the Terraform, because it is an organization-level control this project does not own an access policy for. Until it is applied, enforced recency is a design position rather than a deployed control, and the broker's fifteen-minute check is the only freshness logic actually present in the repo.

The grant-request question that used to sit here as an open assumption is now closed. It was checked, the answer invalidated the design, and [ADR-006](/posts/adr-006-who-requests-the-grant/) records what replaced it.

None of it is deployed: this is Terraform, Python, and docs, verified but not run against a live project.

## Explore the code

**[github.com/Bigbadlonewolf/bankvault](https://github.com/Bigbadlonewolf/bankvault)**
