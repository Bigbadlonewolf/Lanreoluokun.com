---
title: "BankVault ADR-002: Zero Trust signal, MFA freshness"
recordID: "BankVault ADR-002"
status: "Draft"
date: 2026-07-03
summary: "A max_age=0 OIDC check gates every JIT grant on a fresh MFA event, not a standing session."
---

# BankVault ADR-002: Zero Trust signal, MFA freshness

- **Decision Owner:** Lanre Oluokun
- **Date:** 2026-07-03
- **Status:** Draft. One flagged gap is not confirmed resolved (see Consequences).
- **Implementation:** `main.py`

## Context

A valid underwriter with a valid loan file is still not enough to hand over credit-bureau NPI. The session itself has to be fresh.

BankVault enforces Zero Trust at the point of the JIT grant. Identity alone, an assigned underwriter plus a valid loan application, does not prove the request is coming from a trusted session right now. The broker has to verify the session, not just the user's authorization.

## Decision

Check MFA freshness with a `max_age=0` OIDC constraint. The underwriter-facing tool must request `max_age=0` at the point of the JIT request. Forwarding an existing session token instead of forcing re-authentication would turn this check into a no-op. The broker validates the returned ID token's `auth_time` claim against a 15-minute window. Deny hard if the claim is stale or missing. The check runs on every JIT request. No session caching.

## Consequences

**Positive:**

- A defensible Zero Trust signal that is request-scoped, not session-scoped.
- Fails safe: deny by default.
- The audit log captures `MFA_STALE` denials.

**Negative:**

- The 15-minute window is a policy choice, not an empirically validated number.
- `max_age=0` enforcement depends on the client tool implementing it correctly.
- Behavior when the IdP itself is unavailable is not yet written as a Decision. Review flagged this as needing an explicit fail-closed rule with circuit-breaker behavior. It stays an open item here rather than a settled decision.

## Alternatives considered

| Alternative | Pros | Cons | Verdict |
|---|---|---|---|
| Device compliance posture (BeyondCorp, agent-based) | Stronger signal; covers device health plus identity | Cannot yet defend the GCP implementation mechanism | Rejected. |
| Static session token validation (no forced re-auth) | Simpler client integration; no re-auth latency | Validates a standing session, not fresh trust; defeats the point | Rejected. |
| Risk-based scoring (anomaly detection, geo-IP) | More sophisticated signal | Needs data and models that are not available; over-built for this scope | Rejected. |

## Rationale

MFA freshness is the Zero Trust signal I can draw, defend, and implement honestly in the time available. Device posture is the stronger answer on paper, but the GCP integration details for it are not known well enough to defend without inventing them. A narrow, defensible mechanism beats a broad, hand-waved one.

## Assumptions requiring verification

- The underwriter-facing tool implements `max_age=0` on every JIT request.
- The IdP returns the `auth_time` claim in the ID token. This is standard OIDC, but bank IdP configs vary.
- The 15-minute window is documented as risk-based policy, not presented as an optimized figure.
