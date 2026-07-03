---
title: "ADR 011: Alert routing - SendGrid retirement and Brevo migration"
recordID: "ADR-011"
status: "Accepted"
date: 2026-07-03
summary: "Why Brevo was chosen as the alert channel after evaluating SendGrid and operator-owned SMTP."
---

## Context

Security alerts are useless if they do not reach the right person. The portfolio projects originally used SendGrid for email delivery, but SendGrid's free tier became less predictable for low-volume senders and its pricing scaled faster than the $20/month cost ceiling.

The options were to keep SendGrid, move to operator-owned SMTP through a personal domain, or switch to Brevo.

## Decision

Migrate alert routing to Brevo for the following reasons:

- Free tier covers the expected alert volume across all portfolio projects.
- API and SMTP support allow the same client code to switch transports with minimal change.
- Account setup does not require a corporate domain or dedicated IP.

Operator-owned SMTP was rejected because it introduces deliverability and SPF/DKIM management overhead for a one-person portfolio. SendGrid was rejected because the cost ceiling matters more than marginal deliverability gains at this volume.

## Consequences

**Positive:**

- Stays inside the $20/month ceiling with headroom.
- API-first design makes future migration to an enterprise provider straightforward.
- Brevo failures are caught and logged, so alert loss is detectable.

**Negative:**

- Brevo has no enterprise SLA on the free tier.
- Deliverability to corporate inboxes can vary.
- A future scale-up will require re-evaluation.

## Compliance mapping

- SOC 2 CC7.2: system monitoring
- NIST 800-53 AU-6: audit review

## Status

Accepted. Brevo is the alert channel for SecureVault and BankVault.
