---
title: "Design Case 1: Migrate the Payment API in 90 Days, Regulator Watching"
date: 2026-08-06
draft: true
tags: ["security-architecture", "gcp", "pci-dss", "migration", "pam", "design-cases"]
categories: ["design-cases"]
description: "A regional bank's payment API goes from on-prem to GCP in 90 days. The regulator wants evidence of cardholder segmentation and time-bound, auditable privileged access. Team of three. The full design, with every rejected alternative."
series: ["Security Architecture Design Cases"]
---

*Part of the [Security Architecture Design Cases](/posts/security-architecture-design-cases/) series — reference scenarios worked end to end as decisions, grounded in systems I've actually built. Next: [Case 2, the AI vendor for KYC](/posts/design-case-2-ai-vendor-kyc/).*

## The scenario

A regional bank runs its customer-facing payment API on-premises. Leadership
wants the workload on GCP within 90 days. The regulator requires evidence that
cardholder data is segmented and that privileged access to production is
time-bound and auditable. The migration team is three people.

## Scope

**In:** the payment API tier and its data path; the cardholder data environment
boundary; the privileged access model for production; evidence generation for
both regulatory requirements.

**Out:** the core banking system (remains on-premises); database replatforming;
all other workloads. A 90-day window that attempts more than this delivers
nothing.

## Constraints

- **90 days** — sequential strategies fail by construction; design and evidence
  collection run in parallel from week one.
- **Team of three** — every design choice is taxed for operational cost. Managed
  services beat self-managed almost every time at this staffing level.
- **Migration, not greenfield** — the API must keep serving customers while it
  moves, and it retains a dependency back to core banking on-premises.
- **Regulator as a primary stakeholder** — evidence is a design output, not an
  afterthought produced before an audit.

## Trust boundaries

1. **Customer device → internet.** Nothing on the far side is controlled;
   clients are assumed hostile.
2. **Internet → GCP edge.** Inspection, rate limiting, and DDoS absorption live
   here — at the provider edge and Cloud Armor, not at the API gateway.
3. **Edge → service tier.** Authenticated, authorized, logged.
4. **Service tier → cardholder data environment.** The compliance boundary. The
   design goal is to make this boundary defend itself by shrinking what lies
   behind it.
5. **The admin plane.** Every human who can touch production is a trust boundary
   with a name on it. This boundary gets its own design, not a bullet point.

## Assumptions

1. **The bank may not need to store PAN at all.** If a payment service provider
   can tokenize at capture, the cardholder data environment shrinks toward zero.
   This is the highest-value question in the engagement, verified in week one.
2. **A GCP organization with at least a minimal landing zone exists.** If not,
   standing one up is week-one work — every subsequent control inherits its
   posture from this foundation.

## The design commitments

**1. Single managed ingress.** A managed API gateway fronts the API, with Cloud
Armor at the provider edge for DDoS and Layer-7 filtering.

*Rejected:* a self-managed gateway (Kong, Envoy on GCE/GKE). A three-person team
cannot safely operate ingress infrastructure while also executing a migration.
The risk is not the build; it is the operate.

**2. Tokenization at the PSP, before PAN reaches bank infrastructure.** Payment
fields are served directly from the payment service provider — hosted fields,
not our code. The raw card number travels from the customer's device over TLS
straight into the PSP's vault; the vault returns a token; the client submits the
token. Every bank-side system — gateway, service tier, databases, logs — sees
tokens only. De-tokenization for settlement happens inside the PSP's vault, on
the PSP's compliance scope.

The consequence is the answer to the regulator's first question: with no PAN in
the environment, the cardholder data environment collapses to the integration
boundary, and the segmentation obligation is satisfied by architecture rather
than by compartmentalization alone. DLP is then redeployed to its correct job —
not blocking exfiltration, but *proving the negative*: continuous scanning for
card-number patterns turns "no PAN exists in our systems" from an assertion into
a monitored, logged, testable claim.

*Rejected:* operating an in-house token vault. Full control and no provider
dependency, at the cost of owning a regulated CDE a three-person team cannot
carry in 90 days.

**3. Zero standing privileged access; just-in-time elevation.** Engineers hold
read-only roles by default. Elevation follows a tracked workflow: request,
recorded approval, a time-boxed grant with an enforced expiry, automatic
revocation when the window closes, and every request, approval, grant, and
revocation written to an immutable audit log. Break-glass access exists for
genuine emergencies, is dual authorized, alarms on use, and is reviewed the next
morning.

This is the pattern implemented across the [JIT Access
Broker](https://github.com/Bigbadlonewolf/JIT-ACCESS-BROKER) and its successor
[BankVault](/projects/bankvault/) — where grant issuance moved from a custom
lifecycle to GCP Privileged Access Manager after [a documented
re-evaluation](/posts/reversing-my-own-architecture-decision/) when the managed
service reached general availability. The defining property holds either way:
the audit log of the grant lifecycle *is* the regulator's evidence. The control
and the proof are the same artifact.

*Rejected:* bastion hosts with standing SSH access — unauditable standing
privilege that fails the second regulatory requirement by design.

**4. Continuous compliance evidence.** Infrastructure changes pass through
policy-as-code evaluation in CI before merge — the pattern implemented in the
[Compliance-as-Code Pipeline](/projects/compliance-as-code/) (PCI DSS v4.0,
SOC 2, NIST 800-53 mappings; gated checks; blocking on violation). Compliance
posture becomes continuous and version-controlled rather than annual and
screenshot-based.

## The risk statement

A failed segmentation assessment means failed audits, card-brand penalties, and
a breach blast radius in which one compromised credential becomes a reportable
event — realistically a seven-figure exposure against controls whose incremental
cost is a fraction of that. And the two headline decisions compound each other:
even a fully compromised admin credential lands in an environment containing no
card numbers. Each control shrinks the other's worst case.

## First steps

Week one: verify the PAN-storage assumption; stand up or validate the landing
zone foundation; place the on-premises connectivity question on the table; open
the PSP contract review.

---

*Next in the series: [Case 2 — approving an AI vendor for KYC without losing the
PII](/posts/design-case-2-ai-vendor-kyc/). Canonical text and the other cases:
[security-architecture-design-cases](https://github.com/Bigbadlonewolf/security-architecture-design-cases).*
