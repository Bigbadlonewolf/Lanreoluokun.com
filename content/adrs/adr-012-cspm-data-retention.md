---
title: "ADR 012: CSPM data retention - Cloud Logging vs. BigQuery cost and risk trade-off"
recordID: "ADR-012"
status: "Accepted"
date: 2026-07-03
summary: "How long to keep CSPM findings and where, balancing cost, query speed, and regulatory evidence needs."
---

## Context

Cloud Security Posture Management produces a steady stream of findings. Keeping everything in hot storage is expensive. Deleting findings too quickly removes evidence that auditors and incident responders may need later.

The two main storage options are Cloud Logging buckets and BigQuery. Cloud Logging is cheaper for raw logs but harder to query for trend analysis. BigQuery is more expensive per stored gigabyte but supports SQL analytics and long-term partitioning.

## Decision

Use a two-tier retention model:

- Raw finding events live in Cloud Logging for 90 days. This covers incident response and short-term alerting.
- A daily summary of findings is streamed to a partitioned BigQuery table with a one-year retention policy. This supports trend analysis, board reporting, and audit sampling.
- Findings older than one year are archived to Cloud Storage Nearline unless a specific regulatory obligation requires longer retention.

## Consequences

**Positive:**

- Hot query costs stay low because only summaries go to BigQuery.
- Long-term evidence is preserved in cheap object storage.
- The model aligns with PCI DSS log-retention expectations.

**Negative:**

- Reconstructing a historical incident from archived files is slower than querying BigQuery.
- The export pipeline must be monitored; if it breaks, audit evidence gaps silently.
- Retention policies need periodic review against changing regulator expectations.

## Compliance mapping

- PCI DSS v4.0 Requirement 10.5: log retention
- SOC 2 CC7.2: monitoring and review
- NIST 800-53 AU-11: audit record retention

## Status

Accepted. Applied to the CSPM Dashboard project.
