---
title: "Cloud Risk Notes"
date: 2026-07-04
summary: "Note 001 — AI vendor deployment in regulated lending: a governance-first look at deployment models, liability gaps, and three questions worth asking in the next vendor review."
status: "Note"
---

## Note 001 — AI Vendor Deployment in Regulated Lending

A pattern from evaluating one third-party AI deployment

Here is a scenario every regional bank evaluating AI-powered credit decisioning will eventually face. The vendor demo is polished, the accuracy numbers look good, the business case is signed off — and then someone in compliance asks who owns the bias risk if the vendor won't share the training data. The room goes quiet, because this isn't a technology question. It's a governance sequencing question, and most banks get the sequence wrong.

### The setup

Say a bank is choosing between three deployment models for a vendor's AI credit tool, evaluated against ECOA (fair lending) and SR 11-7/OCC 2011-12 (model risk management):

**Fully managed SaaS** puts operational burden on the vendor but leaves the bank holding regulatory liability with no visibility into model drift.

**Containerized on-premise** gives the bank control, but assumes an MLOps capability most mid-size institutions don't have.

**A hybrid API integration** looks like a reasonable middle ground until you trace where applicant PII actually goes during inference — it crosses into the vendor's environment, which can trigger state privacy law obligations the vendor's DPA never anticipated.

### Where banks go wrong

The typical instinct is to optimize for deployment speed: pick the SaaS option, get to six weeks, schedule compliance review for week five. That's backwards. In regulated lending, compliance isn't a gate at the end of the project — it's the foundation the architecture gets built on. The right order is governance first, integration pattern second, infrastructure last.

A common mistake at this stage is treating model bias as something to monitor after deployment. It isn't. If you can't inspect the training data, you can't validate fairness before the model touches a single applicant.

### Three non-negotiables

A governance layer for this kind of deployment needs at minimum:

1. **Pre-deployment attestation** — third-party fairness audit documentation, not the vendor's internal metrics.

2. **A shadow period** — the model runs parallel to human underwriters for 90 days with full outcome logging before any automated decisioning goes live.

3. **A kill switch** — a governance-triggered deactivation that doesn't require an engineering escalation to execute.

Run the three deployment models against these three requirements and the SaaS option fails the shadow period and kill switch tests without custom engineering the vendor is unlikely to commit to. The hybrid model fails attestation because the DPA gap can't be closed. On-premise is the only option that clears all three — which means the real decision isn't which vendor model to pick. It's whether the bank is willing to delay deployment long enough to build the MLOps competence that safe adoption requires.

### Where the pragmatic option usually fails

Teams tend to reach for the hybrid model first because it looks like the reasonable compromise. It rarely survives scrutiny. "Pragmatic" in this context usually just means the liability hasn't been traced yet — the DPA gap doesn't show up until someone follows the data flow past the API boundary and asks which state's privacy law applies once applicant PII lands in the vendor's environment.

I reached for the hybrid model first too. It took a second pass to see that "pragmatic" was just a word for liability I hadn't traced yet.

### Three questions worth asking in your next vendor review

1. **Can you deactivate this system in under 24 hours without filing a ticket?** If the answer involves a sprint plan, you don't have a kill switch — you have a wish.

2. **Where does applicant data live during inference, and whose privacy laws apply?** Most DPAs stop at a border that data doesn't respect.

3. **What would you show an examiner to prove this model doesn't discriminate?** "The vendor said so" isn't evidence. An independent audit is.

### Closing

AI vendor deployment in lending isn't a procurement decision wearing technical language. It's a risk architecture decision that happens to involve software. The banks that get this right won't be the ones with the best models — they'll be the ones willing to say no to models they can't defend under audit.

---

### For Technical Readers

The full trade-off analysis, including the alternatives table and consequence mapping, is documented in ADR-001.

---

Lanre Oluokun  
Cloud Security Architect · CISSP · CCSP · CISM · ISSAP · GCP-PCA  
New York, NY
