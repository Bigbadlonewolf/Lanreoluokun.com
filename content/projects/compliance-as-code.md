---
title: "Compliance as Code"
recordID: "PRJ-001"
status: "Shipped"
date: 2026-04-01
summary: "OPA/Rego policy enforcement mapped to PCI DSS v4.0, SOC 2, and NIST 800-53, with a gated CI pipeline and 50/50 passing policy tests."
---

A published, completed portfolio artifact: Open Policy Agent (OPA) and Rego policy enforcement mapped explicitly to PCI DSS v4.0, SOC 2 (CC6/CC7), and NIST 800-53 control families. 50 of 50 OPA unit tests pass; CI runs green on a five-job gated GitHub Actions pipeline.

The repo went through four adversarial review rounds, resolving 27+ defects before being called done. I directed AI-assisted implementation throughout, but owned the architecture decisions and the adversarial review personally. That distinction matters and is the accurate way to describe how this was built, including in interviews.

Stack: Open Policy Agent, Rego, GitHub Actions, PCI DSS v4.0 / SOC 2 / NIST 800-53 control mapping

[View on GitHub →](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE)
