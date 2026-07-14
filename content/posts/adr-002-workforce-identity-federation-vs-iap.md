---
title: "ADR-002: Two Directories Is One Too Many"
date: 2026-07-01
draft: false
tags: ["adr", "security-architecture", "gcp", "iam", "identity"]
categories: ["architecture-decisions"]
description: "Workforce Identity Federation vs. Cloud IAP for internal bank staff: why the loan officer's identity should never be duplicated into a second directory Google owns."
---

Fire a loan officer on a Friday. If your access control depends on someone remembering to also delete their account in a second system, that person can still read customer credit files on Monday.

That's the entire argument in this decision. Everything else is mechanism.

> **TL;DR**
>
> - **Decision:** Workforce Identity Federation is the identity plane feeding IAM policy decisions. Cloud IAP is a complementary transport-layer control for any future browser UI, not the thing that identifies the loan officer to IAM.
> - **Status:** Accepted
> - **Owner:** Lanre Oluokun
> - **Date:** 2026-07-01

## Two mechanisms people keep confusing

Loan officers already exist in the bank's directory: Active Directory, Okta, Azure AD, whichever. That directory is where identity proofing happened, where the background check is recorded, and where the joiner/mover/leaver process actually runs. BankVault needs that identity inside a GCP IAM policy decision without minting a second copy of the person.

GCP offers two things that sound like they do the same job:

**Workforce Identity Federation** swaps an assertion from the bank's IdP for short-lived Google credentials. No Cloud Identity account gets created. The resulting principal drops straight into an IAM policy as a member, including inside a conditional binding, and its claims are readable from `request.auth`.

**Cloud Identity-Aware Proxy** sits in front of an HTTP app and forces a Google-session login before traffic reaches the backend. It authenticates browser sessions to an application. It does not authenticate API callers, and its identity model wants a Cloud Identity account behind it.

Adjacent problems. Different layers. Picking the wrong one has a regulatory cost, not just an engineering one.

## Why the distinction has teeth

The FFIEC Information Security booklet is specific about access rights administration: provisioning and deprovisioning should tie back to one authoritative, auditable system of record. Not two. The failure mode it targets is exactly the one in the opening line of this post, where a leaver gets removed from the directory everyone remembers and survives in the one nobody does.

Route identity through IAP as the primary plane and you need a Cloud Identity account for every loan officer, even a federated one. That's a second identity lifecycle to keep in lockstep with the source of truth. Examiners look for unsynchronized secondary directories. They find them.

Federation keeps the bank's directory as the only thing that matters. Disable the officer there and their ability to obtain a federated credential dies with the assertion. There is no second deprovisioning step to forget.

## What federation buys beyond the compliance argument

Two things, both practical.

IAM conditions can read federated claims directly. A binding can require `request.auth.claims.department == "loan_origination"`, which is an attribute-based backstop sitting underneath the domain-suffix check the broker already does in code. Defense that doesn't depend on my own validation logic being correct is defense worth having.

And there are no standing Google accounts for people who otherwise never touch GCP. You cannot compromise a credential that was never issued.

## What it costs

Honest list, because the setup is not free:

- Workforce pool, provider, and attribute mapping are a one-time configuration this repo's Terraform does not include. It depends on the bank's specific IdP. That's an integration project, not a `terraform apply`.
- WIF gives you no login page. Any future human-facing approval UI still needs its own session-auth story, which is where IAP legitimately belongs.
- Debugging a federated IAM denial is harder than debugging a plain Google account. A CEL condition that reads `request.auth.claims` fails silently if the token never carried the claim, and that's one more thing to get wrong during IdP integration.

## Why not both, as equals

They aren't equals, so the question is malformed. Federation feeds the authorization decision: who is asking, and are they a valid member of this conditional binding. IAP is a gate in front of anything with a browser attached.

A production deployment of the approval UI this system will eventually grow should run both. IAP decides who can load the page at all. The identity IAP surfaces should itself be the federated one, not a Cloud Identity password account bolted on the side.

## Rejected outright

**Cloud Identity accounts for every loan officer, no federation.** This is the duplicated-directory anti-pattern with no fig leaf. Every hire, transfer, and termination mirrored by hand, with nothing guaranteeing the mirror is current.

**Service account impersonation, no end-user identity in the condition.** This one is tempting and quietly fatal. The IAM condition would then authorize "this function," not "this loan officer, for this loan." That collapses a per-officer, resource-bound grant model back into one shared service identity and throws away both the audit trail and least privilege in a single move.

---

View the raw ADR on GitHub → [docs/adr/002-workforce-identity-federation-vs-iap.md](https://github.com/Bigbadlonewolf/bankvault/blob/main/docs/adr/002-workforce-identity-federation-vs-iap.md)
