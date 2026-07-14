---
title: "ADR-004: MFA Freshness as the Zero Trust Signal"
date: 2026-07-03
lastmod: 2026-07-08
draft: false
tags: ["adr", "security-architecture", "gcp", "iam", "pam"]
categories: ["architecture-decisions"]
description: "Why BankVault demands a fresh MFA event on every access request, why it denies grants when the identity provider is down, and what that fail-closed choice costs."
---

A stolen laptop with a live session passes an identity check. The user is real, the entitlement is valid, the condition matches, and the audit log records a grant that looks entirely legitimate. Every control in the system agrees, and every control in the system is wrong.

Knowing who someone is tells you nothing about whether their session is still theirs. This decision makes BankVault demand a fresh multi-factor login at the moment an underwriter asks to open a credit report, so a session hijacked an hour ago cannot quietly pull customer NPI on the strength of a sign-in that already happened.

> **TL;DR**
>
> - **Decision:** Require a fresh MFA event on every access request (`max_age=0` OIDC, `auth_time` validated against a 15-minute window). Hard deny if stale or missing. If the identity provider is unreachable, deny. A circuit breaker opens after 3 consecutive IdP failures with a 60-second cooldown.
> - **Status:** Accepted
> - **Owner:** Lanre Oluokun
> - **Date:** 2026-07-03

**Implementation:** `main.py`. Freshness check implemented; identity-validation stub not yet replaced (see ADR-005 Known Gaps).

## The check

The underwriter's tool must request `max_age=0` when it makes the JIT request. That forces the identity provider to re-authenticate the human rather than hand back the session it already had.

The broker then reads `auth_time` from the returned ID token and compares it against a 15-minute window. Stale or missing means denied. This runs on every single request, and nothing is cached.

## When the identity provider is down

It denies. No fallback, no cached `auth_time`, no degraded mode.

This is the part that gets argued, so here is the reasoning. A grant issued without a verifiable fresh authentication event is a grant issued without the signal this whole decision exists to produce. If the system quietly starts granting access when it can no longer verify who is asking, then the control has a bypass, and the bypass opens under exactly the conditions an attacker would most like: identity infrastructure degraded, monitoring noisy, operators distracted by an outage.

Failing open on an identity control is not graceful degradation. It's a control that switches itself off under stress.

Instead of retrying a dying IdP on every request, the broker opens a circuit after three consecutive failures, denies immediately for 60 seconds, then lets one probe through. BankVault should not be adding load to the outage it's reacting to.

Those denials get logged as `IDP_UNAVAILABLE`, kept separate from `MFA_STALE`. An outage and an attack should never look identical in the audit trail, and post-incident review is the exact moment that distinction earns its keep.

## What this costs

Five trade-offs, all accepted, none of them hand-waved.

**Availability coupling is real.** Fail-closed means an IdP outage blocks every JIT grant. Underwriters cannot open credit reports while Okta is having a bad afternoon, and a loan decision with an SLA does not stop having one. The obligation this creates: the bank needs a documented, audited, manually approved break-glass path that lives outside this broker. That path is not built here. Naming it is not the same as having it, and no production deployment should ship this decision without also shipping that.

**Fifteen minutes is a policy choice, not a measurement.** Nothing in this project justifies 15 over 10 or 20. Shorter means more re-auth friction mid-workflow; longer means a wider replay window. The alternative to an unvalidated number is either no window at all, which kills the control, or inventing a justification, which is worse than admitting the number is policy. A real deployment would set it from observed task duration and IdP session behavior.

**The client can defeat this and the broker cannot tell.** I validate `auth_time`. I cannot verify that the client actually asked for re-authentication. A tool that forwards an existing session whose `auth_time` happens to land inside the window passes this check with no fresh MFA event ever occurring. OIDC exposes no signal that separates "the IdP re-authenticated this user because we asked" from "the IdP re-authenticated this user for unrelated reasons." The mitigation is not architectural. It's a client-integration requirement, verified at onboarding and re-verified whenever the tool changes.

**The circuit-breaker numbers are placeholders.** Three failures, 60 seconds. Too sensitive and a network blip locks out underwriters; too tolerant and I hammer a degraded IdP. The values matter far less than the breaker existing, because the failure mode it prevents is prevented at any sane threshold. Tuning needs the IdP's own SLO, which is bank-specific.

**Freshness gates the request, not the window.** This check fires at grant issuance. It does not re-check during the 30 minutes [ADR-005](/posts/adr-005-pam-grant-revocation-lifecycle/) opens. A session compromised after a valid grant is live inherits that access for the rest of the window. Closing it needs session-bound revocation, which depends on OIDC back-channel logout support I have not confirmed the IdP has. ADR-005 records that as deferred with a revisit condition, not as solved.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Device compliance posture (BeyondCorp) | Architecturally stronger, and would partly close the stolen-session gap. I cannot defend the GCP integration mechanism without inventing details, so I won't claim it. |
| Static session token validation | Simpler, no availability coupling. Validates a standing session rather than fresh trust, which is the exact distinction Zero Trust exists to make. |
| Risk-based scoring (anomaly, geo-IP) | Needs data and models this project does not have. Over-engineered for the scope. |
| Fail open when the IdP is down | Preserves availability. Also switches the control off under the conditions most favorable to an attacker. An identity control that fails open is not a control. |

## Rationale

MFA freshness is the Zero Trust signal I can draw, defend, and implement honestly in the time available. Device posture is the better answer on paper, but I don't know the GCP integration well enough to defend it without fabricating specifics. A narrow mechanism I can defend beats a broad one I can only gesture at.

The fail-closed call follows the same logic. A system whose availability is bounded by its identity provider is an honest architecture with a known operational cost you can plan around. A system that grants access to customer NPI when it cannot verify who is asking is not a weaker version of that architecture. It's a different one, whose primary control ships with a documented bypass.

## Assumptions requiring verification

1. The underwriter's tool implements `max_age=0` on every request. Not verifiable server-side. Confirm at onboarding, re-confirm on every client change.
2. The IdP returns `auth_time` in the ID token. Standard OIDC, but bank configurations vary and some suppress it.
3. The 15-minute window is documented as risk-based policy, not sold as an optimized figure.
4. Circuit-breaker thresholds are untuned against real IdP behavior.
5. A manually approved break-glass path exists outside this broker. Assumed by this decision. Not built by this project.

---

View the raw ADR on GitHub → [docs/adr/004-mfa-freshness-zero-trust-signal.md](https://github.com/Bigbadlonewolf/bankvault/blob/main/docs/adr/004-mfa-freshness-zero-trust-signal.md)
