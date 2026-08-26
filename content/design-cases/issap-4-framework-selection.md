---
title: "ISSAP Scenario 4: 'We Need to Pick a Security Framework' Is Five Questions"
recordID: "ISSAP-04"
status: "Study scenario"
date: 2026-08-26
summary: "A growing fintech asks its new architect to pick a security framework. That request sounds like one decision. It is at least five, each with a different right answer, and naming a single framework means quietly failing four of them."
description: "Framework selection by purpose rather than preference: communicate, implement, prioritize, demonstrate, govern. Plus the sequencing rule that keeps certification from arriving before implementation."
---

## The scenario

A growing fintech tells its new architect: "We need to pick a security framework."

## Context

The request sounds like one decision. It is not.

Hidden inside it are at least five different purposes, and each one has a different right answer. Naming a single framework means picking which purpose to serve and quietly failing the other four.

## Decision

Decline to name one framework. Map framework to purpose instead.

**To communicate risk posture** to the board and investors: NIST CSF 2.0 profiles. Profiles are a communication tool. That is what they are for.

**To implement controls:** draw from ISO/IEC 27002, mapped to NIST 800-53 where a regulated customer expects it.

**To prioritize with a small team:** CIS Implementation Groups, IG1 then IG2. An ordered runway beats a flat control catalog when you have four engineers.

**To demonstrate assurance** to enterprise customers: ISO/IEC 27001 certification, which governs the management system, and a SOC 2 Type II, which attests operating effectiveness.

**To govern the cloud estate:** the CSA Cloud Controls Matrix, with a STAR Level 2 expectation for providers.

Join these with crosswalks so one body of evidence answers several obligations. Sequence by maturity: prioritize and implement now, certify and attest as the business and customer demands grow.

## Alternatives considered

**Adopt a single framework end to end**, say 800-53 for everything. Rejected. It answers the implementation question well and the board-communication question badly, and it drags a four-engineer team into a control catalog sized for a federal agency.

**Certify first.** Rejected. Attesting to a management system you have not implemented yet buys a finding, not assurance.

## Consequences

One evidence base answers multiple obligations. That is the efficiency, and it is worth real money in questionnaire season.

The cost is crosswalk maintenance. Frameworks revise on their own schedules, and the mappings drift the moment nobody owns them.

The sequencing discipline matters more than the framework choices themselves. Implement, then certify. The reverse order is how companies end up holding certificates their engineers do not recognize.

## What I would verify in a real engagement

Who owns each crosswalk after I leave.

And what the sales team is actually being asked for in security questionnaires. The questionnaire pile is usually the honest statement of which framework the market expects, and it rarely matches the one leadership names first.

## The principle

"Which framework" is usually several frameworks, each leading for the purpose it serves.

---

*This is a study scenario drawn from ISSAP certification material, written up in my own words as analysis. It is not a client engagement and it does not describe work I delivered for an employer.*
