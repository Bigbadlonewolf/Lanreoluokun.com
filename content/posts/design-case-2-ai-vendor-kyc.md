---
title: "Design Case 2: Approving an AI Vendor for KYC Without Losing the PII"
date: 2026-08-06
draft: true
tags: ["security-architecture", "ai-governance", "vendor-risk", "kyc", "privacy", "design-cases"]
categories: ["design-cases"]
series: ["Security Architecture Design Cases"]
description: "The onboarding team wants a third-party AI to process KYC documents. A vendor touching PII, a model nobody can inspect, leadership already sold. Sixty days to decide and design. The answer: approve with conditions — and the conditions are the design."
---

*Part of the [Security Architecture Design Cases](/posts/security-architecture-design-cases/) series. Previous: [Case 1, the payment API migration](/posts/design-case-1-payment-api-migration/) · Next: [Case 3, zero trust after an acquisition](/posts/design-case-3-zero-trust-acquisition/).*

## The scenario

The bank's onboarding team wants to use a third-party AI document-processing
service for KYC — passports, utility bills, proof of address. Compliance is
concerned: a vendor touching customer PII, and a model no one inside the bank
controls or can inspect. Leadership wants a decision and a design in 60 days.

## The decision, sentence one

**Approve, with conditions — and the conditions are the design.** Contractual
conditions: defined PII protection, retention and deletion after processing, no
training on bank data, subprocessor disclosure and approval, breach notification
inside the regulatory window, and continuous audit rights. If the vendor will
not sign these, the recommendation flips to reject. A condition with no
consequence is a wish; the willingness to say no is what makes the yes credible.

## Scope

**In:** the complete lifecycle of the KYC document and the vendor's output —
capture in the bank's channels, transmission to the vendor, processing on vendor
infrastructure, retention and deletion on both sides, and the onboarding
decision path the AI's verdict feeds.

**Out:** rebuilding the onboarding workflow itself; any use of this vendor
beyond KYC documents. Expansion is a future decision with its own assessment,
not a rider on this one.

## Constraints

- **60 days** — due diligence runs in parallel with design, not before it.
- **Onboarding latency budget** — the check sits inside the customer acquisition
  path; added friction breaks conversion.
- **Black-box model** — internals cannot be inspected, so the design cannot rely
  on understanding the model. It must bound what the model can see and what its
  output can do.
- **Unknown training data** — provenance and bias questions cannot be answered
  directly; they must be bounded contractually and monitored empirically.
- **Political reality** — leadership already wants this vendor. The architect's
  job is to make "yes" safe, not to say "no" from the sidelines.

## Trust boundaries

1. **Capture channel → bank environment.** Standard; the bank controls it.
2. **Bank → vendor.** The decisive boundary. The vendor must read cleartext
   documents to process them — so from this line onward, technical controls
   effectively end and the control plane becomes **contractual and procedural**.
   Encryption protects data in motion and at rest; it cannot protect data being
   processed. Any design that answers this boundary with encryption alone has
   not understood what processing means.
3. **Vendor → its subprocessors.** If the service wraps a third-party foundation
   model, customer PII may flow to a fourth party never assessed by the bank.
   Subprocessor disclosure and approval rights are not boilerplate; they are a
   trust boundary made visible.
4. **The decision path.** Where does the AI's output land? If it influences an
   onboarding accept/decline, fair-lending and adverse-action obligations attach
   to a model no one can fully explain. This boundary determines the bank's
   regulatory exposure more than any technical one.

## Assumptions

1. **The vendor will sign the required data-handling commitments.** If false,
   the recommendation flips to reject — flagged to leadership in those words.
2. **The AI output is advisory.** A human or a deterministic rule makes the
   actual onboarding decision. If the business wants straight-through automated
   decisions, the regulatory exposure changes category and the design changes
   with it.

## The design commitments

**1. Contractual control plane — carries the primary load.** A data processing
agreement specifying: retention and deletion SLAs after processing; prohibition
on training vendor models on bank data; subprocessor disclosure with approval
rights; breach notification inside the bank's regulatory window; and audit
rights, or a current SOC 2 Type II plus penetration-test attestation in their
place.

**2. Technical minimization — carries what it can.** Transmit the minimum image
set the check requires, over TLS, to a regional processing endpoint, with
customer-managed encryption keys where the vendor supports them. Log every
document transmitted, so the bank can prove what crossed boundary two. Retain in
the bank's own environment what AML record-keeping rules require.

**A necessary correction: KYC data is not anonymized.** Customer identification
programs exist to verify identity, and the underlying records must be retained
by law. Anonymizing KYC data would be a compliance violation dressed as a
control. Minimization applies to *what the vendor sees and keeps*; retention
obligations apply to *what the bank must hold*. Confusing the two fails in both
directions.

**3. Model governance.** The vendor model is treated with the same discipline
regulators apply to any consequential model: documented validation, ongoing
monitoring for drift, and a challenger comparison on a sample of decisions. The
exposure analysis — fair-lending risk, adverse-action reasoning, model risk
management expectations — is maintained as an architecture decision record,
which serves as the starting artifact for compliance review rather than a
promise to produce one. The policy-as-code patterns from the
[Compliance-as-Code Pipeline](/projects/compliance-as-code/) supply the
continuous evidence model this governance posture is reported through.

*Rejected:* building document processing in-house — in 60 days the bank would
produce a weaker model with zero validation history; the vendor's risk is
knowable and contractible, an in-house build's is neither. *Also rejected:*
pre-anonymizing documents — technically broken for image processing, legally
wrong for identity records.

## The risk statement

Vendor retention or leakage of onboarding PII means regulatory penalty,
mandatory notification, and customer attrition — realistically a seven-figure
event riding on a five-figure annual contract. The conditions in this design are
inexpensive insurance against the plausible version of that event.

What the board is offered is **reasonable assurance**. No honest officer
promises full assurance over a third-party black box; the difference between the
two phrases is whether a risk statement means anything.

## First steps

Week one: verify the two assumptions; redline the data processing agreement;
obtain the subprocessor list; agree the decision-path constraint (advisory only)
with the onboarding business owner.

---

*Next in the series: [Case 3 — the board wants zero trust](/posts/design-case-3-zero-trust-acquisition/). Canonical text:
[security-architecture-design-cases](https://github.com/Bigbadlonewolf/security-architecture-design-cases).*
