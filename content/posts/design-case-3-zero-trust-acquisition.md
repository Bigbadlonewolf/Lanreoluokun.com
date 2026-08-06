---
title: "Design Case 3: The Board Wants Zero Trust — Translating a Mandate into Architecture"
date: 2026-08-06
draft: true
tags: ["security-architecture", "zero-trust", "gcp", "iam", "mna", "design-cases"]
categories: ["design-cases"]
series: ["Security Architecture Design Cases"]
description: "The bank acquires a fintech with a flat network. The board, briefed by vendor marketing, mandates 'zero trust.' Twelve months, unmodifiable legacy apps, no downtime on payments. The design translates the buzzword into four testable properties — and phases the work so a breach at month four hits a smaller target each month."
---

*Part of the [Security Architecture Design Cases](/posts/security-architecture-design-cases/) series. Previous: [Case 2, the AI vendor for KYC](/posts/design-case-2-ai-vendor-kyc/).*

## The scenario

The bank acquires a smaller fintech lender. The acquired company runs a flat
network: once inside, everything is reachable. The board, briefed by vendor
marketing, mandates "zero trust." Integration must complete within 12 months.
The acquired estate includes legacy applications that cannot be modified — no
modern authentication, no mutual TLS — and payment-adjacent systems that cannot
take downtime. The team is the bank's existing security function plus two
engineers inherited from the acquisition.

## The decision, sentence one

**Deliver zero trust as a phased migration of trust decisions from network
location to identity — not as a product purchase, and not as a big-bang
rebuild.** The board named a framework; the architecture's job is to return
testable properties: no implicit trust from network location, and every access
authenticated, authorized, encrypted, and logged. Anything that cannot be
expressed as one of those properties is marketing, and it does not get budget.

## Scope

**In:** access paths across both entities — user-to-application,
workload-to-workload, administrator-to-production; unification of the workforce
identity plane; protection of the crown-jewel data stores (payment flows,
customer PII).

**Out:** replacing or modifying the legacy applications; the acquired firm's
customer-facing product architecture; corporate productivity networking beyond
what the identity work touches. Each is a separate program with its own case.

## Constraints

- **Legacy systems are unmodifiable** — they can be wrapped and contained, never
  rewritten. Any design that requires them to change is dead on arrival.
- **No downtime on payment flows** — every migration step must be reversible.
- **Unknown inherited posture** — the acquired estate has no reliable asset
  inventory; you cannot segment what you cannot enumerate.
- **12 months** — long enough to phase, short enough that phasing discipline
  decides everything.
- **Board expectations were set by vendor marketing** — progress must be
  reported as risk reduction in money, never as "percent zero trust complete," a
  number that means nothing and can only disappoint.

## Trust boundaries

1. **User → application.** Currently defended by network location — the boundary
   this migration exists to replace with identity and device posture, evaluated
   per request.
2. **Workload → workload.** The flat network's real exposure: east-west movement
   with no internal authorization. This is where a single foothold becomes a
   breach.
3. **The acquisition boundary itself.** Two organizations, two identity systems,
   two sets of privileged users, one unknown asset inventory — the classic
   breach vector in every integration post-mortem.
4. **The admin plane, doubled.** Inherited privileged accounts with unknown
   provenance are the highest-risk access in the combined estate on day one.

## Assumptions

1. **The acquired identity provider can be federated** into the bank's. If not,
   workforce identity unification becomes phase zero and the timeline moves —
   flagged, not buried.
2. **A credible asset inventory can be built within 60 days.** Every downstream
   decision inherits from this one; it is verified before anything else is
   promised to the board.

## The design commitments

**1. Unify workforce identity before buying anything.** Federate the acquired
IdP into the bank's, reconcile privileged accounts, and establish one source of
truth for who anyone is. Every subsequent control depends on identity being
answerable.

*Rejected:* selecting a "zero trust platform" first. Tooling purchased before
identity is unified automates confusion at scale.

**2. Identity-aware ingress in front of applications.** Applications sit behind
an identity-aware access proxy that makes per-request decisions on user identity
and device posture — the pattern developed in the Zero Trust Reference
Architecture — replacing VPN-and-network-location trust for user access.

*Rejected:* network-first microsegmentation as the opening move. Necessary
eventually, but as step one it spends a year re-IP-ing a flat network while the
flat network stays flat.

**3. Wrap the crown jewels; migrate by data sensitivity.** Payment flows and
customer PII stores are wrapped first — proxied access, tightened egress,
dedicated logging — without rebuilding them. Phases follow data sensitivity, not
organizational convenience.

*Rejected:* big-bang re-architecture. Twelve-month transformation programs that
defer all risk reduction to the end die at month eight; phasing that front-loads
the crown jewels means a breach at month four hits a smaller target each month.

**4. Legacy containment, honestly stated.** Applications that cannot do modern
authentication are wrapped by the proxy where reachable, and contained by
network-level segmentation only where the proxy cannot reach — segmentation used
as a compensating control, named as one, with an expiry review.

*Rejected:* modifying the legacy applications. Risk without ownership; the
people who understood those systems left two employers ago.

## The risk statement

Acquisition integrations are the canonical breach scenario: a flat network,
unknown assets, and inherited privileged users, all during the period when
attention is elsewhere. A breach through the acquired entity in year one costs
regulatory penalty plus impairment of the deal's rationale — against which a
phased, identity-first program is the cheaper line item by an order of
magnitude, and it buys measurable risk reduction every quarter instead of a
promise at the end.

## First steps

First 60 days: asset inventory; IdP federation and privileged-account
reconciliation; identity-aware ingress in front of the two crown-jewel data
stores. Report to the board as exposure reduced per quarter, in money.

---

*Series index: [Security Architecture Design Cases](/posts/security-architecture-design-cases/). Canonical text:
[security-architecture-design-cases](https://github.com/Bigbadlonewolf/security-architecture-design-cases).*
