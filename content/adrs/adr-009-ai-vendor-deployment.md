---
title: "ADR 009: AI vendor deployment - ECOA, Reg B, and SR 11-7 compliance"
recordID: "ADR-009"
status: "Accepted"
date: 2026-07-03
summary: "How to deploy third-party AI in consumer lending without creating fair-lending or model-risk exposure."
---

## Context

Consumer lending decisions increasingly use third-party AI models for fraud detection, credit scoring, and document processing. These tools can reduce manual review, but they also introduce fair-lending and model-risk obligations under ECOA, Reg B, and the OCC's SR 11-7 guidance.

The risk is not just that a model is wrong. The risk is that the bank cannot explain why a consumer was declined, cannot prove the model was tested for disparate impact, and cannot produce an audit trail when regulators ask.

## Decision

Use a gated deployment pattern for any AI vendor involved in lending decisions:

- Require the vendor to document model inputs, training data vintage, and known limitations before procurement.
- Run adverse-action testing: for any declined application, the bank must be able to produce the primary factors used in the decision.
- Hold a human review step for any decision where the model confidence score is below a defined threshold or where the applicant requests an appeal.
- Maintain a model inventory with owner, validation date, performance metrics, and retirement criteria.

## Consequences

**Positive:**

- Keeps the bank inside ECOA and Reg B notice requirements.
- Gives the compliance team a repeatable vendor intake checklist.
- Reduces concentration risk by preventing a single black-box model from controlling decisions.

**Negative:**

- Adds time and cost to vendor onboarding.
- Requires staff who can translate model outputs into plain-language adverse-action reasons.
- May reduce the speed advantage that motivated the AI purchase in the first place.

## Compliance mapping

- ECOA / Reg B: adverse action notice and disparate impact monitoring
- SR 11-7: model risk management, validation, and governance
- Fair Credit Reporting Act: permissible purpose and consumer disclosure when credit reports are used

## Status

Accepted. This pattern is applied to the BankVault lending-access architecture.
