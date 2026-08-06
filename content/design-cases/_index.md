---
title: "Design Cases"
---

Three reference scenarios for a regional bank, worked end to end as architecture decisions rather than product selections. Same method each time: frame the problem before naming a component, attach a rejected alternative to every decision, and state risk in money rather than adjectives.

These are design scenarios, not client engagements. The organizations are illustrative. The architectures and the reference builds behind them are real, and where a reference build cannot do something, the case says so rather than rounding up.

## The framework

Seven steps, same order every time. The order is the whole point. It forces problem-framing before component-naming, which is where architecture defenses usually fall over.

1. **Task.** What is actually being asked, and what decision is owed. For a decision problem the decision leads, in sentence one.
2. **Scope.** What is inside the design and what is explicitly outside it. Every scoped item is a promise the design has to keep.
3. **Constraints.** The givens that limit freedom: time, team, continuity obligations, political reality. Constraints are not risks. Risks are what happen despite the design. Constraints are what the design has to live inside.
4. **Trust boundaries.** Every place data, control, or trust crosses an ownership line. Three kinds: data flows, the admin plane (every privileged human is a boundary), and third parties.
5. **Assumptions.** Written down, each one load-bearing. If it turns out false, a named part of the design changes.
6. **Design commitments.** The decisions themselves, each carrying at least one rejected alternative and the reason it lost.
7. **Close.** Risk in money and consequence, then the first steps that verify the assumptions.

Two checks run before any of it counts as finished.

**Scope-to-design mapping.** Every numbered scope item gets a numbered design commitment, one to one. A requirement that appears in scope and quietly vanishes before the design section is the most common failure in an architecture defense, and it is the easiest one for an interviewer to catch.

**The mechanism test.** Every named control answers four questions: who, through what system, enforced by what, and evidenced by what artifact. A control that survives only as a noun ("encryption", "DLP", "monitoring") is a category label waiting for a decision, not the decision itself.

## What these are grounded in

[Compliance as Code](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE) is public. OPA and Rego evaluate Terraform plan output in CI against PCI DSS v4.0, SOC 2 and NIST 800-53, gated so a non-compliant change cannot merge. 163 of 163 policy tests pass (verified 5 August 2026, OPA 0.68.0).

BankVault and the JIT Access Broker are private reference builds for privileged access on GCP. They are validated, not deployed: `terraform validate` passes against the real provider and a mocked pytest suite runs green, but nothing has run against a live project. That distinction does real work in Case 1, where the design turns on what the access broker deliberately cannot do.
