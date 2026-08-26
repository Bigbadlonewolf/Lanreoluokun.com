---
title: "ISSAP Scenario 1: One Firewall Is Not a Security Design"
recordID: "ISSAP-01"
status: "Study scenario"
date: 2026-08-26
summary: "A colleague proposes a next-generation firewall in front of a high-value financial-reporting service and calls that the security solution. The firewall is fine. The problem is the word 'the'. Rewritten as an ADR with the rejected alternative attached."
description: "Why a single preventive control fails a financial-reporting service, and what the full control taxonomy looks like when every layer traces to an obligation."
---

## The scenario

A high-value internal financial-reporting service needs securing. A colleague proposes putting a next-generation firewall in front of it and treating that as the security design.

## Context

The firewall is a fine control. The problem is the word "the".

One preventive control, however strong, is one point of failure. When it gets misconfigured, bypassed, or simply does not cover the attack path someone actually uses, nothing sits behind it. A perimeter device also does nothing about the insider who already holds valid credentials, and for a financial-reporting service that insider is a realistic threat, not a hypothetical one.

## Decision

Reject single-control reliance. Design across the whole control taxonomy.

**Preventive.** Network segmentation isolating the service. Strong authentication. Least-privilege authorization. Encryption in transit and at rest.

**Detective.** Logging of all access including failures. Anomaly alerting. File-integrity monitoring on the reporting data itself.

**Corrective.** Isolated immutable backups with a restore path that has actually been run.

**Administrative.** Separation of duties, so no single person can both alter a report and approve it. Access reviews. Awareness training.

**Physical.** Controls where the service's infrastructure actually lives.

Then trace every control to the obligation it serves: the integrity requirement on the reporting data, what the SOC expects to see, the regulatory expectations in play. That trace is not paperwork for its own sake. It is what keeps the design defensible when somebody challenges the cost of any single layer.

## Alternatives considered

**The firewall-only proposal.** Rejected on two grounds. It fails the single-point-of-failure test. And it leaves the credentialed-insider path completely open, which for financial reporting is the path that matters most.

## Consequences

No single failure takes the service's security with it.

The cost is real, and worth stating plainly: more components to run, more logs to review, more access reviews to schedule. That cost gets accepted because each layer answers a different failure mode, and each one can be defended against a specific obligation rather than against a general feeling that more security is better.

## What I would verify in a real engagement

Whether the restore path has been tested, not just configured.

Whether the separation-of-duties rule is enforced by the system or only by policy text. Those are different controls with the same name.

Whether logging covers failures. Failed-access logs are where you first see somebody probing the service, and they are the logs most often left off by default.

## The principle

Defense in depth means controls of different functions and different natures, no one of which is a single point of failure.

---

*This is a study scenario drawn from ISSAP certification material, written up in my own words as analysis. It is not a client engagement and it does not describe work I delivered for an employer.*
