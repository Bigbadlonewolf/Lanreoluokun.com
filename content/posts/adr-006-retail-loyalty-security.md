---
title: "ADR-006: Security Architecture for a Retail Loyalty Platform"
author: "Lanre — Cloud Security / Enterprise Architect"
date: "2026-08-19"
tags: ["architecture", "security", "cloud", "compliance", "ADR", "PCI-DSS", "loyalty-platform", "zero-trust"]
description: "A Zero Trust security approach for a cloud-native retail loyalty platform, including the PCI-DSS scope decision and loyalty-specific fraud controls, with the critique and fixes that followed."
---

> **Author:** Lanre — Cloud Security / Enterprise Architect  
> **Certifications:** CISSP, CCSP, CISM, ISSAP, GCP-PCA  
> **Date:** 2026-08-20

---

## Overview

**ADR-006** addresses a retailer building a cloud-native loyalty platform. It decides on Zero Trust architecture, SAQ-A PCI scope minimization via a hosted payment page, and loyalty-specific fraud controls.

The companion record is [ADR-005: Regional Data Residency and Hierarchical Encryption](../adr-005-regional-data-residency/).

---

## Contents

- [1. Context](#1-context)
- [2. Decision](#2-decision)
- [3. Threat-to-Control Mapping](#3-threat-to-control-mapping)
- [4. PCI-DSS Scope Decision](#4-pci-dss-scope-decision)
- [5. Trust Boundary Controls](#5-trust-boundary-controls)
- [6. Compliance Mapping](#6-compliance-mapping)
- [7. Consequences](#7-consequences)
- [8. Related Decisions](#8-related-decisions)
- [9. References](#9-references)
- [Fix Log: Validation & Critique Response](#fix-log-validation--critique-response)

---

| Field | Value |
|---|---|
| **Title** | Security Architecture Approach for Cloud-Native Retail Loyalty Platform |
| **Status** | Proposed |
| **Date** | 2026-08-19 |
| **Author** | Lanre |
| **Stakeholders** | CISO, Enterprise Architecture, Platform Engineering, Compliance (PCI-DSS), Privacy Officer, Fraud Operations |



## 1. Context

A retailer is building a new customer loyalty platform on public cloud with the following components:

- Public web and mobile front end
- API gateway / layer
- Microservices back end
- Customer-profile data store (personal data)
- Third-party payment processor integration
- Third-party email provider integration

The architect must establish the security architecture approach **before** detailed design begins. This ADR records the decision on frameworks, threat-modeling methodology, and control strategy.

**Business Context:** Loyalty points are a stored-value currency inside the retailer's ecosystem. Points balances, earn/burn transactions, referral bonuses, and promotional credits are direct financial liability and fraud targets. The primary loyalty-specific threat vectors are account takeover for points theft, points laundering across accounts, insider point issuance, and business-logic manipulation of earn/burn rules.



## 2. Decision

We will adopt a **defense-in-depth, Zero Trust security architecture** grounded in inherited enterprise frameworks, not greenfield invention.

### 2.1 Framework Inheritance
| Layer | Framework / Standard | Role |
|---|---|---|
| Enterprise Architecture | TOGAF ADM | Security work woven into relevant ADM phases |
| Risk & Traceability | SABSA | Map every control to a business driver and documented requirement |
| Cloud Security | CSA Enterprise Architecture | Cloud-native reference architecture |
| Design Principle | Zero Trust | No implicit trust; authenticate/authorize every inter-service call; microsegmentation; pervasive monitoring |

### 2.2 Threat-Modeling Stack
| Method | Purpose | Scope |
|---|---|---|
| **STRIDE** | Systematic per-element, per-boundary threat enumeration | Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege |
| **LINDDUN** | Privacy threat analysis | Linkability, Identifiability, Non-repudiation, Detectability, Disclosure of information, Unawareness, Non-compliance |
| **MITRE ATT&CK** | Threat realism & prioritization | Retail-sector threat intelligence — **three techniques cited in §3.2** |

**CVSS Exclusion:** CVSS scoring belongs to post-implementation vulnerability management (operational phase). It is out of scope for this pre-design architecture decision.

### 2.3 Trust Boundaries
The data flow diagram establishes the following trust boundaries:

1. Internet → Front End
2. Front End → API Layer
3. API Layer → Microservices
4. Microservices → Customer-Profile Data Store
5. Microservices → Third-Party Payment Processor
6. Microservices → Third-Party Email Provider

### 2.4 Rejected Alternatives

#### Alternative A: Greenfield Custom Security Framework

| Aspect | Assessment |
|--------|------------|
| **Description** | Build a bespoke security framework and control taxonomy specific to the loyalty platform, without inheriting enterprise standards |
| **Why Rejected** | Reinvents validated patterns; creates audit friction (auditors cannot map controls to recognized standards); no vendor or community support; knowledge walks out the door when architects leave. The enterprise has already invested in TOGAF, SABSA, and CSA — abandoning that investment for one platform is unjustified. |
| **Residual Use** | None — all security work must inherit enterprise frameworks |

#### Alternative B: Perimeter-Based (Castle-and-Moat) Architecture

| Aspect | Assessment |
|--------|------------|
| **Description** | Implicit trust inside the network perimeter; strong border controls (firewall, WAF) with weak internal segmentation |
| **Why Rejected** | Incompatible with microservices architecture — implicit trust between services allows lateral movement on compromise. The loyalty platform's microservices communicate east-west extensively; a perimeter model would leave the points-ledger service implicitly trusted by the profile service, creating a direct path from front-end compromise to balance manipulation. Also fails to address insider threat and supply-chain compromise. |
| **Residual Use** | None — perimeter controls (WAF, DDoS protection) are layered *under* Zero Trust, not replacing it |

#### Alternative C: Framework Inheritance Without Zero Trust Principles

| Aspect | Assessment |
|--------|------------|
| **Description** | Use TOGAF + SABSA + CSA for structure and documentation, but do not enforce per-service authentication, microsegmentation, or least-privilege access |
| **Why Rejected** | Frameworks provide governance and traceability, but without Zero Trust execution principles, the architecture retains implicit trust between services. The result is a well-documented design that still allows lateral movement and fails to limit blast radius. Zero Trust is the operational layer that makes the frameworks meaningful. |
| **Residual Use** | None — Zero Trust principles are mandatory for this platform |



## 3. Threat-to-Control Mapping

### 3.1 Security Controls (STRIDE)

| STRIDE Category | Threat | Control | Requirement Traceability |
|---|---|---|---|
| **Spoofing** | User impersonation; service-to-service spoofing | Strong authentication (OAuth 2.0 / mTLS); mutual service authentication | REQ-001: Identity & Access Management |
| **Tampering** | Profile data or API request modification; **loyalty points balance manipulation** | Input validation; integrity controls; request signing; **business-logic validation layer for earn/burn transactions with anomaly detection** | REQ-002: Data Integrity; REQ-010: Fraud Prevention |
| **Repudiation** | Denial of profile changes or transactions | Immutable audit logging; non-repudiation mechanisms | REQ-003: Accountability |
| **Information Disclosure** | Personal and payment data exposure in transit/rest | Encryption (TLS 1.3, AES-256-GCM); access control; tokenization of payment data | REQ-004: Confidentiality; REQ-005: PCI-DSS Scope Minimization |
| **Denial of Service** | Public front-end overload | Rate limiting; WAF; auto-scaling; circuit breakers | REQ-006: Availability |
| **Elevation of Privilege** | Lateral movement within microservices | Least privilege (RBAC/ABAC); authorization checks; workload isolation (containers / VPC-SC) | REQ-007: Authorization |

### 3.2 Loyalty-Specific Threats (Fraud & Abuse)

| Threat | Attack Vector | Control | Requirement Traceability |
|---|---|---|---|
| **Points Theft via ATO** | Credential stuffing, password reuse, phishing → account takeover → points transfer or redemption | MFA on high-value actions; velocity checks on points transfers; device fingerprinting; account lockout after failed attempts | REQ-010: Fraud Prevention |
| **Points Laundering** | Stolen points moved through mule accounts; secondary market resale | Transfer limits; cooling-off periods; recipient account age verification; machine-learning anomaly detection on transfer patterns | REQ-010: Fraud Prevention |
| **Referral / Promo Abuse** | Synthetic account creation to harvest referral bonuses; repeated use of one-time promo codes | Identity verification (KYC-lite) for referral payouts; promo-code rate limiting; device/IP clustering | REQ-010: Fraud Prevention |
| **Insider Point Issuance** | Authorized staff manually crediting points to colluding accounts | Dual-control for manual point adjustments; immutable audit trail with tamper-evident hashing; SOX-style segregation of duties | REQ-003: Accountability; REQ-011: Insider Threat |
| **Earn/Burn Logic Manipulation** | API parameter tampering to inflate earn rates or bypass burn validation | Server-side validation of all earn/burn calculations; immutable transaction ledger; reconciliation engine comparing expected vs. actual points flow | REQ-002: Data Integrity; REQ-010: Fraud Prevention |

### 3.3 MITRE ATT&CK Mapping (Retail Sector)

| Technique ID | Technique Name | Loyalty Platform Relevance |
|---|---|---|
| T1589 | Gather Victim Identity Information | Harvesting loyalty account credentials from breach dumps for account takeover |
| T1110.004 | Credential Stuffing | Automated credential stuffing against loyalty login APIs |
| T1078 | Valid Accounts | Abuse of compromised legitimate accounts to transfer or redeem stolen points |

### 3.4 Privacy Controls (LINDDUN)

| LINDDUN Category | Privacy Threat | Control | STRIDE Collision Resolution |
|---|---|---|---|
| **Linkability** | Behavioral profiling across sessions | Data minimization; separate data stores for identity vs. behavioral data; session isolation | None — STRIDE does not address linkability |
| **Identifiability** | Re-identification from pseudonymous data | Pseudonymization of customer profiles; k-anonymity checks on analytics exports | None — STRIDE information disclosure covers unauthorized access, not re-identification risk |
| **Non-repudiation (Privacy)** | Data subject cannot prove privacy violation or incorrect processing | **Divergence from STRIDE:** STRIDE non-repudiation protects the *system* (user cannot deny a transaction). LINDDUN non-repudiation protects the *data subject* (user cannot prove a privacy breach). **Resolution:** Implement *both* — immutable audit logs for STRIDE (transaction non-repudiation) AND a data-subject access log / privacy dashboard for LINDDUN (privacy non-repudiation). | **Explicitly resolved in architecture** |
| **Detectability** | Adversary can infer user membership in loyalty program | Minimize public profile enumeration; return generic errors; rate-limit lookup APIs | None |
| **Disclosure of Information (Privacy)** | Unauthorized access to PII beyond loyalty data | Encryption at rest/transit; access control; DLP monitoring | Aligns with STRIDE Information Disclosure — unified control |
| **Unawareness** | Customer unaware of profiling, data retention, or third-party sharing | Granular consent management; just-in-time disclosures at earn/burn; clear retention policies; privacy dashboard | None — STRIDE does not address awareness |
| **Non-compliance** | Retention beyond legal limit; processing without legal basis | Automated data-retention enforcement; TTL on behavioral data; periodic compliance scans; consent expiry checks | None — STRIDE does not address compliance |



## 4. PCI-DSS Scope Decision

The most consequential security decision for this platform is the **payment integration architecture**, as it determines PCI-DSS scope and audit burden.

### 4.1 Selected Approach: Hosted Payment Page (SAQ A)

| Aspect | Decision |
|---|---|
| **Integration Model** | Redirect to payment processor's hosted payment page (HPP) or embedded iframe (iframe-based SAQ A) |
| **Mobile** | Processor's certified mobile SDK (SAQ A) |
| **Tokenization** | Processor vaults card data; platform stores only non-sensitive tokens and last-4 digits |
| **PCI Scope** | SAQ A — lowest scope; platform does not touch, process, or store CHD |
| **Network Segmentation** | Payment token returned to platform; no CHD enters platform network boundary |

### 4.2 Rejected Alternative: Direct Post / API Integration (SAQ A-EP / SAQ D)

| Aspect | Assessment |
|---|---|
| **Description** | Platform front end posts card data directly to platform API, which then forwards to processor; or platform API accepts card data directly |
| **Why Rejected** | Expands PCI-DSS scope to the entire platform (SAQ D or A-EP), requiring network segmentation, ASV scans, penetration testing, and annual QSA audit of the full environment. **Rough order-of-magnitude cost increase: ~$150K–$300K/year** versus SAQ A, based on additional QSA hours, ASV scanning of platform infrastructure, and broader penetration-test scope. The business does not require direct card handling; tokenization via HPP satisfies all functional requirements. |
| **Residual Use** | Only if processor HPP does not support required payment methods (e.g., certain BNPL providers); requires explicit CISO and QSA sign-off |



## 5. Trust Boundary Controls

### 5.1 Boundaries 1–4 (Internet → Front End → API → Microservices → Data Store)

Covered in §3.1 (STRIDE table) and §3.2 (loyalty-specific threats).

### 5.2 Boundary 5: Microservices → Third-Party Payment Processor

| Threat | Control | Requirement Traceability |
|---|---|---|
| **Man-in-the-middle** | TLS 1.3 with certificate pinning; mutual TLS where supported by processor | REQ-004: Confidentiality |
| **Token replay / substitution** | Token validation with processor on each transaction; token expiry; token-to-account binding | REQ-010: Fraud Prevention |
| **Processor breach expanding platform liability** | Contractual BAA/processor DPA; right to audit; breach-notification SLA (24 hours); sub-processor disclosure | REQ-008: Third-Party Risk |
| **Availability dependency** | Circuit breaker on payment API; graceful degradation (queue transactions for retry); multi-processor fallback | REQ-006: Availability |

### 5.3 Boundary 6: Microservices → Third-Party Email Provider

| Threat | Control | Requirement Traceability |
|---|---|---|
| **Account takeover via email compromise** | Contractual MFA requirement on email provider admin accounts; monitor provider breach disclosures; disable password-reset-via-email for high-value actions; fallback to app-based recovery with velocity limits | REQ-001: Identity & Access Management |
| **PII leakage in email content** | No PII in email templates beyond first name; all sensitive notifications require login to portal; suppress full statements | REQ-004: Confidentiality |
| **Sub-processor compliance** | DPA with email provider; data residency commitment; no onward transfer; breach-notification SLA | REQ-008: Third-Party Risk |
| **Phishing via spoofed provider domain** | SPF/DKIM/DMARC enforcement on provider-sending domain; brand monitoring | REQ-009: Brand Protection |
| **Email enumeration** | Generic "check your email" responses; no confirmation of email existence in API responses | REQ-004: Confidentiality |



## 6. Compliance Mapping

| Regulation / Standard | Trigger | Control Implication |
|---|---|---|
| **PCI DSS** | Payment processor integration | Scope minimization via hosted payment page (SAQ A); tokenization; no CHD enters platform boundary |
| **Privacy Regulations** (GDPR/CCPA) | Personal data in profile store | Privacy-by-design; data minimization; pseudonymization; consent logging; retention enforcement |
| **Fraud / Financial Crime** | Loyalty points as stored value | Transaction monitoring; anomaly detection; velocity limits; insider controls; reconciliation engine |



## 7. Consequences

### Positive
- Inherits validated enterprise patterns (TOGAF, SABSA, CSA), which reduces design risk and audit friction.
- Zero Trust architecture eliminates implicit trust and limits the blast radius of a compromise.
- Dual threat-modeling (STRIDE + LINDDUN) covers security and privacy. §3.4 resolves the collision between STRIDE and LINDDUN non-repudiation.
- Loyalty-specific fraud controls (§3.2) address the primary business risk that generic web-app security misses.
- PCI scope minimization via SAQ A avoids ~$150K–$300K/year in additional audit overhead.
- Traceability to documented requirements (REQ-001 … REQ-011) enables verification and validation in later phases.

### Negative / Risks
- **Complexity**: Mutual TLS and per-service authorization increase operational overhead.
- **Latency**: Additional authentication/authorization hops may increase API response times. Requires a performance baseline.
- **Third-party dependency**: Payment processor and email provider security postures sit outside direct control. Requires contractual SLAs and continuous monitoring.
- **Fraud false positives**: Anomaly detection on points transfers may flag legitimate behavior. Requires tuning and customer communication.
- **PCI residual risk**: Any misconfiguration in tokenization or segmentation could expand audit scope. Quarterly self-assessment required.



## 8. Related Decisions
- ADR-001: Platform-Wide Identity Federation Strategy (OAuth 2.0 / OIDC)
- ADR-002: API Gateway Selection and Rate-Limiting Policy
- ADR-003: Microservices Service Mesh and mTLS Configuration
- ADR-004: Customer Profile Data Store Encryption and Retention



## 9. References
- TOGAF Standard, Version 9.2 — ADM Security Architecture
- SABSA — Sherwood Applied Business Security Architecture
- CSA Enterprise Architecture v4
- NIST SP 800-207 — Zero Trust Architecture
- OWASP Threat Modeling Cheat Sheet (STRIDE)
- LINDDUN Privacy Threat Modeling Framework
- MITRE ATT&CK for Enterprise
- PCI DSS v4.0 Requirements and Testing Procedures
- SAQ A and SAQ A-EP Eligibility Criteria (PCI SSC)

---

## Fix Log: Validation & Critique Response

Defects found during adversarial review of this ADR, and the fixes applied.

## ADR-006 (Retail Loyalty) — Fixes Applied

| # | Issue | Fix |
|---|---|---|
| 1 | Nothing loyalty-specific. STRIDE table would fit any web app. Missing points theft, laundering, promo abuse, insider issuance, balance manipulation. | **Added §3.2 Loyalty-Specific Threats (Fraud & Abuse)** with five threat rows: Points Theft via ATO, Points Laundering, Referral/Promo Abuse, Insider Point Issuance, Earn/Burn Logic Manipulation. |
| 2 | PCI decision not made. "Tokenization" and "scope minimization" are outcomes, not decisions. Missing SAQ A vs. A-EP vs. D choice. | **Added §4 PCI-DSS Scope Decision:** explicitly selected Hosted Payment Page (SAQ A). Rejected Direct Post (SAQ A-EP/D) with costed rationale. |
| 3 | Two trust boundaries (5: payment processor, 6: email provider) had no controls mapped. Email provider is live ATO path and sub-processor. | **Added §5 Trust Boundary Controls** with dedicated subsections for Boundary 5 (payment processor) and Boundary 6 (email provider). |
| 4 | LINDDUN covered only 2 of 7 categories. Unawareness and Non-compliance are live for loyalty. STRIDE non-repudiation collided with LINDDUN non-repudiation; claimed "without duplication" but they collide. | **Expanded LINDDUN to all 7 categories.** **Explicitly resolved collision:** STRIDE non-repudiation = system protection (immutable audit logs); LINDDUN non-repudiation = data-subject protection (privacy dashboard). Architecture implements both. |
| 5 | MITRE ATT&CK and CVSS named but not used. No techniques cited. CVSS described as "post-implementation" which is out of scope for pre-design ADR. | **Added §3.3 MITRE ATT&CK Mapping** with three actual techniques (T1589, T1110.004, T1078). **Removed CVSS** from threat-modeling stack; added explicit exclusion note. |
| 6 | "Domain 1 Traceability" leaked study origin. No CISO knows what it means. | **Replaced with real requirement IDs** (REQ-001 … REQ-011) with descriptive names. |
| 7 | §6 referenced ADR-001 (AI vendor / ECOA / SR 11-7) and ADR-003 (PAM) — bank decisions in a retailer's ADR. | **Replaced cross-references** with retail-loyalty-appropriate ADRs (Identity Federation, API Gateway, Service Mesh, Data Store Encryption). |
| 8 | ADR-006 had no rejected alternatives for its main security architecture decision. | **Added §2.4 Rejected Alternatives** for the overall approach: Greenfield Custom Framework, Perimeter-Based Architecture, and Frameworks Without Zero Trust. |
| 9 | Boundary 6, first row: "Control" cell restated the threat instead of stating a control. | **Replaced with actual control:** contractual MFA on provider admin accounts, monitoring breach disclosures, disabling email-based password reset for high-value actions, app-based recovery with velocity limits. |
| 10 | T1496 (Resource Hijacking) incorrectly mapped to loyalty points. T1496 refers to compute resource hijacking (cryptomining). | **Replaced with T1078 (Valid Accounts)** — abuse of compromised legitimate accounts for points transfer/redemption. Kept T1110.004 (Credential Stuffing) and T1589 (Gather Victim Identity Information). |
| 11 | Unsourced dollar figures for PCI cost savings. | **Added rough order-of-magnitude label** with basis: QSA hours, ASV scanning, penetration-test scope. |
