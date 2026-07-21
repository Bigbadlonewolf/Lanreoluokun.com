---
title: "About"
recordID: "REC-000"
status: "Accepted"
date: 2026-07-03
summary: "Cloud Security Engineer, architecture-led. One year in an architecture-titled role at ATBOD, ongoing scenario-based architecture training, plus a decade in retail banking and a logistics business in Lagos."
---

**Cloud Security Engineer · Architecture-led · CISSP, CCSP, CISM, ISSAP, GCP-PCA**

New York, NY · Open to Remote

Targeting Cloud Security Engineer and Security Engineer roles at banks, fintechs, and regulated financial institutions.

[LinkedIn](https://linkedin.com/in/lanre-oluokun-04256040) · [GitHub](https://github.com/Bigbadlonewolf) · [Email](mailto:lanreolu88@googlemail.com)

I build cloud security controls for regulated industries, mostly financial services, with GCP, Zero Trust, and compliance-as-code, and I write down the architecture reasoning behind each one. My architecture-titled experience is one year as a Cloud Security Architect at ATBOD (Sep 2022 – Aug 2023), and since September 2024 I have been in the Go Cloud Careers Executive Architect Program, a scenario-based architecture training program. Alongside that: a decade in retail banking and a few years running my own logistics business in Lagos.

I write the policy logic, wire the pipelines, map controls to PCI DSS, SOC 2, and NIST 800-53, and run adversarial review cycles on my own decisions. Every project ships with the architecture decision record behind it, including the reversals.

## What I do

- Cloud security engineering on GCP: IAM, Zero Trust access design, policy enforcement
- Architecture decision records: documenting why, not just what
- GRC: PCI DSS, SOC 2, NIST 800-53 mapped to technical controls
- Policy-as-code with OPA/Rego, enforced in CI
- Compliance automation in GitHub Actions and CI pipelines

## Career

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

These are scenario-based training projects and independent portfolio work, not client engagements. The scenarios are set in financial services because that is the industry I know best and the one I am targeting.

### Compliance-as-code: OPA/Rego policy pipeline

**Problem:** The scenario: a financial services firm needs to prove PCI DSS v4.0, SOC 2, and NIST 800-53 compliance without manual audit trails. Controls are documented in spreadsheets; enforcement is inconsistent.

**Solution:** I architected an OPA/Rego policy repository with automated control mapping. I defined which controls were machine-enforceable, wrote the policy logic, and set up a GitHub Actions CI pipeline with Conftest to block non-compliant infrastructure before it merged.

**Outcome:** 116/116 passing OPA unit tests. All five CI jobs green. Four rounds of adversarial review caught 27+ defects before release. The pipeline became the audit evidence, not a spreadsheet.

[View on GitHub](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE)

### GCP Zero Trust access broker for lending operations

**Problem:** The scenario: a bank's loan officers need time-bound, just-in-time access to sensitive customer data. Standing access violates least-privilege principles and creates audit risk.

**Solution:** I designed a GCP-native JIT access broker using Cloud Functions, IAM conditional bindings, and audit logging. Access requests route through an approval workflow; grants expire automatically; every action is logged to BigQuery for audit.

**Outcome:** Reference architecture with no standing privileged access anywhere in the design. Every request, denial, and expiry flag is designed to land in an append-only BigQuery ledger. Six ADRs document the decisions, two of them reversed in the open. Implementation is partial — nothing is deployed — and the gaps are listed on the project page, not glossed.

[View on GitHub](https://github.com/Bigbadlonewolf/bankvault)

### SecureVault: GCP Security Command Center alerting

**Problem:** The scenario: Security Command Center findings sit unread. There is no automated alerting for high-risk misconfigurations like public buckets or open firewalls.

**Solution:** I built a lightweight pipeline: SCC SHA findings → Pub/Sub → Cloud Function → email alerts. It targets specific high-severity findings, with free-tier usage as a design constraint. I have not run it against a real project, so I have no measured monthly cost to quote.

**Outcome:** Designed to alert on PUBLIC_BUCKET_ACL, OPEN_FIREWALL, and OVER_PRIVILEGED_SERVICE_ACCOUNT findings, and to auto-remediate the first two. The pipeline is built and CI is green, but it is not deployed yet — so removing manual monitoring is the design goal, not a measured result.

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

## Education & Training

**Go Cloud Careers · Executive Architect Program**  
Sep 2024 – Present (scenario-based training, no live client engagements)

- Design cloud security architectures across AWS, Azure, and GCP against scenario briefs modeled on financial services, healthcare, and SaaS environments.
- Present technology roadmaps and security recommendations to executive review panels.
- The BankVault, SecureVault, and Compliance-as-Code builds on this site are the working output of this program plus independent work: real repos, real CI, real ADRs.

**BTech, Computer Science** · Ladoke Akintola University of Technology (LAUTECH), 1998–2004

*Last updated: July 2026*
