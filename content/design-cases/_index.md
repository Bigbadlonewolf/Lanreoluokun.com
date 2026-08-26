---
title: "Design Cases"
---

Two sets of worked scenarios, both treated as architecture decisions rather than product selections. Neither set is client work. The organisations are illustrative, and where a reference build cannot do something, the case says so rather than rounding up.

**Cases 1 to 4** are reference design scenarios for a regional banking context, worked end to end against the seven-step framework below. Each one frames the problem before naming a component, attaches a rejected alternative to every decision, and states risk in money rather than adjectives.

**ISSAP scenarios 1 to 5** are shorter. They come from ISSAP certification study material and are rewritten here as Architecture Decision Records, which is a harder format than it looks: you have to commit to one decision, name what you rejected, and own the consequences while you can still see them. Reading a scenario walkthrough, the right answer feels obvious because the walkthrough hands it to you. Writing the ADR, you have to generate it. These are study analysis, not engagements I delivered.

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

**The mechanism test.** Every named control whose mechanism is not self-evident from the system named answers four questions: who, through what system, enforced by what, and evidenced by what artifact. A control that survives only as a noun ("encryption", "DLP", "monitoring") is a category label waiting for a decision, not the decision itself.

The mechanism test is the gate. A commitment that names a managed service with built-in enforcement needs less elaboration than one that names a custom process.

The framework above governs cases 1 to 4. The ISSAP scenarios use the ADR shape instead (context, decision, alternatives, consequences), because that is the format the exercise was worth doing in.

## Bank profile

Cases 1 to 4 concern the same illustrative regional US bank. One population, one jurisdiction, one derivation method, so the money figures can be compared across cases instead of each being invented locally.

- **Customer base:** ~250,000 retail customers
- **Card portfolio:** ~150,000 active debit and credit cards
- **Total assets:** ~$2 billion
- **Jurisdiction:** US federal and state banking regulation (GLBA, state breach notification, OCC/FDIC prudential oversight), plus PCI DSS for cardholder data
- **Technology estate:** hybrid — on-premises core banking (mainframe and Oracle) with digital channels on GCP

## What these are grounded in

[Compliance as Code](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE) is public. OPA and Rego evaluate Terraform plan output in CI against PCI DSS v4.0, SOC 2 and NIST 800-53, gated so a non-compliant change cannot merge. 163 of 163 policy tests pass (verified 5 August 2026, OPA 0.68.0).

BankVault and the JIT Access Broker are private reference builds for privileged access on GCP. They are validated, not deployed: `terraform validate` passes against the real provider and a mocked pytest suite runs green, but nothing has run against a live project. That distinction does real work in Case 1, where the design turns on what the access broker deliberately cannot do.

## Principles distilled

What cases 1 to 4 have in common, stated once so each case does not have to argue it again.

- **Frame before components.** The first product name appears only after scope, constraints, boundaries and assumptions are on the table.
- **Decisions come with rejected alternatives attached.** An answer without a rejected alternative is a preference, not a decision.
- **Match the control to the boundary.** When data has to be processed by a third party, contracts are the control plane. When it must not exist at all, architecture is.
- **The best evidence is generated, not collected.** Controls whose operation produces their own audit trail — policy-gated CI, lifecycle-logged access grants — answer a regulator continuously rather than annually.
- **State risk in money.** A board that hears "seven figures of exposure against a five-figure contract" needs no security vocabulary to make the decision.
- **Reasonable assurance, never full.** Precision about what cannot be promised is what makes the promises worth signing.
- **Translate mandates into properties.** When leadership names a framework, the deliverable is testable properties — who can reach what, proven how, evidenced by which artifact — not a product shortlist.
- **State the load-bearing figures.** For any tier-0 dependency: RTO, TTL, renewal interval. Label each as measured, target, or unvalidated. If unvalidated, name the test that validates it and the date.
- **Name the compensating control.** The thing that justifies the asymmetry between normal-state and degraded-state behaviour, and when it is available.
- **Define what invalidates the decision.** Reversal triggers that supersede rather than patch, each tied to a verifiable condition and a deadline.
- **Define what proves it.** Acceptance criteria that test the degraded case, not the happy path: rotate-and-revoke, outage survival, recovery after intervention, DR promotion, load with a thundering herd.
- **Know when to stop.** The one-pager is the real test of clarity.

## What ran across the ISSAP five

Three patterns showed up in all five, and they were not the patterns the walkthroughs advertised.

The wrong answer in every scenario was a single thing asked to do a whole job. One firewall. One framework. One deletion command. One document. One procedure. The right answer was always a structure.

Evidence kept turning out to be the real deliverable. Erasure you can prove. A plan you can demonstrate. A notification backed by logs you would stand behind. That is the difference between security and security theatre.

Every scenario had a timing trap. Erasure has to be designed before the data lands. The DR plan has to be tested before the disaster. Detection has to exist before the clock starts. Architecture is mostly the discipline of doing things earlier than they feel necessary.
