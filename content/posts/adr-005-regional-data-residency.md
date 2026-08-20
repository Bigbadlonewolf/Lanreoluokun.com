---
title: "ADR-005: Regional Data Residency and Hierarchical Encryption"
author: "Lanre — Cloud Security / Enterprise Architect"
date: "2026-08-20"
tags: ["architecture", "security", "cloud", "compliance", "ADR", "data-residency"]
description: "Regional data residency with hierarchical customer-managed encryption keys for a multi-jurisdictional claims portal, with the critique, fixes, and validation that followed."
aliases: ["/posts/adr-data-residency-and-loyalty-security/"]
---

> **Author:** Lanre — Cloud Security / Enterprise Architect  
> **Certifications:** CISSP, CCSP, CISM, ISSAP, GCP-PCA  
> **Date:** 2026-08-20

---

## Overview

**ADR-005** addresses a multinational insurer launching a claims portal across GDPR, UK GDPR, HIPAA, and APAC privacy regimes. It decides on regional data residency, with customer-managed encryption keys bound to jurisdictional boundaries.

The companion record is [ADR-006: Security Architecture for a Retail Loyalty Platform](../adr-006-retail-loyalty-security/).

---

## Contents

- [1. Context](#1-context)
- [2. Decision](#2-decision)
- [3. Consequences](#3-consequences)
- [4. Compliance & Control Mapping](#4-compliance--control-mapping)
- [5. Verification & Evidence](#5-verification--evidence)
- [6. Architecture Overview](#6-architecture-overview)
- [7. Traceability to Requirement Baseline](#7-traceability-to-requirement-baseline)
- [8. Implementation Roadmap](#8-implementation-roadmap)
- [9. Risk Register](#9-risk-register)
- [10. References](#10-references)
- [Fix Log: Validation & Critique Response](#fix-log-validation--critique-response)

---

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-08-20 |
| **Author** | Lanre — Cloud Security / Enterprise Architect |
| **Deciders** | Enterprise Architect, DPO, Legal Counsel, Cloud Engineering |



## 1. Context

### 1.1 Scenario Overview

A multinational insurer is launching a **customer-facing claims portal** on a **public-cloud IaaS platform**. The portal processes **personal and health-related data** for policyholders across multiple jurisdictions:

- **European Union** — GDPR jurisdiction
- **United Kingdom** — UK GDPR / Data Protection Act 2018
- **United States** — HIPAA (health data, **see scoping assumption below**), state-level privacy laws (CCPA/CPRA, etc.)
- **Asia-Pacific markets** — including jurisdictions covered by PDPA (Singapore), APPI (Japan), and DPDP (India)

**HIPAA Scoping Assumption:** This ADR assumes the insurer operates health plans, giving it HIPAA-covered entity status in the US market. Property, casualty, life, and auto lines that do not process PHI fall outside the HIPAA controls referenced here. The DPO must confirm covered-entity status before finalizing HIPAA obligations.

**Key Business Parameters:**

| Parameter | Value | Source |
|-----------|-------|--------|
| Platform Model | IaaS (Infrastructure as a Service) | Business requirement |
| Data Types | Personal data + health-related data | Policyholder claims |
| Sensitivity Tier | **High** — health data triggers enhanced controls | Data classification |
| Outage Tolerance (MTD) | 4 hours | Business statement |
| User Base | Multi-jurisdictional (EU, UK, US, Asia) | Global operations |
| Hosting Arrangement | Public cloud | Cost / scalability driver |

The architect must **establish the requirement baseline before design begins**. This ADR covers the data architecture decisions that constrain later security, availability, and compliance choices.

### 1.2 Constraints & Forces

#### 1.2.1 Privacy Regime Collision

The multi-jurisdictional spread triggers the **"deconfliction discipline."** The applicable privacy regimes differ in:

| Regime | Key Constraint | Stringency |
|--------|---------------|------------|
| **GDPR (EU)** | Cross-border transfers require adequacy decision, SCCs + TIA, or BCRs. 72-hour breach notification. | Very High |
| **UK GDPR** | Post-Brexit adequacy decisions diverge from EU. Independent ICO enforcement. | Very High |
| **PDPA (Singapore)** | Consent-based transfer; DPO notification for cross-border arrangements. | High |
| **APPI (Japan)** | Cross-border transfer requires opt-out or equivalent consent; PPC notification for third-country transfers. | High |
| **US (HIPAA)** | Business Associate Agreements required. Minimum necessary standard. Breach notification 60 days. | High |
| **Asian Local Regimes** | Varying data-export restrictions, localization requirements, breach-notification windows | Variable |

**Deconfliction Rule:** Design to the **strictest applicable regime** on each dimension: notification window, transfer rule, and localization requirement. Surface any genuine conflict to legal counsel and the risk owner rather than resolving it silently.

**China Exclusion Note:** Phase 1 excludes mainland China. GCP has no mainland China region, and PIPL requires in-country infrastructure and a security assessment for cross-border transfer of important data. China needs its own deployment through a local partner or a compliant in-country cloud provider. ADR-007 (China Market Entry) covers it. The "APAC region" in this ADR means Singapore, Japan, India, and other non-China markets.

#### 1.2.2 IaaS Shared Responsibility Split

Under an IaaS model, the responsibility boundary is well-defined:

| Layer | Provider Responsibility | Customer Responsibility |
|-------|------------------------|------------------------|
| Physical infrastructure | Secures data centers, power, cooling, physical access | Verify via SOC 2 Type II, site visits (where possible) |
| Network infrastructure | Secures backbone, edge, DDoS protection | Configure VPCs, firewalls, encryption in transit |
| Hypervisor / virtualization | Patches, isolates tenant workloads | Verify via CSA STAR, compliance reports |
| Operating system | **Customer** | Harden, patch, monitor, configure |
| Middleware / runtime | **Customer** | Secure configuration, vulnerability management |
| Application | **Customer** | Secure SDLC, input validation, authentication |
| Data | **Customer** | Classification, encryption, access control, retention |
| Identity & Access Management | **Customer** | IAM policies, MFA, least privilege, audit logging |

**Critical implication:** Because the data is regulated and held by the insurer (not the provider), **verification cannot rest on trust**. The architect requires:
- Provider's **SOC 2 Type II report** (operating effectiveness over time, **not merely Type I design**)
- Provider's position on the **CSA STAR registry**
- Contractually verifiable obligations written into the agreement:
  - Encryption standards and key management
  - Breach notification within the strictest applicable window
  - Sub-processor disclosure and consent
  - Data deletion on exit with evidence

#### 1.2.3 High-Sensitivity Data Classification

**Health-related data** raises the classification to the **highest sensitivity tier**. This triggers:

- Enhanced encryption requirements (at-rest, in-transit, in-use where feasible)
- Stricter access controls (need-to-know, just-in-time)
- Enhanced logging and monitoring
- Shorter retention periods (where regulation permits)
- Mandatory privacy impact assessments (DPIA / PIA)

#### 1.2.4 Availability Context — The Four-Hour MTD

The business has stated that a claims outage longer than four hours would cause **unacceptable reputational and regulatory harm**. This is an **MTD (Maximum Tolerable Downtime) signal**.

**The correct first move is NOT to jump to a hot site.** The architect must:

1. **Commission a formal BIA (Business Impact Analysis)** that confirms the four-hour figure
2. **Separate MTD into RTO (Recovery Time Objective)** and any work-recovery time
3. **Establish RPO (Recovery Point Objective)** — how much claims data the business can tolerate losing
4. **Only then** design availability architecture proportional to validated requirements

> The four-hour MTD is a business signal, not an architecture directive. The architect's first move is to commission a BIA. That BIA validates the figure and decomposes it into RTO and work-recovery time. It also establishes the RPO from how much claims data loss the business can tolerate. Only then does availability architecture follow.

With those numbers, the likely shape is a **multi-availability-zone active design** on the cloud platform. It pairs **continuous replication for a tight RPO** with an **isolated, immutable backup**. The backup guards against ransomware that replication would otherwise propagate. Derive this shape from the objectives rather than assuming it.

#### 1.2.5 Privacy Management System Standards

The health data and privacy exposure point toward:

- **ISO/IEC 27701** for the privacy information management system (PIMS)
- **ISO/IEC 27018** for cloud PII handling
- Layered over a **27001 ISMS** (Information Security Management System)
- **CSA CCM (Cloud Controls Matrix)** as the cloud control reference

### 1.3 Problem Statement

How do we store, encrypt, and manage claims data across multiple jurisdictions such that:

1. **Data residency and sovereignty requirements** are satisfied per jurisdiction?
2. **Encryption keys are bound** to the same jurisdictional boundary as the data they protect?
3. **Cross-border data flows** occur only where legally permitted and contractually governed?
4. **The architecture does not create a single centralized breach surface** that violates the "strictest regime" principle?
5. **Provider verification** is contractually enforceable, not assumed?
6. **Availability design** is proportional to BIA-validated RTO/RPO, not driven by an unvalidated MTD assertion?



## 2. Decision

### 2.1 Selected Approach

We will adopt a **Regional Data Residency model with Hierarchical Customer-Managed Encryption Keys (CMEK)**.

#### 2.1.1 Regional Deployment Model

| Layer | Decision | Rationale |
|-------|----------|-----------|
| **Compute** | Regional IaaS clusters deployed in EU, UK, US, and Asia-Pacific regions. | Pins compute to jurisdictional boundaries. |
| **Storage** | Regional managed databases and regional object-storage buckets. | Data is pinned to the region of the policyholder's jurisdiction at ingestion time. |
| **Encryption at Rest** | CMEK using cloud HSM-backed keys. Each region has an isolated **Key Ring** in a regional HSM. | Key material never leaves the geographic boundary. Cryptographic erasure is possible. |
| **Encryption in Transit** | TLS 1.3 everywhere. Mutual TLS (mTLS) for service-to-service communication within each regional mesh. | Prevents interception and man-in-the-middle attacks. |
| **Cross-Border Flows** | Permitted only via explicit legal mechanisms (SCCs with Transfer Impact Assessments, adequacy decisions, or PIPL security assessments where threshold-met). | Satisfies deconfliction discipline. |
| **Global Control Plane** | Restricted to IAM, API Gateway routing logic, and operational metadata. The Jurisdiction Router processes transient personal data (user ID, jurisdiction mapping) for routing decisions but does not persist health data, claims data, or PII in durable storage. | Enables unified operations without violating data residency. |
| **Backup & DR** | Regional continuous replication to a secondary zone within the same region for RPO targets. **Isolated, immutable backups** (WORM / object-lock) in a separate project/VPC within the same region. | Satisfies ransomware resilience without violating residency. |

#### 2.1.2 Data Classification and Routing Logic

At ingestion, the portal applies **jurisdictional tagging** based on:

1. **Policyholder registration address** (primary)
2. **IP geolocation** (secondary validation)
3. **Explicit consent / jurisdiction selection** (tertiary, for edge cases)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INGESTION GATEWAY                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐         │
│  │ Policyholder│  │  IP Geo     │  │ Explicit Jurisdiction│        │
│  │   Address   │  │ Validation  │  │     Selection        │        │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘         │
│         └─────────────────┴────────────────────┘                    │
│                           │                                         │
│                    ┌──────┴──────┐                                 │
│                    │  Jurisdiction │                                 │
│                    │   Resolver    │                                 │
│                    └──────┬──────┘                                 │
│                           │                                         │
│         ┌─────────────────┼─────────────────┐                      │
│         ▼                 ▼                 ▼                      │
│    ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐│
│    │   EU    │      │   UK    │      │   US    │      │  APAC   ││
│    │ REGION  │      │ REGION  │      │ REGION  │      │ REGION  ││
│    └─────────┘      └─────────┘      └─────────┘      └─────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

#### 2.1.3 Encryption Key Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    ENCRYPTION KEY HIERARCHY                                          │
│                                                                                      │
│  TIER 0: REGIONAL ROOT KEYS (Independent per jurisdiction)                           │
│  ┌─────────────────────────┬─────────────────────────┬─────────────────────────┐    │
│  │    EU-ROOT-KEY          │    UK-ROOT-KEY          │    US-ROOT-KEY          │    │
│  │    (Stored in EU HSM)   │    (Stored in UK HSM)   │    (Stored in US HSM)   │    │
│  │                         │                         │                         │    │
│  │  • Used ONLY for:       │  • Used ONLY for:       │  • Used ONLY for:       │    │
│  │    - Wrapping EU KEKs   │    - Wrapping UK KEKs   │    - Wrapping US KEKs   │    │
│  │    - EU escrow recovery │    - UK escrow recovery │    - US escrow recovery │    │
│  │  • Access: CISO + DPO   │  • Access: CISO + DPO   │  • Access: CISO + DPO   │    │
│  │    dual control         │    dual control         │    dual control         │    │
│  │  • NEVER wraps non-EU   │  • NEVER wraps non-UK   │  • NEVER wraps non-US   │    │
│  │    keys                 │    keys                 │    keys                 │    │
│  └───────────┬─────────────┴───────────┬─────────────┴───────────┬─────────────┘    │
│              │                         │                         │                  │
│  ┌───────────┴───────────┐  ┌──────────┴─────────────────────────┴────────────┐   │
│  │    APAC-ROOT-KEY      │  │                                                 │   │
│  │    (Stored in APAC    │  │                                                 │   │
│  │     HSM)              │  │                                                 │   │
│  │  • Used ONLY for:     │  │                                                 │   │
│  │    - Wrapping APAC    │  │                                                 │   │
│  │      KEKs             │  │                                                 │   │
│  └───────────┬───────────┘  │                                                 │   │
│              │               │                                                 │   │
│  TIER 1: REGIONAL KEY ENCRYPTION KEYS (KEKs)                                        │
│  ┌─────────────────────────┬─────────────────────────┬─────────────────────────┐    │
│  │    EU-KEK-01            │    UK-KEK-01            │    US-KEK-01            │    │
│  │    (AES-256-GCM)        │    (AES-256-GCM)        │    (AES-256-GCM)        │    │
│  │                         │                         │                         │    │
│  │  • Regional HSM only    │  • Regional HSM only    │  • Regional HSM only    │    │
│  │  • Rotated annually     │  • Rotated annually     │  • Rotated annually     │    │
│  │  • Wraps EU DEKs        │  • Wraps UK DEKs        │  • Wraps US DEKs        │    │
│  │  • No cross-region use  │  • No cross-region use  │  • No cross-region use  │    │
│  └─────────────────────────┴─────────────────────────┴─────────────────────────┘    │
│              │                       │                       │                       │
│  ┌─────────────────────────┬─────────────────────────┬─────────────────────────┐    │
│  │    APAC-KEK-01          │                         │                         │    │
│  │    (AES-256-GCM)        │                         │                         │    │
│  │  • Regional HSM only    │                         │                         │    │
│  │  • Rotated annually     │                         │                         │    │
│  │  • Wraps APAC DEKs      │                         │                         │    │
│  │  • No cross-region use  │                         │                         │    │
│  └─────────────────────────┴─────────────────────────┴─────────────────────────┘    │
│              │                       │                       │                       │
│  TIER 2: DATA ENCRYPTION KEYS (DEKs)                                                 │
│  ┌─────────────────────────┬─────────────────────────┬─────────────────────────┐    │
│  │  EU-DEK-DB-001          │  UK-DEK-DB-001          │  US-DEK-DB-001          │    │
│  │  EU-DEK-DB-002          │  UK-DEK-DB-002          │  US-DEK-DB-002          │    │
│  │  EU-DEK-OBJ-001         │  UK-DEK-OBJ-001         │  US-DEK-OBJ-001         │    │
│  │  ...                    │  ...                    │  ...                    │    │
│  │  • Per-resource DEKs    │  • Per-resource DEKs    │  • Per-resource DEKs    │    │
│  │  • Rotated every 90d    │  • Rotated every 90d    │  • Rotated every 90d    │    │
│  │  • Auto-generated by    │  • Auto-generated by    │  • Auto-generated by    │    │
│  │    KMS, wrapped by KEK  │    KMS, wrapped by KEK  │    KMS, wrapped by KEK  │    │
│  │  • Re-wrap existing     │  • Re-wrap existing     │  • Re-wrap existing     │    │
│  │    objects within 30d   │    objects within 30d   │    objects within 30d   │    │
│  │    of rotation          │    of rotation          │    of rotation          │    │
│  └─────────────────────────┴─────────────────────────┴─────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────┐                                                         │
│  │  APAC-DEK-DB-001        │                                                         │
│  │  APAC-DEK-DB-002        │                                                         │
│  │  APAC-DEK-OBJ-001       │                                                         │
│  │  ...                    │                                                         │
│  │  • Per-resource DEKs    │                                                         │
│  │  • Rotated every 90d    │                                                         │
│  │  • Auto-generated by    │                                                         │
│  │    KMS, wrapped by KEK  │                                                         │
│  │  • Re-wrap within 30d   │                                                         │
│  └─────────────────────────┘                                                         │
│                                                                                      │
│  KEY BINDING INVARIANT:                                                              │
│  ∀ DEK : region(DEK) == region(data_protected_by_DEK) ==                            │
│          region(KEK_wrapping_DEK) == region(ROOT_wrapping_KEK)                       │
│                                                                                      │
│  VIOLATION = ARCHITECTURE FAILURE                                                   │
│                                                                                      │
│  ESCROW NOTE: Each region maintains independent key escrow with a                    │
│  third-party escrow agent under jurisdiction-specific contract. No                   │
│  single escrow holder holds keys for multiple regions.                               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Key Management Principles:**

| Principle | Implementation |
|-----------|---------------|
| **Regional Binding** | Each DEK is wrapped by a regional KEK in a regional HSM; each KEK is wrapped by a regional Root Key in the same regional HSM |
| **No Cross-Region Wrapping** | No key from one region ever wraps a key from another region. Regional key hierarchies are cryptographically isolated. |
| **Customer Managed** | The insurer, not the cloud provider, controls key lifecycle (creation, rotation, destruction) |
| **HSM-Backed** | All key material resides in FIPS 140-3 Level 3 (or FIPS 140-2 Level 3 pending provider re-validation) HSMs |
| **No Key Export** | Key material never leaves the HSM boundary — only wrapped keys and ciphertext flow |
| **Cryptographic Erasure (Bulk)** | Regional key destruction = bulk data deletion for contract exit or region decommissioning |
| **Record-Level Deletion (Art. 17)** | Individual data-subject erasure requests use record-level deletion; cryptographic erasure is reserved for bulk/contract scenarios |
| **Rotation** | Automatic rotation every 90 days for DEKs; annual rotation for KEKs; re-wrap of existing objects within 30 days of DEK rotation |
| **Dual Control** | Key ceremonies require two authorized personnel with split knowledge |

### 2.2 Rejected Alternatives

#### Alternative A: Single Global Data Store with Unified Encryption

| Aspect | Assessment |
|--------|------------|
| **Description** | One global database (e.g., Cloud Spanner, Cosmos DB, DynamoDB Global Tables) with a single encryption key |
| **Why Rejected** | Fails PIPL data-localization implications. Violates GDPR transfer-restriction rigor for health data. Creates a single breach surface where one compromise exposes all jurisdictions. Violates deconfliction discipline. |
| **Residual Use** | May be acceptable for non-PII operational metadata only (e.g., IAM policies, routing tables) |

#### Alternative B: Fully Siloed Per-Country Deployments with Zero Shared Control Plane

| Aspect | Assessment |
|--------|------------|
| **Description** | Completely independent deployments per country with no shared infrastructure |
| **Why Rejected** | Maximizes compliance but fragments operations, duplicates cost (5-10x infrastructure), prevents unified claims analytics, and creates an inconsistent customer experience. The business requires a single customer-facing portal. |
| **Residual Use** | Required for mainland China if PIPL security assessment thresholds are met and no adequate transfer mechanism exists; scoped to ADR-007 |

#### Alternative C: Global Active-Active Database with Geo-Partitioning

| Aspect | Assessment |
|--------|------------|
| **Description** | Global active-active database with geo-partitioning (e.g., CockroachDB, YugabyteDB, Spanner with regional placement) |
| **Why Rejected** | Adds significant complexity (conflict resolution, split-brain risk, transaction ordering) before the BIA validates whether sub-hour RTO justifies the cost. Also, geo-partitioning alone does not solve the encryption key residency problem. Revisit if BIA output demands multi-region active-active with validated business justification. |
| **Residual Use** | Re-evaluate after BIA confirms RTO < 1 hour and cost-benefit analysis is completed |



## 3. Consequences

### 3.1 Positive

| # | Benefit | Explanation |
|---|---------|-------------|
| 1 | **Regulatory de-risking** | Data and keys remain within jurisdictional boundaries by default. Cross-border transfers become explicit, documented, and legally gated. |
| 2 | **Breach containment** | A compromise in one region does not automatically expose policyholders in another region. The blast radius is geographically bounded. |
| 3 | **Cryptographic erasure (bulk)** | When exiting a region or terminating a provider contract, destroying the regional key material provides verifiable assurance of bulk data deletion — a contractually required obligation. |
| 4 | **Provider verification alignment** | Regional HSMs and regional services map cleanly to SOC 2 Type II and CSA CCM controls that the provider can evidence independently per region. |
| 5 | **Audit simplicity** | Regulators can be shown a clear boundary: "EU data in EU, encrypted by EU keys, managed under EU ISMS scope." |
| 6 | **Ransomware resilience** | Immutable, isolated backups within each region protect against ransomware propagation without creating cross-border data flows. |

### 3.2 Negative / Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **Operational complexity** | High | Engineering must manage four+ regional deployments, key ceremonies, and patch cycles. Mitigate via infrastructure-as-code (Terraform), centralized CI/CD with regional parameterization, and runbook automation. |
| 2 | **Cost increase** | Medium-High | Regional HSM instances, duplicated environments, and intra-region replication increase baseline spend 2-3x versus centralized design. **Rough order-of-magnitude: ~$180K–$240K/year.** Assumes 2,000 active key versions across four regions (accounting for 90-day rotation with 30-day re-wrap overlap), 4× regional GKE clusters, and HA Cloud SQL per region. Actual cost varies by provider pricing tier and reserved capacity. Mitigate via reserved capacity, spot instances for non-prod, and chargeback to business units per jurisdiction. |
| 3 | **Analytics fragmentation** | Medium | Cross-jurisdictional claims analytics requires aggregation pipelines that must re-apply de-identification or operate on anonymized datasets only. Mitigate via a dedicated "analytics zone" with differential privacy, k-anonymity, or synthetic data generation. |
| 4 | **Key custody risk** | Critical | Loss of regional HSM access (e.g., due to provider account lockout, key ceremony failure, or organizational dispute) results in permanent data unavailability for that region. Mitigate via documented key-escrow with a third-party escrow agent, break-glass procedures, and quarterly key-recovery drills. |
| 5 | **Consistency challenges** | Medium | Eventually consistent cross-region operations (e.g., global policy updates) may lag. Mitigate via CRDTs for conflict-free replicated data types where applicable, and explicit consistency models documented per use case. |
| 6 | **Legal mechanism overhead** | Medium | Maintaining SCCs, TIAs, BCRs, and PIPL security assessments across multiple jurisdictions creates legal overhead. Mitigate via a centralized legal-ops function with jurisdiction-specific counsel and annual mechanism review. |



## 4. Compliance & Control Mapping

### 4.1 Regulatory Framework Mapping

| Requirement | Standard / Regulation | Architectural Element | Evidence Artifact |
|-------------|----------------------|----------------------|-------------------|
| Privacy Management System | ISO/IEC 27701:2019 | Regional data pinning + DPO-accessible audit logs per region | ISO 27701 audit report per region |
| Cloud PII Handling | ISO/IEC 27018:2019 | CMEK, access logging, data-deletion workflows | Cloud provider ISO 27018 certification |
| ISMS Foundation | ISO/IEC 27001:2022 | Regional ISMS scope boundaries, risk treatment per jurisdiction | ISO 27001 certificate with regional scope statements |
| Cloud Controls | CSA CCM v4.0 | Provider SOC 2 Type II + CSA STAR registry verification | CSA STAR certificate, SOC 2 Type II report |
| Data Residency / Transfer | GDPR Arts. 44-49 | SCCs + TIA for any EU data leaving adequacy boundaries | Executed SCCs with TIA documentation |
| Data Localization (China) | PIPL (China), Art. 38-43 | **Scoped to ADR-007** — mainland China requires separate in-country deployment | PIPL security assessment filing (ADR-007) |
| Data Localization (Other APAC) | APPI, PDPA, DPDP | APAC-region deployment with APAC-bound key material | Local counsel verification per jurisdiction |
| Breach Notification | GDPR Art. 33 (72h), UK GDPR, PIPL | Regional logging + automated alerting to meet shortest SLA | Incident response playbooks with jurisdiction-specific SLAs |
| Sub-processor Disclosure | GDPR Art. 28, PIPL Art. 23 | Sub-processor list maintained per region in contract annex | Executed contract annexes |
| Data Deletion on Exit (Contract) | Contractual / GDPR Art. 17 (individual) | Cryptographic erasure via key destruction + metadata purge | Key destruction certificates |
| Individual Erasure (Art. 17) | GDPR Art. 17 | Record-level deletion API + metadata purge | Deletion verification audit per request |
| Encryption Standards | NIST SP 800-57, FIPS 140-3 | AES-256-GCM for data at rest, TLS 1.3 for data in transit | Cryptographic module validation certificates |

### 4.2 Control Implementation Matrix

| Control ID | Control Name | Implementation | Test Method | Frequency |
|------------|-------------|----------------|-------------|-----------|
| SEC-001 | Data Residency Enforcement | Regional deployment with jurisdictional routing | Automated compliance scan + manual sampling | Quarterly |
| SEC-002 | Encryption at Rest | CMEK with regional HSM | Key metadata audit + ciphertext verification | Monthly |
| SEC-003 | Encryption in Transit | TLS 1.3, mTLS for internal | SSL Labs scan + certificate inventory | Weekly |
| SEC-004 | Immutable Backup | WORM object-lock on regional buckets | Backup restoration test + lock verification | Monthly |
| SEC-005 | Access Logging | Cloud Audit Logs, SIEM ingestion | Log completeness check + tamper verification | Continuous |
| SEC-006 | Key Rotation | Automatic DEK rotation (90d), KEK rotation (annual); re-wrap within 30d | Key metadata audit + sample re-wrap verification | Quarterly |
| SEC-007 | Data Deletion — Individual | Record-level deletion + metadata purge | Deletion verification audit | Per-request + annual sample |
| SEC-008 | Data Deletion — Bulk/Contract | Cryptographic erasure + metadata purge | Key destruction certificate + recovery test | Per-contract event |
| SEC-009 | Provider Verification | SOC 2 Type II, CSA STAR registry review | Document review + provider inquiry | Annual |
| SEC-010 | BIA Validation | Formal BIA confirming MTD/RTO/RPO | BIA report review | Annual / post-change |
| SEC-011 | Incident Response | Jurisdiction-specific playbooks with breach-notification SLAs | Tabletop exercise | Semi-annual |
| SEC-012 | Key Ceremony Dual Control | NIST SP 800-57 | Ceremony observation + log review | Per-ceremony |



## 5. Verification & Evidence

The following must exist in the **requirement baseline** before design proceeds to implementation:

### 5.1 Provider Assurance

- [ ] **SOC 2 Type II report** covering the specific regional services in scope (not a generic corporate report)
  - Must include operating effectiveness over a minimum 6-month period
  - Must cover the specific IaaS services: compute, storage, database, HSM, and networking
  - Must be dated within the last 12 months

- [ ] **CSA STAR registry entry** with current position for the IaaS provider
  - Prefer Level 2 (STAR Certification) or Level 3 (STAR Continuous)
  - Must include CCM v4 control mappings

### 5.2 Contractual Obligations (Per Region)

- [ ] **Data Processing Agreement (DPA)** executed with the cloud provider
- [ ] **Contractual annex** specifying:
  - Encryption standards (AES-256-GCM minimum) and key-management obligations
  - Breach-notification SLA (aligned to strictest applicable window — 72 hours for EU, 60 days for HIPAA, as applicable)
  - Sub-processor disclosure and consent mechanism
  - Data-deletion procedure and evidence format on contract exit
  - Audit rights (right to audit provider controls, or reliance on third-party reports)
  - Data localization commitment (provider will not move data outside specified regions without consent)

### 5.3 Key Management

- [ ] **HSM key-ceremony documentation** with:
  - Dual-control procedures
  - Split-knowledge requirements
  - Witnessed ceremony logs
  - Key escrow arrangement with third-party escrow agent (per-region)
- [ ] **Key recovery and break-glass procedures** documented and tested
- [ ] **Key rotation schedule** approved by CISO and DPO, including re-wrap procedure for existing objects

### 5.4 Business Impact Analysis

- [ ] **BIA commissioning record** confirming:
  - The four-hour MTD figure (validated, not assumed)
  - Derived RTO (Recovery Time Objective)
  - Work-recovery time component
  - RPO (Recovery Point Objective) — how much claims data can be lost
  - Critical system dependencies and single points of failure

> **Note:** BIA output does **not** block the data-residency decision in this ADR. The availability architecture (DR, backup frequency, replication topology) **is** dependent on validated BIA results. ADR-006 (Availability and Disaster Recovery Architecture) follows BIA completion.

### 5.5 Privacy Impact Assessment

- [ ] **DPIA (Data Protection Impact Assessment)** per GDPR Article 35
- [ ] **PIA (Privacy Impact Assessment)** per HIPAA (if applicable)
- [ ] **PIPL security impact assessment** (if processing reaches threshold under PIPL Article 55) — **scoped to ADR-007 for mainland China**



## 6. Architecture Overview

### 6.1 Regional Deployment Model

{{< diagram src="adr5-regional-deployment" caption="Four regional stacks under one control plane that persists nothing. **The Cloud HSM in each column is what makes the residency claim enforceable**, because a region's key material never leaves its geographic boundary and no key from one region wraps a key from another. The Jurisdiction Router reads a transient routing identifier to pick the column and stores none of it." >}}

**Legend:**
- 🔵 **Blue** = Global Control Plane (no persisted PII; processes transient routing identifiers)
- 🟠 **Orange** = HSM / Key Management
- 🟢 **Green** = Immutable Backup / DR
- 🔴 **Red** = Data Stores (encrypted at rest)
- Solid lines = Active data flow
- Dotted lines = Backup replication / metrics (non-PII)

**Control Plane PII Clarification:** The Jurisdiction Router and IAM components process transient personal data (user ID, jurisdiction mapping) to route and authenticate requests. The service needs this processing, and the DPA governs it. The global control plane does **not persist** health data, claims data, or PII in durable storage. Durable PII storage stays within regional boundaries.

### 6.2 Data Flow Diagrams

#### 6.2.1 Claims Submission Flow

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│          │     │             │     │              │     │             │     │          │
│ Policy-  │────▶│   Global    │────▶│ Jurisdiction │────▶│  Regional   │────▶│ Regional │
│ holder   │ TLS │   API GW    │ TLS │   Router     │ TLS │   App Tier  │────▶│   DB     │
│          │ 1.3 │  (WAF/Rate) │ 1.3 │ (Transient   │ 1.3 │ (Microsvcs) │ mTLS│ (CMEK)   │
│          │     │             │     │  routing ID) │     │             │     │          │
└──────────┘     └─────────────┘     └──────────────┘     └─────────────┘     └────┬─────┘
                                                                                   │
                                                                                   │ Key Unwrap
                                                                                   ▼
                                                                            ┌─────────────┐
                                                                            │ Regional HSM│
                                                                            │  (CMEK)     │
                                                                            └─────────────┘
```

#### 6.2.2 Document Upload Flow

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│          │     │             │     │              │     │             │     │          │
│ Policy-  │────▶│   Global    │────▶│ Jurisdiction │────▶│  Regional   │────▶│ Regional │
│ holder   │ TLS │   API GW    │ TLS │   Router     │ TLS │   App Tier  │────▶│ Object   │
│          │ 1.3 │             │ 1.3 │              │ 1.3 │             │ mTLS│ Storage  │
│          │     │             │     │              │     │             │     │ (CMEK)   │
└──────────┘     └─────────────┘     └──────────────┘     └─────────────┘     └────┬─────┘
                                                                                   │
                                                                                   │ Key Unwrap
                                                                                   ▼
                                                                            ┌─────────────┐
                                                                            │ Regional HSM│
                                                                            │  (CMEK)     │
                                                                            └─────────────┘
```

#### 6.2.3 Cross-Border Analytics Flow (Anonymized Only)

```
┌──────────┐     ┌─────────────┐     ┌─────────────────────┐     ┌──────────────┐
│          │     │             │     │                     │     │              │
│ Regional │────▶│ Anonymization│────▶│  Global Analytics   │◀────│ Other Region │
│   DB     │     │   Pipeline   │     │   (Differential     │     │  (Anonymized)│
│          │     │ (k-anonymity │     │    Privacy /        │     │              │
│          │     │  / Synthetic)│     │    Synthetic Data)  │     │              │
└──────────┘     └─────────────┘     └─────────────────────┘     └──────────────┘

     ▲                                                              ▲
     │                                                              │
     │  NO RAW CLAIMS DATA FLOWS ACROSS REGIONS                    │
     │  Only anonymized / aggregated / synthetic datasets          │
     │  Legal review required for each analytics use case          │
     └──────────────────────────────────────────────────────────────┘
```

### 6.3 Encryption Key Hierarchy (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           KEY HIERARCHY DETAILED VIEW                                │
│                                                                                      │
│  TIER 0: REGIONAL ROOT KEYS (Independent — no global root)                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  EU-ROOT — EU Root Key (RSA-4096 or P-384)                                 │    │
│  │  • Stored in EU HSM, never leaves EU geographic boundary                    │    │
│  │  • Used ONLY for:                                                           │    │
│  │    - Wrapping EU KEKs during key ceremony                                   │    │
│  │    - EU escrow recovery operations                                          │    │
│  │  • Access: CISO + DPO dual control, EU-based personnel only                 │    │
│  │  • Legal jurisdiction: EU GDPR / member state law                           │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  UK-ROOT — UK Root Key (RSA-4096 or P-384)                                 │    │
│  │  • Stored in UK HSM, never leaves UK geographic boundary                    │    │
│  │  • Used ONLY for wrapping UK KEKs and UK escrow recovery                    │    │
│  │  • Access: CISO + DPO dual control, UK-based personnel only                 │    │
│  │  • Legal jurisdiction: UK GDPR / DPA 2018                                   │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  US-ROOT — US Root Key (RSA-4096 or P-384)                                 │    │
│  │  • Stored in US HSM, never leaves US geographic boundary                    │    │
│  │  • Used ONLY for wrapping US KEKs and US escrow recovery                    │    │
│  │  • Access: CISO + DPO dual control, US-based personnel only                 │    │
│  │  • Legal jurisdiction: HIPAA / US state privacy law                         │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  APAC-ROOT — APAC Root Key (RSA-4096 or P-384)                             │    │
│  │  • Stored in APAC HSM, never leaves APAC geographic boundary                │    │
│  │  • Used ONLY for wrapping APAC KEKs and APAC escrow recovery                │    │
│  │  • Access: CISO + DPO dual control, APAC-based personnel only               │    │
│  │  • Legal jurisdiction: Singapore PDPA / APPI / DPDP as applicable           │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  TIER 1: REGIONAL KEY ENCRYPTION KEYS (KEKs)                                         │
│  ┌─────────────────────────┬─────────────────────────┬─────────────────────────┐    │
│  │    EU-KEK-01            │    UK-KEK-01            │    US-KEK-01            │    │
│  │    (AES-256-GCM)        │    (AES-256-GCM)        │    (AES-256-GCM)        │    │
│  │                         │                         │                         │    │
│  │  • Regional HSM only    │  • Regional HSM only    │  • Regional HSM only    │    │
│  │  • Rotated annually     │  • Rotated annually     │  • Rotated annually     │    │
│  │  • Wraps EU DEKs        │  • Wraps UK DEKs        │  • Wraps US DEKs        │    │
│  │  • No cross-region use  │  • No cross-region use  │  • No cross-region use  │    │
│  └─────────────────────────┴─────────────────────────┴─────────────────────────┘    │
│              │                       │                       │                       │
│  ┌─────────────────────────┐                                                         │
│  │    APAC-KEK-01          │                                                         │
│  │    (AES-256-GCM)        │                                                         │
│  │  • Regional HSM only    │                                                         │
│  │  • Rotated annually     │                                                         │
│  │  • Wraps APAC DEKs      │                                                         │
│  │  • No cross-region use  │                                                         │
│  └─────────────────────────┘                                                         │
│              │                                                                       │
│  TIER 2: DATA ENCRYPTION KEYS (DEKs)                                                 │
│  ┌─────────────────────────┬─────────────────────────┬─────────────────────────┐    │
│  │  EU-DEK-DB-001          │  UK-DEK-DB-001          │  US-DEK-DB-001          │    │
│  │  EU-DEK-DB-002          │  UK-DEK-DB-002          │  US-DEK-DB-002          │    │
│  │  EU-DEK-OBJ-001         │  UK-DEK-OBJ-001         │  US-DEK-OBJ-001         │    │
│  │  ...                    │  ...                    │  ...                    │    │
│  │                         │                         │                         │    │
│  │  • Per-resource DEKs    │  • Per-resource DEKs    │  • Per-resource DEKs    │    │
│  │  • Rotated every 90d    │  • Rotated every 90d    │  • Rotated every 90d    │    │
│  │  • Auto-generated by    │  • Auto-generated by    │  • Auto-generated by    │    │
│  │    KMS, wrapped by KEK  │    KMS, wrapped by KEK  │    KMS, wrapped by KEK  │    │
│  │  • Existing objects     │  • Existing objects     │  • Existing objects     │    │
│  │    re-wrapped within    │    re-wrapped within    │    re-wrapped within    │    │
│  │    30 days of rotation  │    30 days of rotation  │    30 days of rotation  │    │
│  └─────────────────────────┴─────────────────────────┴─────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────┐                                                         │
│  │  APAC-DEK-DB-001        │                                                         │
│  │  APAC-DEK-DB-002        │                                                         │
│  │  APAC-DEK-OBJ-001       │                                                         │
│  │  ...                    │                                                         │
│  │  • Per-resource DEKs    │                                                         │
│  │  • Rotated every 90d    │                                                         │
│  │  • Auto-generated by    │                                                         │
│  │    KMS, wrapped by KEK  │                                                         │
│  │  • Re-wrap within 30d   │                                                         │
│  └─────────────────────────┘                                                         │
│                                                                                      │
│  KEY BINDING INVARIANT:                                                              │
│  ∀ DEK : region(DEK) == region(data_protected_by_DEK) ==                            │
│          region(KEK_wrapping_DEK) == region(ROOT_wrapping_KEK)                       │
│                                                                                      │
│  VIOLATION = ARCHITECTURE FAILURE                                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```



## 7. Traceability to Requirement Baseline

The **requirement baseline** is the deliverable that ends this phase. It records each obligation with its source, the data and systems it touches, and the objective it implies. It also names the accountable owner and a placeholder traceability link to the architectural element that will satisfy it.

| # | Obligation | Source Regulation / Standard | Data / System | Accountable Owner | Architectural Element (Placeholder) | Status |
|---|-----------|------------------------------|---------------|-------------------|-------------------------------------|--------|
| 1 | EU data remains in EU | GDPR Arts. 44-49 | EU_DB, EU_OBJ, EU_HSM | DPO | TBD — Data Residency Control | ⬜ |
| 2 | UK data remains in UK | UK GDPR / DPA 2018 | UK_DB, UK_OBJ, UK_HSM | DPO | TBD — Data Residency Control | ⬜ |
| 3 | US data remains in US | HIPAA / State privacy laws | US_DB, US_OBJ, US_HSM | DPO / US Counsel | TBD — Data Residency Control | ⬜ |
| 4 | APAC data localization | PDPA / APPI / DPDP | ASIA_DB, ASIA_OBJ, ASIA_HSM | DPO / Regional Counsel | TBD — Data Residency Control | ⬜ |
| 5 | China data localization | PIPL Art. 38-43 | **Scoped to ADR-007** | DPO / China Counsel | TBD — China Data Residency | ⬜ |
| 6 | Encryption keys bound to region | Contractual / NIST SP 800-57 | All regional HSMs | Cloud Security Architect | TBD — Key Management Control | ⬜ |
| 7 | Encryption at rest (health data) | HIPAA / GDPR Art. 32 | All DBs, object stores | Cloud Security Architect | TBD — Encryption Control | ⬜ |
| 8 | Encryption in transit | GDPR Art. 32 / ISO 27001 A.8.24 | All network paths | Network Security Engineer | TBD — Network Security Control | ⬜ |
| 9 | Immutable backup isolated | Ransomware resilience objective | EU_IMM, UK_IMM, US_IMM, ASIA_IMM | SRE Lead | TBD — Backup Architecture | ⬜ |
| 10 | Provider SOC 2 Type II verified | IaaS shared-responsibility gap | All regional services | Risk & Compliance | TBD — Third-Party Assurance | ⬜ |
| 11 | Breach notification within SLA | GDPR Art. 33 / PIPL | All systems | Incident Response Lead | TBD — Incident Response | ⬜ |
| 12 | Sub-processor disclosure | GDPR Art. 28 / PIPL Art. 23 | All services | Legal Counsel | TBD — Vendor Management | ⬜ |
| 13 | Data deletion on exit (contract) | Contractual | All data stores | DPO | TBD — Data Lifecycle (Bulk) | ⬜ |
| 14 | Individual erasure (Art. 17) | GDPR Art. 17 | All data stores | DPO | TBD — Data Lifecycle (Individual) | ⬜ |
| 15 | BIA-validated RTO/RPO | MTD signal (4 hours) | All critical systems | Business Continuity Mgr | TBD — Availability Architecture | ⬜ |
| 16 | DPIA / PIA completed | GDPR Art. 35 / HIPAA | Claims portal | DPO / Privacy Officer | TBD — Privacy Governance | ⬜ |
| 17 | Access logging and monitoring | ISO 27001 A.8.15 / GDPR Art. 5(2) | All systems | SOC Lead | TBD — Logging & Monitoring | ⬜ |
| 18 | Key ceremony dual control | NIST SP 800-57 | All HSMs | CISO | TBD — Key Ceremony | ⬜ |

> **The architect is accountable for that document, not for any single control.**



## 8. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

| Week | Activity | Deliverable | Owner |
|------|----------|-------------|-------|
| 1 | Commission BIA | BIA charter, stakeholder interviews scheduled | Business Continuity Mgr |
| 1 | Commission DPIA / PIA | Privacy assessment scope, data flow mapping | DPO |
| 1-2 | Provider verification | SOC 2 Type II review, CSA STAR verification | Risk & Compliance |
| 2 | Contract negotiation | DPA and annex drafts per region | Legal Counsel |
| 2-3 | Key ceremony design | HSM architecture, dual-control procedures | Cloud Security Architect |
| 3-4 | Infrastructure-as-code baseline | Terraform modules for regional deployment | Cloud Engineering |

### Phase 2: Regional Deployment (Weeks 5-12)

| Week | Activity | Deliverable | Owner |
|------|----------|-------------|-------|
| 5-6 | EU region deployment | EU cluster, DB, storage, HSM live | Cloud Engineering |
| 6-7 | UK region deployment | UK cluster, DB, storage, HSM live | Cloud Engineering |
| 7-8 | US region deployment | US cluster, DB, storage, HSM live | Cloud Engineering |
| 8-9 | APAC region deployment | APAC cluster, DB, storage, HSM live | Cloud Engineering |
| 9 | Global control plane | API Gateway, IAM, routing logic | Cloud Engineering |
| 10 | Encryption integration | CMEK enabled, key hierarchy tested | Cloud Security Architect |
| 11 | Backup and immutability | WORM buckets, replication tested | SRE Lead |
| 12 | Integration testing | End-to-end cross-region routing | QA Lead |

### Phase 3: Validation (Weeks 13-16)

| Week | Activity | Deliverable | Owner |
|------|----------|-------------|-------|
| 13 | Security testing | Penetration test, encryption verification | Security Testing Team |
| 14 | Compliance audit | Control evidence, gap analysis | Internal Audit |
| 15 | DR drill | Regional failover test, RTO/RPO validation | SRE Lead |
| 15 | Key recovery drill | Break-glass procedure test | CISO |
| 16 | Go-live readiness | Sign-off from DPO, Legal, CISO | Enterprise Architect |

### Phase 4: Operationalize (Week 17+)

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Key rotation monitoring | Continuous (automated) | KMS / SRE |
| Access review | Quarterly | IAM Team |
| Compliance scan | Quarterly | GRC Team |
| Provider report review | Annual | Risk & Compliance |
| BIA refresh | Annual / post-change | Business Continuity Mgr |
| Tabletop exercise | Semi-annual | Incident Response |



## 9. Risk Register

**Risk Scoring:** Likelihood (1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain) × Impact (1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic)

| Risk ID | Risk Description | Likelihood | Impact | Risk Score | Mitigation Strategy | Residual Risk |
|---------|-----------------|------------|--------|------------|---------------------|---------------|
| R-001 | Provider SOC 2 Type II does not cover regional services | 3 (Possible) | 4 (Major) | **12** | Require explicit in-scope statement; consider secondary provider if gap exists | 2 (Minor) |
| R-002 | Key ceremony failure locks out regional data | 2 (Unlikely) | 5 (Catastrophic) | **10** | Third-party escrow, break-glass, quarterly drills | 2 (Minor) |
| R-003 | PIPL security assessment delays China deployment | 3 (Possible) | 3 (Moderate) | **9** | Engage local counsel early; prepare assessment documentation in parallel; scoped to ADR-007 | 3 (Moderate) |
| R-004 | BIA reveals RTO < 4h requires hot-site (cost overrun) | 3 (Possible) | 4 (Major) | **12** | Budget contingency (20%); phased rollout allows cost optimization | 3 (Moderate) |
| R-005 | Cross-border analytics pipeline leaks PII | 2 (Unlikely) | 5 (Catastrophic) | **10** | Differential privacy, synthetic data, legal review per use case, automated PII detection | 2 (Minor) |
| R-006 | Immutable backup fails restoration test | 2 (Unlikely) | 4 (Major) | **8** | Monthly restoration drills, backup integrity checksums | 2 (Minor) |
| R-007 | Regional deployment drift (configuration inconsistency) | 3 (Possible) | 3 (Moderate) | **9** | Infrastructure-as-code, automated compliance scanning, golden image pipeline | 2 (Minor) |
| R-008 | Sub-processor adds non-compliant region | 3 (Possible) | 4 (Major) | **12** | Contractual pre-approval requirement, automated sub-processor monitoring | 2 (Minor) |
| R-009 | Encryption key rotation causes application outage | 2 (Unlikely) | 4 (Major) | **8** | Staged rotation, canary testing, automatic rollback | 2 (Minor) |
| R-010 | Jurisdiction router misroutes data to wrong region | 2 (Unlikely) | 5 (Catastrophic) | **10** | Multi-factor routing validation, automated compliance alerts, manual override for edge cases | 2 (Minor) |



## 10. References

### 10.1 Standards and Frameworks

1. (ISC)² **ISSAP CBK**, Domain 2 — Security Architecture Modeling
2. **GDPR** Regulation (EU) 2016/679
   - Article 25 — Data protection by design and by default
   - Article 32 — Security of processing
   - Articles 44-49 — Transfers of personal data to third countries
3. **UK Data Protection Act 2018**
4. **Personal Information Protection Law of the People's Republic of China (PIPL)**, 2021
5. **ISO/IEC 27701:2019** — Privacy Information Management System (PIMS)
6. **ISO/IEC 27018:2019** — Code of practice for protection of PII in public clouds
7. **ISO/IEC 27001:2022** — Information Security Management Systems
8. **CSA Cloud Controls Matrix (CCM) v4.0**
9. **NIST SP 800-57** — Recommendation for Key Management
10. **NIST SP 800-53 Rev. 5** — Security and Privacy Controls
11. **HIPAA Security Rule** — 45 CFR Parts 160, 162, and 164
12. **FIPS 140-3** — Security Requirements for Cryptographic Modules

### 10.2 Cloud Provider Documentation

13. **Google Cloud**
    - Assured Workloads — [cloud.google.com/assured-workloads](https://cloud.google.com/assured-workloads)
    - Cloud HSM — [cloud.google.com/kms/docs/hsm](https://cloud.google.com/kms/docs/hsm)
    - VPC Service Controls — [cloud.google.com/vpc-service-controls](https://cloud.google.com/vpc-service-controls)
    - Cloud KMS — Customer-Managed Encryption Keys (CMEK)

14. **AWS** (for comparison / multi-cloud context)
    - AWS Dedicated HSM — [aws.amazon.com/cloudhsm](https://aws.amazon.com/cloudhsm)
    - AWS KMS — Customer Managed Keys
    - IAM Boundaries

15. **Azure** (for comparison / multi-cloud context)
    - Azure Dedicated HSM
    - Azure Policy Engine
    - Customer-managed keys for Storage and SQL

### 10.3 Additional Reading

16. **ENISA** — Cloud Security Guide for SMEs
17. **ICO (UK)** — International transfers guidance
18. **Cyberspace Administration of China (CAC)** — PIPL implementation guidelines
19. **CSA STAR** — [cloudsecurityalliance.org/star](https://cloudsecurityalliance.org/star)



---

*This ADR is an exercise in applying enterprise security architecture principles to a realistic multinational insurer scenario.*

---

## Fix Log: Validation & Critique Response

Defects found during adversarial review of this ADR, and the fixes applied.

## ADR-005 (Residency / Claims Portal) — Fixes Applied

| # | Issue | Fix |
|---|---|---|
| 1 | Single global Tier 0 Root Key wrapping all regional KEKs — violated the "no cross-region key wrapping" invariant | **Replaced with independent Regional Root Keys** (EU-ROOT, UK-ROOT, US-ROOT, APAC-ROOT). Each root lives in its regional HSM and only wraps KEKs in the same region. Per-region escrow agents. |
| 2 | PIPL claimed but APAC region placed in Taiwan/Singapore. GCP has no mainland China region. Architecture could not satisfy PIPL localization. | **Added explicit China exclusion note:** mainland China scoped out of Phase 1; requires separate in-country deployment via ADR-007. APAC region now explicitly covers Singapore, Japan, India. |
| 3 | US region missing from deployment table, Mermaid diagram, key hierarchy, and traceability despite being listed in user base and HIPAA assumption | **Added US region throughout:** deployment table, Mermaid subgraph (us-east1), key hierarchy (US-ROOT, US-KEK, US-DEK), traceability row, data flows. |
| 4 | "No PII" control plane contained Jurisdiction Router and IAM — router must process user ID to route; this is PII processing, not just storage | **Added Control Plane PII Clarification:** acknowledges router and IAM process transient personal data (user ID, jurisdiction mapping) for routing/auth. Clarified "no persisted PII" — durable storage stays regional. Aligned §2.1.1 and §6.1 language. |
| 5 | Art. 17 (individual erasure) mismapped to cryptographic erasure. Destroying a regional KEK deletes everyone in the region, not one data subject. | **Separated obligations:** (a) Individual erasure (Art. 17) → record-level deletion API + metadata purge; (b) Contract exit / bulk deletion → cryptographic erasure via key destruction. Updated controls SEC-007 and SEC-008. |
| 6 | FIPS 140-2 specified in 2026 contract annex. CMVP moved 140-2 to historical status. | **Updated to FIPS 140-3 Level 3** throughout. Added note: "or FIPS 140-2 Level 3 pending provider re-validation." |
| 7 | Risk register arithmetic inconsistent. Legend 5×5 with Negligible/Minor/Moderate/Major/Catastrophic; table used Medium/High/Critical with inconsistent values. | **Replaced all impact ratings** with 1-5 scale. Recalculated all risk scores consistently. |
| 8 | DEK rotation every 90 days without re-encryption plan. In Cloud KMS, rotation creates new version for new writes; existing objects stay on old versions. | **Added re-wrap requirement:** "Existing objects re-wrapped within 30 days of rotation" in key hierarchy and control matrix. |
| 9 | Mermaid syntax errors: stray trailing paren on subgraph lines; "europe-west" is not a valid region. | **Fixed Mermaid:** removed stray parens; changed to valid region names (europe-west1, europe-west2, asia-southeast1, us-east1). |
| 10 | Cost absent. Rejected Alternative B on "5-10x cost" but never priced chosen option. | **Added rough order-of-magnitude estimate:** ~$180K–$240K/year with stated assumptions (key versions, regional clusters, HA SQL). |
| 11 | HIPAA asserted without scoping. Multinational insurer is only a covered entity for health plans, not auto/life/property. | **Added HIPAA Scoping Assumption:** assumes health plan operations; other lines out of scope. DPO must confirm. |
| 12 | Study-guide leakage: blockquote attributed to "ISSAP Domain 2, Scenario Walkthrough" with page citation; footer cited (ISC)² guide. | **Removed all study-guide references.** Rewrote blockquote in own voice without attribution. Removed footer citation. Removed "Page 60" from metadata. |


## What Was Preserved from Original Drafts

- ADR-005 §5 (Verification & Evidence) — retained with additions
- ADR-005 §7 (Requirement-baseline traceability) — retained with additions
- ADR-005 §1.2.4 (BIA before hot site) — retained, blockquote rewritten in own voice
- ADR-005 §2.2 (Rejected Alternatives A/B/C with residual-use notes) — retained with updates
