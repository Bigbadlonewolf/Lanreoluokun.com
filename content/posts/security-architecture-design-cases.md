---
title: "Three Design Cases: Showing the Decisions, Not Just the Artifacts"
date: 2026-08-06
draft: true
tags: ["security-architecture", "gcp", "pci-dss", "zero-trust", "vendor-risk", "decision-making"]
categories: ["essays"]
description: "A portfolio of repos shows what I built. It can't show how I decide. So I wrote three banking design cases — payment migration, an AI vendor for KYC, zero trust after an acquisition — worked end to end as decisions with rejected alternatives."
---

A GitHub portfolio has a structural blind spot: it shows what got built, but not
how the decision got made. A reviewer can read my Terraform and still know
nothing about how I'd handle "the regulator wants evidence in 90 days" or "the
board wants zero trust." Those prompts don't have repos. They have reasoning.

So I wrote three design cases — reference scenarios for a regional bank, each
worked end to end the way I'd work them in a design review — and published the
full text alongside the artifacts they draw on. This post is the short version:
the framework, one decision walked through, and where to read the rest.

## The framework, because it's the actual product

Every case runs the same seven steps: task, scope, constraints, trust
boundaries, assumptions, design commitments, close. Two quality checks before
anything is called done.

The first check is **scope-to-design mapping**: every numbered scope item must
have a numbered design commitment, one to one. It sounds trivial. It catches the
single most common failure in architecture defenses — a requirement that gets
echoed into scope and then quietly dies before the design. I've watched myself
do it. The check exists because willpower doesn't work.

The second is **the mechanism test**: every named control must answer four
questions — who, through what system, enforced by what, evidenced by what
artifact. A control that survives only as a noun — "encryption," "DLP,"
"monitoring" — is a category label, not a decision. Panels, regulators, and
incident reviewers all probe exactly one level below the noun. The design has to
live there.

## One decision, walked through

The second case: the bank's onboarding team wants a third-party AI service to
process KYC documents. Passports, utility bills. A vendor touching PII, a model
nobody in the bank can inspect, leadership already emotionally committed.

The decision: **approve with conditions — and the conditions are the design.**

The reasoning chain matters more than the answer. The vendor must read cleartext
documents to process them, which means encryption — the instinctive first answer
— protects the data in motion and at rest but cannot protect it *while being
processed*. From the moment a passport image crosses to the vendor, the
technical control plane ends and the contractual one begins: retention and
deletion SLAs, no training on bank data, subprocessor disclosure, breach
notification inside the regulatory window, audit rights. And the conditions need
teeth: if the vendor won't sign, the recommendation flips to reject. A condition
with no consequence is a wish.

Two corrections are built into the case because I got them wrong before I got
them right. KYC data is not anonymized — identity records must be retained by
law, so anonymization is a compliance violation dressed as a control;
minimization applies to what the vendor sees, not to what the bank must hold.
And the board gets offered *reasonable* assurance, never full — the difference
between those two phrases is whether a risk statement means anything.

## The three cases

| Case | What it exercises | Grounded in |
|------|-------------------|-------------|
| Payment API migration in 90 days, regulator watching | Segmentation by scope elimination, JIT privileged access | [JIT Access Broker](https://github.com/Bigbadlonewolf/JIT-ACCESS-BROKER), [BankVault](/projects/bankvault/), [Compliance-as-Code](/projects/compliance-as-code/) |
| Third-party AI vendor for KYC | Contractual control planes, model governance, saying yes safely | Compliance-as-Code, ADR practice |
| Zero trust mandated by a board, after an acquisition | Translating a framework mandate into testable properties, phased migration | Zero Trust reference architecture, BankVault |

The third case is my favorite, because "the board wants zero trust" is the most
dangerous prompt format there is. Repeat the buzzword back and you've failed.
The case translates it into four testable properties — no implicit trust from
network location; every access authenticated, authorized, encrypted, logged —
and then phases the migration so a breach at month four hits a smaller target
each month. Progress gets reported to the board as exposure reduced in money,
never as "percent zero trust complete," a number that means nothing and can only
disappoint.

## Where the full text lives

The complete document — all three cases, every rejected alternative with its
reasoning, the risk statements in money — is in the
[security-architecture-design-cases](https://github.com/Bigbadlonewolf/security-architecture-design-cases)
repo. It connects to the same discipline as the ADR trail: [the build-vs-buy
decision for the broker](/posts/adr-001-build-vs-buy-jit-broker/) and [the
reversal that replaced half of it](/posts/reversing-my-own-architecture-decision/)
are what Case 1's privileged-access design actually rests on.

The artifacts prove I can build. These cases are the record of how I decide.
A hiring panel needs both, and only one of them was visible before.
