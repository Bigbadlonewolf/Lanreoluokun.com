---
title: "ADR 001: Trigger Source for SecureVault Misconfiguration Alerts"
recordID: "ADR-001"
status: "Accepted"
date: 2026-05-12
summary: "How SecureVault detects and reacts to misconfigurations — and what changes when the GCP account has no Organization resource."
---

## Context

SecureVault is an event-driven, alert-only detection system covering three misconfiguration classes: publicly exposed Cloud Storage buckets, overpermissive IAM service account keys, and unrestricted firewall rules. The original design used Pub/Sub fed by Security Command Center (SCC) Security Health Analytics as the trigger source, reacting to findings in near real time.

That design assumes an Organization resource exists in the GCP hierarchy. My account does not have one — SCC's `NotificationConfig` resource, which is what pushes findings to Pub/Sub, requires an org or folder scope to attach to. At project level, it isn't available.

## Decision

Two paths were considered:

1. **Provision a real Organization** via Cloud Identity, restructuring the account so the original Pub/Sub trigger design works as specified.
2. **Redesign the trigger** around Cloud Scheduler polling the SCC `findings.list` API at project scope, trading real-time push for scheduled pull.

This decision is still open between the two — documented here as in-progress rather than resolved, because the choice has downstream effects on every other ADR in this project that assumes a trigger mechanism.

## Consequences

If polling is chosen: lower setup cost, no org dependency, but findings latency becomes a function of polling interval rather than near-instant. If Cloud Identity is chosen: the original architecture survives intact, but it adds organizational overhead disproportionate to a single-account portfolio project.
