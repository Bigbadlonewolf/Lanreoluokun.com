---
title: "ADR 010: Just-in-time access broker - time-bound conditional IAM vs. external PAM"
recordID: "ADR-010"
status: "Accepted"
date: 2026-07-03
summary: "Why BankVault uses native GCP IAM conditions instead of buying a separate PAM product."
---

## Context

Lending operations need privileged access to production systems for break-glass fixes, vendor support, and batch incident response. Traditional privileged access management (PAM) products provide session recording and time-bound elevation, but they add cost, latency, and another integration point.

GCP IAM Conditions allow time-bound, resource-bound grants using native cloud policy. The question is whether native controls are enough for a regulated lending environment.

## Decision

Build BankVault on native GCP IAM conditions with the following constraints:

- Access requests are approved through a lightweight workflow tied to Google Workspace identity.
- Granted roles expire automatically after a maximum of four hours.
- Grants are scoped to a single project or resource, never to the organization.
- Every grant, renewal, and expiration is logged to Cloud Logging and exported to a WORM audit bucket.

A commercial PAM is rejected for the first release. It adds licensing cost and operational complexity without adding control beyond what IAM conditions plus logging already provide.

## Consequences

**Positive:**

- No additional vendor procurement cycle.
- Lower latency for engineers during incidents.
- Audit logs stay in the same GCP logging pipeline used for other controls.

**Negative:**

- Session recording must be built separately if required by audit.
- The workflow UI is custom, so maintenance falls on the internal team.
- If the bank later needs cross-cloud PAM, migration effort increases.

## Compliance mapping

- PCI DSS v4.0: least privilege and access control (Requirements 7.2, 8.2)
- SOC 2 CC6.1: logical access security
- FFIEC: authentication in an online financial services environment

## Status

Accepted. Implemented in the BankVault project.
