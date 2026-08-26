---
title: "ISSAP Scenario 2: Proving Deletion on Storage You Do Not Own"
recordID: "ISSAP-02"
status: "Study scenario"
date: 2026-08-26
summary: "A bank must decommission regulated customer records held in multi-tenant public-cloud storage. The regulator's question is not 'did you delete it'. It is 'prove the data is gone'. Cryptographic erasure, and the timing trap that makes it impossible to retrofit."
description: "Cryptographic erasure as a disposal control: why the key has to be customer-managed, why key scoping decides erasure granularity, and why the architecture has to exist before the data lands."
---

## The scenario

A bank must decommission a dataset of regulated customer records held in a multi-tenant public-cloud storage service. An engineer proposes deleting the files and asking the provider to wipe the disks.

## Context

The regulator's question is not "did you delete it". It is "prove the data is gone".

Two problems with the proposal. Logical deletion does not destroy data, it removes pointers. And the bank cannot physically destroy media it does not own, sitting in a shared array alongside other tenants' data.

## Decision

Cryptographic erasure.

The dataset is encrypted under a dedicated, customer-managed key held outside the provider's unilateral reach. Destroying that key renders the ciphertext permanently unrecoverable, whatever residual bits persist on the provider's media.

Then do the part people skip. Document the key-destruction event with evidence, and record it in the data-lifecycle and disposal log. The regulator's question gets answered with evidence instead of assertion.

## Alternatives considered

**Logical deletion plus a provider wipe request.** Rejected. Unverifiable, and the bank controls neither the media nor the wipe.

**Provider-managed encryption with key deletion.** Rejected. If the provider can recover or rotate the key on its own, the erasure is the provider's promise, not the bank's control. The key has to be customer-managed and held outside the provider's reach before the proof belongs to the bank.

## Consequences

Disposal becomes provable, which is the whole point.

The catch is timing. The key architecture has to exist before the data is written. You cannot retrofit cryptographic erasure onto a dataset that was encrypted under a provider-managed key, or worse, never encrypted at all.

Key management also stops being only a confidentiality control and becomes a disposal control. That changes how you scope keys in the first place: one key per dataset or per data category, not one key for the whole estate, or your erasure granularity is wrong and destroying a key takes out far more than the dataset you meant to retire.

## What I would verify in a real engagement

Key custody first. Who can reach the key, under what conditions, and whether the provider's administrative plane can touch it at all.

Then the evidence chain for the destruction event: what gets logged, who signs it, where it is retained. This is the same evidence-over-assertion discipline behind my [compliance-as-code work](https://github.com/Bigbadlonewolf/COMPLIANCE_AS_CODE). A control that cannot produce evidence is a claim, not a control.

## The principle

Disposal, key management as a disposal control, and evidence over assertion. Domain reference 1.3.3.

---

*This is a study scenario drawn from ISSAP certification material, written up in my own words as analysis. It is not a client engagement and it does not describe work I delivered for an employer. Domain references are to the ISSAP certification outline.*
