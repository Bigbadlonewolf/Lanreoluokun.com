---
title: "The real cost of compliance-as-code: when policy tests pass but auditors fail"
date: 2026-07-03
summary: "Passing OPA tests is a prerequisite, not a guarantee that an auditor will accept the control."
---

I spent time mapping PCI DSS, SOC 2, and NIST 800-53 controls to OPA/Rego policies and getting every unit test to pass. That is a useful exercise. It is not the same as being audit-ready.

A policy can return zero violations on a Terraform plan and still miss the point. For example, a rule that checks whether a bucket is public does not prove the bank has a process to review bucket IAM quarterly. A rule that flags missing encryption does not document who owns the key rotation procedure. Regulators care about the control, the evidence, and the owner. Code alone supplies none of those.

The gap shows up in two places. First, policy libraries get out of sync with control documents. Second, engineers celebrate the green build and skip the narrative that explains what the test means to an auditor.

My fix is to keep the tests but pair each policy with a short control statement: which requirement it maps to, what evidence it produces, and who reviews exceptions. Compliance-as-code is faster than manual review, but it only holds up if the human-readable story stays attached.
