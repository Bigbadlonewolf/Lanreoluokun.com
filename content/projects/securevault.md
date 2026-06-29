---
title: "SecureVault"
recordID: "PRJ-002"
status: "In Review"
date: 2026-05-12
summary: "Event-driven, alert-only GCP misconfiguration detection — three checks, currently blocked on a trigger-source redesign."
---

An event-driven, alert-only detection system for three named GCP misconfiguration classes: publicly exposed Cloud Storage buckets, overpermissive IAM service account keys, and unrestricted firewall rules. SendGrid handles alert delivery; Terraform and Cloud Functions v2 are scaffolded and ready to deploy.

The project is currently blocked at deployment, not design: my GCP account has no Organization resource, which the originally specified Security Command Center → Pub/Sub trigger requires. See [ADR 001](/adrs/adr-001-trigger-source/) for the redesign decision in progress — Cloud Scheduler polling against the SCC `findings.list` API versus standing up a real Cloud Identity organization.

**Stack:** GCP (SCC, IAM, Cloud Storage, VPC Firewall), Terraform, Cloud Functions v2, SendGrid, Pub/Sub

[View on GitHub →](https://github.com/Bigbadlonewolf)
