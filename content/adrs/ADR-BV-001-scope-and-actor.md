---
title: "BankVault ADR-001: Scope and actor definition"
recordID: "BankVault ADR-001"
status: "Accepted"
date: 2026-07-08
summary: "Why the whole system is built around one actor-resource pair: an underwriter reading one credit report."
---

# BankVault ADR-001: Scope and actor definition

- **Decision Owner:** Lanre Oluokun
- **Date:** 2026-07-08
- **Status:** Accepted
- **Implementation:** Scope decision, no code artifact

## Context

A loan underwriter opens one borrower's credit report to make one lending decision. That access should last as long as the decision, not as long as the job.

BankVault is a GCP-native Just-In-Time (JIT) access broker. A non-bank mortgage lender has several plausible high-risk pairings: a customer service rep against an account ledger, a compliance officer against an audit trail, an underwriter against a credit report. This record fixes the single pair the rest of the design is built around, and says why.

The credit report (an Experian or TransUnion pull, for example) is treated as already sitting in Cloud Storage, placed there by an upstream ingestion process. BankVault's scope starts at the storage layer. It does not touch the bureau's own API or ingestion pipeline and makes no claims about them.

## Decision

Bind the architecture to one GLBA-governed actor-resource pair: a loan underwriter requesting temporary, read-only access to a credit bureau report. Do not build a general-purpose JIT platform yet.

The underwriter/credit-report pair wins for three reasons. It has the sharpest single regulatory driver, since GLBA NPI protections apply directly rather than by analogy. It has a natural time boundary, since access is bounded by one loan decision instead of an open-ended job function. And it sidesteps a different, harder problem: a CSR's ledger access or an auditor's access is usually standing, role-based access, which is an RBAC hygiene question rather than a JIT elevation question, and a different architecture from the one this project builds.

## Consequences

**Positive:**

- The design couples to a real regulated process (loan origination) with a time box tied to the loan decision SLA.
- One regulatory citation applies without interpretation, and FTC enforcement authority matches the entity type described here.
- The pair can be validated end to end in a 20-minute technical review.
- A narrow scope forces the architecture to optimize for one threat model instead of abstracting too early.

**Negative:**

- This proves depth on one flow, not breadth. It does not show whether the entitlement-per-resource pattern holds up with multiple concurrent actors or resources without more design work.
- It deliberately leaves out standing, role-based access (the CSR/ledger case), which is arguably a higher-volume risk surface for a real lender than one underwriter's occasional credit pull. That is a known, accepted gap, not an oversight.

## Rationale

A narrow, deep, compliance-grounded reference flow can be reasoned about completely. Every control decision maps to a specific regulation, a specific actor, and a specific resource, rather than a hypothetical range of use cases a broader platform would have to wave at. This holds regardless of timeline. It also happens to fit the available build time, which is a reason to build this flow first, not a reason the principle is true.

## GLBA basis

Verified against 16 CFR 314.4, not assumed.

- **314.4(c)(1)(i) to (ii):** authenticate users and permit access only to authorized users, and limit each authorized user's access to only the customer information they need for their duties. This is the basis for the need-based JIT model in BankVault ADR-002 and ADR-003.
- **314.4(c)(8):** monitor and log authorized-user activity and detect unauthorized access. This is the basis for the audit-logging requirement in BankVault ADR-003.
- **Scope note:** 16 CFR 314 covers non-bank financial institutions under FTC jurisdiction. Mortgage lenders and brokers are named in the Rule's own covered-entity examples (314.2(h)). A chartered bank falls under Interagency Guidelines from its own prudential regulator (OCC, FDIC, or Federal Reserve) instead, which is a separate instrument. This project's institution type, a non-bank mortgage lender, is written to match the citation used.

## Alternatives considered

| Alternative | Pros | Cons | Verdict |
|---|---|---|---|
| General-purpose, multi-actor/multi-resource JIT platform | Shows broader platform thinking; reusable across more lender workflows | Requires designing and defending controls for actor and resource types not yet modeled; produces a shallower, harder-to-defend result overall | Rejected. |
| Broad "any restricted GCS bucket" scope, no named regulation | Simpler to describe; not tied to one rule | Weaker regulatory teeth; does not show GLBA-specific reasoning, which is the real differentiator for a financial-services role | Rejected. |
| Standing, role-based access for the underwriter (no JIT elevation) | Simpler to implement; no grant/revoke lifecycle | Defeats the least-privilege premise the rest of this set is built on | Rejected. |

## Assumptions requiring verification

- The underwriter is a real human user with a Google Identity account, not a service account or a shared account.
- The loan origination system has a well-defined "underwriter" role mapping to a single Google Identity group or org unit.
- The credit report is already in Cloud Storage. BankVault brokers access to the stored object; it does not pull from Experian or TransUnion APIs.
- The upstream ingestion process that places the report in Cloud Storage is out of scope and enforces its own controls on the bureau-side pull.
- GLBA is the applicable regulation for this data. FCRA, PCI DSS, or state privacy laws may add constraints on this flow. Not verified here; a real deployment would confirm this with counsel, not just this record.
- "One loan decision" as the time boundary is the rationale here. The grant-window duration that enforces it is decided in BankVault ADR-003.

## References

- [GLBA Safeguards Rule (16 CFR 314)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-314)
