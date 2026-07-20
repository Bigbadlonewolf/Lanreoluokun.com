---
title: "ADR-006: The Broker Cannot Request the Grant"
date: 2026-07-20
draft: false
tags: ["adr", "security-architecture", "gcp", "iam", "pam", "zero-trust"]
categories: ["architecture-decisions"]
description: "Architecture decision on who calls CreateGrant in BankVault: why an intermediary broker would have granted standing access to its own service account, and what moving enforcement to the platform cost in precision."
---

I spent a week designing a broker that could not exist. Not because the code was wrong, but because I assumed an API worked the way most APIs work, and it does not. This is the decision record for finding that out and taking the design apart.

> **TL;DR**
>
> - **Decision:** The broker does not create PAM grants. The underwriter requests their own. Login-recency enforcement moves to an Access Context Manager reauth binding at one hour, the platform floor, and the broker's fifteen-minute check becomes evidence rather than enforcement.
> - **Status:** Accepted
> - **Owner:** Lanre Oluokun
> - **Date:** 2026-07-20
> - **Amends:** ADR-004 (where freshness is enforced), ADR-001 (what the broker is for)

## Context

Through ADR-001 and ADR-004, BankVault's request broker did three things: verify the underwriter's login was fresh, validate the request shape, then call `grants.create` on their behalf. The function that made the PAM call carried a note in its docstring saying the grantee semantics had to be verified against the live API before anyone deployed it.

That note was the right instinct. I never cashed it. When I finally did, it closed the design off.

Google's Privileged Access Manager documentation is explicit about who receives the privileges. If you add a group as a requester on an entitlement, all individual accounts in that group can request a grant of that entitlement. But only the individual account requesting the grant receives the elevated privileges. There is no grantee field. There is no on-behalf-of parameter on `CreateGrant`. Privileges attach to the calling principal, full stop.

The broker calls PAM with its own service-account credentials. So the design did not grant credit-report read to the underwriter who asked for it. It granted credit-report read to `bankvault-broker@`, a service account that is always running, holds the binding for the full window, and appears in nobody's quarterly access review.

That is standing access to borrower financial data, held by a non-human identity, created by the control whose entire purpose is eliminating standing access. It is not a bug in the implementation. It is the implementation working exactly as designed, and the design being wrong.

## Decision

The broker does not create grants. The function is deleted, and a test fails if it comes back.

The underwriter requests their own grant against the PAM entitlement, as the eligible principal PAM requires them to be. The broker keeps the two jobs it can actually do: refusing malformed or stale requests before they reach PAM, and writing the `auth_time` that gated each request into the append-only ledger.

Login-recency enforcement moves to an Access Context Manager reauthentication binding on the underwriter group.

## The part where the claim gets smaller

ADR-004 said the broker enforces MFA freshness at fifteen minutes. After this decision, it cannot. An underwriter who never calls the broker still reaches PAM, because they have to be eligible on the entitlement for the grant to work at all. A control you bypass by not calling it is not enforcement.

So enforcement moved to the platform, and the platform has a floor. Access Context Manager's session length accepts zero, or a duration between one hour and twenty-four hours. Nothing in between. **Enforced recency is one hour, not fifteen minutes.**

There is a second cost. A scoped ACM binding can target applications by OAuth client ID or by name, things like Cloud Console and the Google Cloud SDK. Privileged Access Manager is not documented as an independently targetable application. So the binding covers the underwriter group's entire Google Cloud session rather than the credit-report request path. Every underwriter reauthenticates hourly for everything they touch in GCP, including work that has nothing to do with this control.

What survives is a split worth stating carefully, because the tempting version of this sentence is a lie:

- **Enforcement is one hour**, at the platform, on the whole session.
- **Evidence is fifteen minutes**, in the ledger, per request.

The evidence is tighter than the enforcement. That is a real and useful property for an examiner asking what gated a specific credit-report read. It is not the same as saying access requires a fifteen-minute-old login, and I do not get to say that anymore.

## Rationale

Calling the broker a chokepoint was the original error, and everything downstream inherited it. Once you accept that the underwriter must be the eligible principal, the PAM request path is open to them by construction, and any control that lives only in the broker is advisory.

Given that, the choice was between an advisory control described honestly and an enforced control with worse resolution. I took the enforced one and kept the advisory one beside it, because they do different jobs. The ACM binding stops a stale session from reaching anything. The broker's check produces the per-request record that PAM's own logs do not: which application, which justification, and how fresh the login was at that moment.

## Consequences

The broker's blast radius shrank. Its service account holds PAM viewer and BigQuery jobUser. It cannot create a grant, cannot read the credit-reports bucket, and cannot delete ledger rows. The worst case on compromise is falsified or suppressed ledger entries, which is exactly why the platform log export exists as an independent record application code cannot touch.

The ledger's GRANT row went away. The broker never observes a grant being created, so it must not claim one exists. It writes a REQUEST row recording that a request cleared pre-flight, and names the entitlement back to the caller. Grant issuance and expiry are reconstructed from PAM's admin-activity audit logs, exported independently.

The `approved_by` field is a claim, not evidence. It arrives in the request body. The real approval record is PAM's approval workflow and its audit logs, and the compliance mapping points there instead.

The ACM binding is documented but not provisioned. It is an organization-level control that needs an access policy this project does not own, so there is no Terraform resource for it. Until it is applied, enforced recency is a design position rather than a deployed control. I would rather say that than let a diagram imply a control nobody has turned on.

## Reversal condition

If PAM gains a grantee or on-behalf-of parameter allowing an intermediary to request a grant whose privileges attach to a named human, the broker-mediated design becomes viable and the chokepoint argument returns with it. If Access Context Manager gains sub-hour session lengths, or PAM becomes independently targetable by a scoped binding, the enforcement and evidence windows collapse back together and this two-number framing stops being necessary.

## What I would tell someone starting this

The seam that killed this design had a comment on it saying "verify before deploy." I wrote that comment myself, weeks earlier, and then built four more layers on top of the assumption it flagged. The note was not worthless. It was just not load-bearing, because nothing forced me to resolve it before continuing.

The lesson is not "read the docs." I had read them. The lesson is that an unresolved assumption with a polite comment attached is still an unresolved assumption, and the cost of checking it goes up every day you build on it.
