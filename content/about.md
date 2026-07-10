---
title: "About"
recordID: "REC-000"
status: "Accepted"
date: 2026-07-03
summary: "Cloud Security Architect with 4+ years in architecture roles, plus a decade in retail banking and a logistics business in Lagos."
---

**Senior Cloud Security Engineer · CISSP, CCSP, CISM, ISSAP, GCP-PCA**

New York, NY · Open to Remote

[LinkedIn](https://linkedin.com/in/lanre-oluokun-04256040) · [GitHub](https://github.com/Bigbadlonewolf)

I design cloud security architecture for regulated industries, mostly financial services, with GCP, Zero Trust, and compliance-as-code. I have 4+ years in architecture-titled roles, plus a decade in retail banking and a few years running my own logistics business in Lagos.

I own architecture decisions, map controls to PCI DSS, SOC 2, and NIST 800-53, and run adversarial review cycles. I do not write every line of code, but I direct the build, catch the gaps, and sign off on what ships.

## What I do

- Cloud security engineering on GCP: IAM, Zero Trust access design, policy enforcement
- Architecture decision records: documenting why, not just what
- GRC: PCI DSS, SOC 2, NIST 800-53 mapped to technical controls
- Policy-as-code with OPA/Rego, enforced in CI
- Compliance automation in GitHub Actions and CI pipelines

## Career

**Enterprise Architect · Go Cloud Careers**  
Sep 2024 – Present (Contract, Remote)

- Architect cloud security solutions across AWS, Azure, and GCP for financial services, healthcare, and SaaS clients.
- Present technology roadmaps and security recommendations to C-suite stakeholders.
- Design reusable security patterns adopted across multiple engagements.
- Guide cloud migration programs from legacy on-prem to cloud-native, Zero Trust-aligned architectures.
- Bridge technical security requirements with business outcomes across architecture, engineering, compliance, and executive teams.

**Cloud Vulnerability Engineer · LOG(N) Pacific**  
Sep 2023 – Aug 2024 (Contract, Remote)

- Hardened Azure environments using CIS Benchmarks and Azure Security Center.
- Ran continuous vulnerability scanning with Tenable/Nessus across Windows and Linux endpoints, tuning policies to cut false positives.
- Built Microsoft Sentinel SIEM workspaces with data connectors for Azure resources, M365, and endpoint agents.
- Administered Microsoft Defender for Endpoint, configured detection policies, and maintained device compliance.
- Wrote security operations runbooks for alert triage, vulnerability prioritization, and patch coordination.

**Cloud Security Architect · ATBOD**  
Sep 2022 – Aug 2023 (Full-time, New Jersey)

- Designed cloud security architectures for hybrid and GCP-focused multi-cloud deployments.
- Built ZTNA, microsegmentation, and least-privilege access models.
- Architected IAM frameworks with federated identity, PAM, RBAC, and JIT access.
- Developed security reference architectures adopted as organizational baselines.
- Designed SSO and MFA strategies aligned to NIST SP 800-63.
- Built data classification and encryption strategies using cloud KMS with customer-managed keys.

**Founder & Managing Director · Bloominglo Limited**  
2017 – 2021 (Lagos, Nigeria)

- Built an FMCG logistics business from zero to $500K+ annual revenue.
- Managed vendor contracts, regulatory compliance (NDPA, CBN), and cross-functional teams.

**Senior Retail Banking Officer · First Bank of Nigeria**  
Feb 2008 – Jun 2017 (Full-time, Lagos, Nigeria)

- Enforced AML/CTF compliance under CBN regulations, NDPA, and NFIU mandates.
- Ran KYC/CDD across individual, SME, and mass-market portfolios.

**IT Help Desk Officer · British American Tobacco**  
Apr 2006 – Feb 2008 (Contract, Ibadan, Nigeria)

- Delivered first- and second-line support across 150+ workstations.
- Managed user provisioning and RBAC-aligned access rights.

## Case studies

### Compliance-as-code: OPA/Rego policy pipeline

**Problem:** A financial services client needed to prove PCI DSS v4.0, SOC 2, and NIST 800-53 compliance without manual audit trails. Controls were documented in spreadsheets; enforcement was inconsistent.

**Solution:** I architected an OPA/Rego policy repository with automated control mapping. I defined which controls were machine-enforceable, wrote the policy logic, and set up a GitHub Actions CI pipeline with Conftest to block non-compliant infrastructure before it merged.

**Outcome:** 50/50 passing OPA unit tests. All three CI jobs green. Four rounds of adversarial review caught 27+ defects before release. The pipeline became the audit evidence, not a spreadsheet.

[View on GitHub](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE)

### GCP Zero Trust access broker for lending operations

**Problem:** A bank's loan officers needed time-bound, just-in-time access to sensitive customer data. Standing access violated least-privilege principles and created audit risk.

**Solution:** I designed a GCP-native JIT access broker using Cloud Functions, IAM conditional bindings, and audit logging. Access requests route through an approval workflow; grants expire automatically; every action is logged to BigQuery for audit.

**Outcome:** Eliminated standing privileged access for loan officers. Audit trail is queryable in real time. Architecture is documented with ADRs and ready for production hardening.

[View on GitHub](https://github.com/Bigbadlonewolf/BankVault)

### SecureVault: GCP Security Command Center alerting

**Problem:** Security Command Center findings were sitting unread. The client had no automated alerting for high-risk misconfigurations like public buckets or open firewalls.

**Solution:** I built a lightweight pipeline: SCC SHA findings → Pub/Sub → Cloud Function → email alerts. Targeted specific high-severity findings. Kept costs under $5/month using free tiers.

**Outcome:** Automated alerting for PUBLIC_BUCKET_ACL, OPEN_FIREWALL, and OVER_PRIVILEGED_SERVICE_ACCOUNT. Zero manual monitoring overhead. CI/CD green.

[View on GitHub](https://github.com/Bigbadlonewolf/SecureVault)

## Selected writing

- "Why Cloud Security Architects Still Need to Understand Banking Risk." On the gap between technical controls and business context in regulated environments. (Draft, Q3 2026)
- "From Lagos to GCP: What a Decade in Retail Banking Taught Me About Zero Trust." How KYC/CDD workflows map to modern identity and access management. (Draft, Q3 2026)
- "Compliance-as-Code Is Not a CI Badge." Why passing OPA tests is the start, not the finish, of audit-ready policy enforcement. (Draft, Q3 2026)

## Certifications

- CISSP: Certified Information Systems Security Professional (ISC²)
- CCSP: Certified Cloud Security Professional (ISC²)
- CISM: Certified Information Security Manager (ISACA)
- ISSAP: Information Systems Security Architecture Professional (ISC²)
- GCP Professional Cloud Architect (Google Cloud)
- CHCSS 310: Certified Hands-On Cybersecurity Specialist (KERNELiOS, 2024)

## Technical skills

- Cloud platforms: GCP, Microsoft Azure, AWS, multi-cloud
- Security architecture: Zero Trust / ZTNA, microsegmentation, CSPM, least-privilege design
- Policy-as-code: OPA / Rego, Conftest, GitHub Actions CI
- Identity and access: IAM, PAM, RBAC, MFA, SSO, JIT access, federated identity, NIST SP 800-63
- Threat and vulnerability: Tenable / Nessus, Microsoft Defender for Endpoint, EDR, credentialed scanning
- SIEM and monitoring: Microsoft Sentinel, Log Analytics, alert triage
- Data protection: encryption at rest and in transit, AWS KMS, Azure Key Vault, CMK, data classification
- Compliance: PCI DSS v4.0, SOC 2, NIST SP 800-53, CIS Benchmarks, ISO 27001, AML/CTF, KYC/CDD

## Education

**BTech, Computer Science** · Ladoke Akintola University of Technology (LAUTECH), 1998–2004

*Last updated: July 2026*
