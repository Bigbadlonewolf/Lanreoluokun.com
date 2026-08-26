---
title: "ISSAP Scenario 3: Three Audits Passed, Zero Validation Achieved"
recordID: "ISSAP-03"
status: "Study scenario"
date: 2026-08-26
summary: "An insurer's DR plan is comprehensive, neatly documented, and has passed three annual audits. It has never been exercised beyond a read-through. Documentation is not assurance, and a graduated testing program is what closes the gap."
description: "A continuity plan that passed three audits and was never tested. The graduated testing program that validates it, and why the BIA date is the first thing to check."
---

## The scenario

An insurer's disaster recovery plan is comprehensive, neatly documented, and has passed three annual audits. It has never been exercised beyond a read-through. A new CISO asks the architect to assess continuity readiness.

## Context

The finding writes itself. Documentation is not assurance.

The plan's recovery-time assumptions, failover steps, and dependency mappings have never been validated against reality. If the plan stays untested, the first real test will be an actual disaster, which is the most expensive possible moment to discover that your RTO was fiction.

## Decision

Adopt a graduated testing program, in this order.

1. **A structured tabletop.** Surfaces obvious gaps and stale dependencies cheaply, in an afternoon, with nothing at risk.
2. **A parallel test.** Brings the recovery environment up alongside production, to confirm systems actually recover within RTO and that data loss stays within RPO.
3. **A full-interruption test.** Reserved for when confidence and risk appetite justify it.

Alongside the program, confirm the plan derives from a current business impact analysis. Recovery objectives drift as the business changes. A plan built on a stale BIA recovers the wrong things at the wrong speed, which passes the test and fails the business.

## Alternatives considered

**Go straight to a full-interruption test.** Rejected. High risk to production, and it skips the cheap learning. Most of what a first full test reveals could have been found around a table.

**Treat the audits as assurance.** Rejected by the facts of the scenario: three audits passed, zero validation achieved. Audits check that a plan exists and is maintained. They do not check that it works.

## Consequences

Gaps surface early and cheaply. Testing cost scales with confidence instead of arriving all at once.

The program also creates a maintenance obligation. Every meaningful business change reopens the question of whether the BIA, and therefore the plan, is still current. That obligation needs an owner, or the program decays back into the annual read-through it replaced.

## What I would verify in a real engagement

The date on the BIA, before anything else.

Then whether the RTO and RPO figures trace back to it or were inherited from a template.

Then the dependency map. In this scenario the failover steps assumed dependencies nobody had walked against the real environment, which is exactly the class of error a tabletop catches for the price of an afternoon.

## The principle

A continuity control's value lives in its testing and maintenance, not in its existence on paper.

---

*This is a study scenario drawn from ISSAP certification material, written up in my own words as analysis. It is not a client engagement and it does not describe work I delivered for an employer.*
