---
title: "ISSAP Scenario 5: A 72-Hour Clock Is a Capability Requirement"
recordID: "ISSAP-05"
status: "Study scenario"
date: 2026-08-26
summary: "A retailer discovers during a tabletop that it cannot detect, scope, and assess a personal-data breach inside the 72-hour window. The tempting reading is that the notification step is missing. It is not. The capability the clock presupposes does not exist."
description: "Treating a breach-notification deadline as an engineering requirement: logging coverage, time sync, monitoring, data mapping, and a rehearsed assessment runbook."
---

## The scenario

A retailer subject to GDPR-style obligations discovers, during a tabletop exercise, that it cannot detect, scope, and assess a personal-data breach inside the 72-hour notification window. Logging is incomplete. Clocks are unsynchronized across systems. There is no defined breach-assessment process.

## Context

The tempting reading is that the notification step is missing. It is not.

The clock is unmeetable because the detection and assessment capability it presupposes does not exist. You cannot notify on a breach you cannot see, scoped against data you cannot map, on a timeline you cannot reconstruct because your clocks disagree.

## Decision

Treat the notification requirement as an engineering requirement, and build the capability it assumes.

**Complete and centralized logging, with synchronized time across systems** (1.2.2). Without time sync you cannot even sequence the events you are reporting on.

**Continuous monitoring and log integrity,** with auditability of the monitoring itself (1.2.3).

**Data mapping,** so the scope of affected subjects can actually be determined (1.3.3). "We were breached" is not a notification. The notification needs whose data, and how much.

**A rehearsed incident-assessment runbook.** Rehearsed, because the first run of an assessment process should not happen inside a live 72-hour window.

One more thing the scenario gets right. Subject-rights obligations, locating and erasing one individual's data, depend on the same data-discoverability capability as breach scoping. The data-mapping investment pays twice. That is the argument to take to the budget holder.

## Alternatives considered

**Bolt a notification procedure onto the existing environment.** Rejected. It optimizes the last mile of a process whose first mile does not exist. You would have a well-drafted notification template and nothing accurate to put in it.

**Buy a detection tool before fixing logging coverage and time sync.** Rejected. Tooling on top of incomplete telemetry produces confident nonsense, which is worse than honest ignorance when a regulator reads it back to you.

## Consequences

The obligation drives the architecture, which is how privacy requirements are supposed to work.

The remediation spans domains, so it needs a program rather than a ticket: logging coverage, time sync, monitoring, data mapping, and a runbook with exercises behind it.

The payoff compounds, because breach response and subject rights sit on the same foundation.

## What I would verify in a real engagement

Time sync first. It is cheap to check and it quietly invalidates everything downstream when it is wrong.

Then logging coverage against the actual data flows, not against what the architecture diagram claims the data flows are.

Then when the runbook was last exercised, and what broke when it was.

## The principle

A regulatory clock is a capability requirement. Build what the obligation presupposes.

---

*This is a study scenario drawn from ISSAP certification material, written up in my own words as analysis. It is not a client engagement and it does not describe work I delivered for an employer. Domain references are to the ISSAP certification outline. The scenario is framed against GDPR-style obligations as the study material presents it, not against a specific named article.*
