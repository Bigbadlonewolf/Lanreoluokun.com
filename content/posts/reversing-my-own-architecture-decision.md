---
title: "I Reversed My Own Architecture Decision in Seven Days"
date: 2026-07-14
draft: false
tags: ["security-architecture", "gcp", "iam", "pam", "decision-making"]
categories: ["essays"]
description: "ADR-001 chose a custom JIT access broker on July 1. ADR-005 killed half of it on July 8. What happened in between, and why the reversal was the point."
---

On July 1 I wrote an architecture decision record choosing to build a custom just-in-time access broker on GCP. On July 8 I wrote another one that killed half of that decision. Seven days.

If you review architectures for a living, that timeline should make you suspicious. A reversal that fast usually means the first decision was careless, or the second one is political. This one was neither, and the difference is worth walking through, because the mechanics of a clean reversal are a skill nobody teaches. You learn it by having to do one in public.

## The original decision

BankVault needed to issue time-bound access grants: a loan underwriter gets a window on one piece of customer data, then loses it automatically. Two paths existed. Buy an enterprise PAM platform (CyberArk, Delinea, BeyondTrust) and configure a GCP connector. Or build a small custom broker on native IAM Conditions, where the grant is a CEL expression Google evaluates on every access attempt.

I chose build, and I still stand by the reasoning. A credential-vaulting abstraction cannot express "read this one object for the next 30 minutes." That's a mechanism mismatch, not a configuration gap. No connector fixes it.

But the ADR's Alternatives section contained one entry that mattered more than I realized when I wrote it. Google's own Privileged Access Manager solved a similar problem and sat in Preview. I recorded a single condition next to it: a real production decision should re-evaluate once it reaches GA.

That sentence was the whole ballgame.

## The trigger fires

PAM reached general availability. The condition I had named was now true, which left me two options.

Option one: quietly ignore it. The custom broker worked. The Terraform applied. The functions passed their tests. Nobody was going to audit my ADR trail and catch the discrepancy.

Option two: actually run the re-evaluation I had promised, knowing it might tell me to delete code I had just written.

It told me to delete code I had just written. PAM's project-level entitlement with a 30-minute maximum duration does exactly what my custom grant-and-revoke lifecycle did, except Google operates it, patches it, and answers for it. Keeping my version meant maintaining code whose only remaining justification was that it already existed. There's a name for that: sunk cost wearing an architecture costume.

So ADR-005 adopted PAM for grant issuance, and ADR-001 got a supersession note instead of a stealth edit.

## What a clean reversal requires

Three things separated this from flip-flopping, and none of them happened during the reversal. They happened a week earlier, when the original decision was written down properly.

First, the trigger condition was named in advance. "Re-evaluate at GA" is checkable. When it fired, the reversal wasn't a mood, it was a contract coming due. If your ADRs never name the conditions under which they die, every reversal looks arbitrary, because it is.

Second, the boundary of the reversal was precise. Build-versus-buy did not get reversed. Enterprise PAM is still the wrong tool for resource-scoped cloud IAM grants, the audit ledger still belongs in BigQuery, and IAM Conditions are still the enforcement primitive. Only the grant-issuance mechanism changed hands. ADR-001 now carries a table saying exactly which sections stand and which fell. A reversal without a boundary takes the whole decision's credibility down with it.

Third, the cost was stated instead of absorbed. Adopting managed PAM traded away control I actually had. My custom broker owned its revocation triggers. PAM's behavior when an auto-expiry silently fails is undocumented, and my mitigation is a reconciliation job that flags overruns without revoking anything. That means the honest claim is "detected within about 45 minutes," not "contained." Those are different sentences. Writing the weaker, truer one into the ADR cost me nothing today and saves me an ugly conversation in every future review.

## The part that stings

Here's what I'd rather not admit: if PAM had gone GA two weeks earlier, I would never have built the custom lifecycle at all, and the portfolio would be one project thinner and one lesson lighter.

The code I deleted was good code. The tests passed. The CEL conditions attached correctly, which is harder than it sounds, because conditional bindings silently fail to attach unless you request IAM policy version 3 explicitly, and nothing warns you. I learned that the expensive way, and the knowledge survives even though the code didn't.

That's the actual return on building it: not the broker, the calibration. I now know precisely where the seams are in GCP's grant lifecycle, because I implemented one before handing the job to Google. When PAM does something surprising at an entitlement boundary, I'll have a mental model instead of a support ticket.

## The takeaway

Write the exit condition into the decision on the day you make it. Not "we'll revisit this later." A specific, checkable trigger: when X ships, when volume passes Y, when the vendor's roadmap does Z. It costs one sentence.

Then, when the trigger fires, honor it in public. Mark the old decision superseded, draw the boundary of what actually changed, and price the reversal honestly, including the parts where the new answer is worse.

A decision log where nothing ever gets reversed isn't evidence of good judgment. It's evidence nobody's checking the triggers.

---

The full trail: [ADR-001 with its supersession note](/posts/adr-001-build-vs-buy-jit-broker/) and [ADR-005, the decision that replaced it](/posts/adr-005-pam-grant-revocation-lifecycle/).
