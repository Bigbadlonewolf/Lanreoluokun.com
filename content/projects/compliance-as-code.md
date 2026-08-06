---
title: "Compliance as Code"
recordID: "PRJ-001"
status: "Shipped"
date: 2026-04-01
weight: 1
summary: "163 OPA policy tests, all passing, wired into a CI gate that blocks non-compliant infrastructure before it merges. Detection logic lives once; the framework packages attach citations."
---

**Repo:** [github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE) · **CI:** ![OPA Policy Unit Tests](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE/actions/workflows/opa-tests.yml/badge.svg) ![policy-check](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE/actions/workflows/policy-check.yml/badge.svg)

A published portfolio artifact: Open Policy Agent (OPA) and Rego policy enforcement mapped explicitly to PCI DSS v4.0, SOC 2 (CC6/CC7), and NIST 800-53 control families. 163 of 163 OPA unit tests pass; CI runs green on a five-job gated GitHub Actions pipeline.

The architectural problem it solves is duplication. The same check existed three times, once per framework, and the three copies had silently drifted apart until three of them had become false negatives: one framework passing infrastructure the other two rejected. Detection now lives once in `policies/controls/`, and the framework packages attach citations only. [ADR-001](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE/blob/main/docs/adr/001-two-rail-control-engine.md) records that decision, its one-way-door reversibility class, and what would invalidate it.

The repo went through three external adversarial review rounds, producing 37 documented findings before it was called done. I directed AI-assisted implementation throughout, but owned the architecture decisions and the adversarial review personally. That distinction matters and is the accurate way to describe how this was built, including in interviews.

Stack: Open Policy Agent, Rego, GitHub Actions, PCI DSS v4.0 / SOC 2 / NIST 800-53 control mapping

[View on GitHub →](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE)
