---
title: "ADR-001: Build vs. Buy, and the Week I Reversed It"
date: 2026-07-01
lastmod: 2026-07-08
draft: false
tags: ["adr", "security-architecture", "gcp", "iam", "pam"]
categories: ["architecture-decisions"]
description: "Why an off-the-shelf PAM platform is the wrong tool for resource-scoped GCP IAM grants, and why I reversed the build half of this decision seven days after making it."
---

Most banks already own a PAM platform. CyberArk, Delinea, BeyondTrust: six figures a year, a vault cluster to patch, and a category name examiners recognize on sight. So the obvious move for a just-in-time access broker is to buy one more connector and call it done.

I didn't. Then, one week later, I reversed half of my own decision. Both of those are in this record, because an ADR that quietly edits away its own mistakes is worth nothing.

> **TL;DR**
>
> - **Decision:** Build a custom broker on native GCP IAM Conditions rather than buy enterprise PAM. Feed the audit ledger into whatever PAM or SIEM the bank already runs.
> - **Status:** Superseded in part by ADR-005 (2026-07-08). The build-vs-buy conclusion stands. The grant-issuance mechanism does not.
> - **Owner:** Lanre Oluokun
> - **Date:** 2026-07-01

## The problem with buying

A loan officer should never hold standing read access to a customer PII bucket. They should get a time-bound grant, scoped to the one application they're working, and lose it automatically.

PAM platforms are excellent at something adjacent to that, which is the trap. Their core abstraction is a vaulted credential you check out and check back in. That fits an admin SSHing into a server. It does not fit "read this one object in Cloud Storage for the next 30 minutes," which is a CEL expression attached to an IAM binding, evaluated by Google on every access attempt.

You cannot express a resource-scoped conditional binding as a credential checkout. It's a mechanism mismatch, not a configuration problem, and no amount of connector tuning closes it.

The rest of the comparison follows from that. Native IAM Conditions are first-class on GCP and bolt-on at best in the major PAM platforms. The custom path costs invocations rather than seats. The audit ledger lands in BigQuery, queryable by any GRC tool the bank owns, instead of inside a vendor's proprietary reporting layer.

## What buying still gets right

This is not an argument that PAM platforms are wrong for banks. They are the correct tool for shared and service credentials, for session recording on privileged interactive access, and for one control plane across a messy on-prem and multi-cloud estate.

A bank that already runs CyberArk should not stand up a second, disconnected access-governance system and pretend that's an improvement. Two ledgers telling two stories is itself an audit finding. So the recommendation attached to this decision was always: keep the broker for what cloud IAM does better, and pipe its BigQuery ledger into the existing PAM or SIEM as a downstream sink, so examiners read one consolidated access story.

That half of the decision never moved.

## The reversal

The original ADR listed GCP's own Privileged Access Manager under Alternatives Considered, marked Preview, with one line attached: a real production decision should re-evaluate once it reaches GA.

It reached GA. So I re-evaluated, and [ADR-005](/posts/adr-005-pam-grant-revocation-lifecycle/) adopts it. PAM now issues the grant through a project-level entitlement with a 30-minute cap. The custom grant and revoke functions I'd chosen here are rejected there, on the grounds that they reimplement a lifecycle Google now manages natively.

Reversing a decision seven days after making it costs credibility if the reversal is unprincipled. This one isn't. The original ADR named the exact trigger condition, the condition fired, and I did what I said I'd do. The alternative was maintaining code whose only remaining justification was that I had already written it. That's a worse failure than a documented reversal, and it's how architectures rot.

The reversal has a price, and it belongs in the record too. The custom broker would have given me full control over revocation triggers, including paths GCP PAM does not expose. PAM's behavior on a missed auto-expiry is undocumented. ADR-005 covers that gap with a detective reconciliation job, which flags an overrun but does not revoke it. I traded a known unknown for a managed lifecycle, deliberately, and wrote the residual risk down instead of absorbing it quietly.

## What survived, precisely

| Original claim | Status today |
|---|---|
| Build a custom Cloud Functions broker | **Superseded** by ADR-005 |
| Feed the audit ledger into the bank's existing PAM/SIEM | **In force** |
| IAM Conditions as the enforcement primitive | **In force** |
| Vendor PAM is a poor fit for resource-scoped cloud grants | **In force** |
| Custom code carries custom risk | **Narrowed** to the request-validation layer only |
| GCP-native PAM: revisit at GA | **Resolved.** Revisited. Adopted. |

Read this ADR as the record of why not enterprise PAM. Read ADR-005 as the record of how the grant is actually issued.

## One correction worth naming

The original rejection of "do nothing, just run quarterly access reviews" cited PCI DSS 7.2. That was the wrong regime. [ADR-003](/posts/adr-003-scope-and-actor-definition/) fixes the institution as a non-bank mortgage lender under FTC jurisdiction, which makes the GLBA Safeguards Rule the instrument that applies. PCI DSS applicability to this flow was never verified, so it is no longer claimed.

The argument itself didn't change. A quarterly review cycle means a reassigned loan officer can keep reading customer NPI for up to three months, which is the exact anti-pattern this system exists to close. Only the citation was wrong, and a wrong citation in a compliance argument is worth catching before an examiner catches it for you.

---

The raw ADR lives in the BankVault repository, which is private. This post is the full text.
