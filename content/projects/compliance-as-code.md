---
title: "Compliance as Code"
recordID: "PRJ-001"
status: "Shipped"
date: 2026-04-01
weight: 1
summary: "50 OPA policy tests, all passing, wired into a CI gate that blocks non-compliant infrastructure before it merges. Every rule maps to a PCI DSS v4.0, SOC 2, or NIST 800-53 control."
---

**Repo:** [github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE) · **CI:** ![OPA Policy Unit Tests](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE/actions/workflows/opa-tests.yml/badge.svg) ![policy-check](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE/actions/workflows/policy-check.yml/badge.svg)

A published, completed portfolio artifact: Open Policy Agent (OPA) and Rego policy enforcement mapped explicitly to PCI DSS v4.0, SOC 2 (CC6/CC7), and NIST 800-53 control families. 50 of 50 OPA unit tests pass; CI runs green on a five-job gated GitHub Actions pipeline.

The repo went through four adversarial review rounds, resolving 27+ defects before being called done. I directed AI-assisted implementation throughout, but owned the architecture decisions and the adversarial review personally. That distinction matters and is the accurate way to describe how this was built, including in interviews.

Stack: Open Policy Agent, Rego, GitHub Actions, PCI DSS v4.0 / SOC 2 / NIST 800-53 control mapping

[View on GitHub →](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE)
