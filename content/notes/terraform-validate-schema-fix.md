---
title: "Terraform validate failures in SecureVault"
date: 2026-07-03
summary: "Why `terraform validate` started rejecting `labels` and a misplaced `description`, and how I aligned the Terraform config with the Google provider schema."
status: "Note"
---

After consolidating SecureVault's CI into a single `ci.yml`, the Terraform Plan job failed at the `terraform validate` step. Locally I could reproduce the same errors.

## What failed

`terraform validate` reported three unsupported-argument errors:

- `labels` on `google_compute_network`
- `labels` on `google_service_account`
- `description` inside `google_logging_metric.metric_descriptor`

After fixing those, a second run flagged `labels` on additional Compute resources:

- `google_compute_firewall`
- `google_compute_subnetwork`
- `google_compute_router`
- `google_vpc_access_connector`

## Root cause

The arguments were not exposed by the installed `hashicorp/google` provider schema in this environment. Some resources support `labels`; others do not, and `google_logging_metric` expects `description` at the top level instead of inside `metric_descriptor`.

## The fix

In `terraform/main.tf`:

- Removed `labels` from the six resources that do not accept it.
- Kept `labels` on resources that do accept it (`google_kms_crypto_key`, `google_pubsub_topic`, `google_cloudfunctions2_function`, `google_storage_bucket`, `google_bigquery_dataset`, `google_bigquery_table`, `google_secret_manager_secret`).
- Moved the `description` field for `google_logging_metric` to the resource top level.

## Result

- `terraform validate` passes locally.
- The CI Terraform Plan job can now proceed past validation when GCP credentials are present.
- No infrastructure behavior changed; only metadata/labeling was adjusted.
