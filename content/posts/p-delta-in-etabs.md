---
slug: p-delta-in-etabs
title: "P-Delta in ETABS: What the Setting Actually Does, and When It Bites"
date: "2026-06-06"
excerpt: "Ticking the P-delta box doesn't mean you've captured second-order effects. ETABS handles one half of the problem at the global level and leaves the other half to member design — and the gap is where people get caught."
tags: [etabs, methodology, high-rise]
readingTime: "8 min read"
seoTitle: "P-Delta in ETABS — What It Captures and What It Misses"
seoDescription: "P-Delta vs P-delta, the two ETABS setup methods, the single-stiffness-matrix consequence, and when second-order effects actually govern. A practical guide."
ogImage: /og-image.svg
---

"Did you turn on P-delta?" is one of those questions that gets a yes far more often than it deserves. The box is ticked, the model runs, and everyone moves on assuming second-order effects are handled. They're usually half-handled, because ETABS's global P-delta analysis captures one of the two second-order mechanisms and quietly leaves the other to your member design — and if you don't know which is which, you've got a gap.

This is worth getting straight, because P-delta is both over-applied (switched on for buildings where it changes nothing and just slows the run) and under-understood (switched on without realising what it doesn't cover).

## Two effects with confusingly similar names

Second-order behaviour comes in two flavours, and the naming is genuinely a trap:

- **P-Δ ("big delta")** is the effect of gravity load acting through the *displacement of the member ends* — the storey-level sway of the building. This is the global, structure-level effect: the whole frame leans, gravity load rides along on the leaned shape, and that adds overturning and drift.
- **P-δ ("small delta")** is the effect of axial load acting through the *local curvature of a member between its end nodes* — the bow in an individual column along its length.

They're physically linked — an increase in one feeds the other — but they're captured by completely different parts of your workflow. ETABS's global P-delta analysis is fundamentally a P-Δ tool. The P-δ effect along a member's length is generally **not** captured by a standard single-step building P-delta analysis, and it falls to the member design stage to account for it. That single fact is behind most of the confusion.

## What the ETABS setting actually does

When you set up P-delta in ETABS through the P-Delta Options, you're typically defining an *initial* P-delta state: the program forms the geometric stiffness from one set of gravity loads, then uses that single modified stiffness matrix for the subsequent linear analyses — the static lateral cases, the response spectrum, the time history. CSI is explicit that the same stiffness is used across all those cases.

That has a consequence people miss: the P-delta effect is based on **one** gravity load state, not on each individual load combination's actual axial loads. You pick a representative gravity case to set the geometric stiffness, and every lateral result inherits it. This is a reasonable and code-accepted simplification for the sway P-Δ effect, but it's a simplification, and it's why the choice of that gravity load combination matters.

ETABS gives you two ways to define the P-delta load:

| Method | How it works | When to use it |
|---|---|---|
| Non-iterative, based on mass | Computes the destabilising load story-by-story from the mass at each level; treats the building as a simplified stick model with a rigid diaphragm per floor | Fast, no iteration; useful when load cases don't carry explicit gravity. Less effective at capturing local buckling, and leans on the rigid-diaphragm idealisation |
| Iterative, based on load cases | Computes the load from a specified combination of static cases — the "P-delta load combination" — and iterates to convergence | CSI's general recommendation when gravity load is explicitly specified; more representative of the actual loaded state |

CSI's own guidance is to prefer the iterative load-case method when you have gravity load defined, and to reserve the mass-based method for cases where gravity isn't otherwise specified.

## The gravity combination to use

For the P-delta load combination itself, the destabilising effect is governed by the *total* gravity load present during sway — and crucially, P-delta is driven by the unfactored physical gravity on the structure, not by the lateral load factors. A combination along the lines of full dead plus a realistic fraction of live (CSI notes 1.2DL + 0.5LL is typically conservative for the overall sway P-Δ effect) sets the geometric stiffness sensibly. The logic is that you want the gravity load that's actually sitting on the building while it sways, generating the secondary moments.

What you should *not* do is set the P-delta gravity load too low and quietly under-state the effect, or conflate the P-delta load combination with the lateral design combinations. They're separate ideas: one sets the geometric stiffness, the others ride on top of it.

## When P-delta actually matters — and when it's noise

P-delta isn't a virtue you switch on to be safe; it's an effect that's either significant or it isn't, and the codes give you a way to tell.

The governing concept is the **stability index** (the stability coefficient — Q in ACI terms, θ in ASCE 7 terms, and handled through the stability index and slenderness provisions in AS 3600). It's essentially the ratio of the secondary moment from P-delta to the primary moment from the lateral load at a storey. The widely used thresholds:

- When the stability index is **below about 0.10**, P-delta effects are small enough to ignore.
- In the **intermediate range** (roughly 0.10 to 0.25–0.40 depending on the code), they're real and must be accounted for — either through a second-order analysis or by amplifying the first-order results.
- **Above the upper limit**, the structure is too flexible relative to its gravity load and should be stiffened — the secondary-to-primary moment ratio is running away, which is a sign of approaching instability, not a problem you amplify your way out of.

This is why P-delta "bites" specifically on tall, flexible, or heavily loaded structures: those are exactly the ones with a high gravity-to-stiffness ratio and therefore a high stability index. A stocky low-rise braced building can have P-delta switched on and see essentially no change — the index is tiny. Run time goes up, results don't move. Conversely, a slender moment-frame tower can have a stability index well into the range where ignoring P-delta materially under-states drift and member moments.

## The trap: global P-Δ on, member P-δ forgotten

Here's where the half-handled problem comes home. You run ETABS with P-delta on, the sway P-Δ effect is captured at the global level, drifts and storey moments are amplified correctly. Good. But the P-δ effect — the magnification along an individual slender column between its nodes — is generally not in that result.

AS 3600 deals with this through its slenderness and moment-magnification framework: for a sway frame, the column moments are amplified once for the sway (P-Δ) effect and again for the member-curvature (P-δ) effect; for a braced (non-sway) frame, only the member-curvature magnification applies. If your ETABS analysis has handled the sway component, you still have to ensure the member-length magnification is covered in the column design — either by the design module applying the appropriate magnifier, or by checking it explicitly. Assume the global P-delta run did everything and you can leave slender columns under-designed for their own curvature effect.

The cleaner way to think about it: the global analysis tells you what forces arrive at the member ends, including sway second-order effects. Member design then has to decide whether that member, given its slenderness and end conditions, needs further magnification along its length. Two separate checks, and the model only does the first one.

## What this means in practice

P-delta in ETABS is a P-Δ (sway) tool that runs on a single geometric stiffness derived from one gravity load state. That's the right tool for the storey-level second-order effect, and the iterative load-case method with a sensible full-dead-plus-part-live combination is the setup to reach for when gravity is defined.

But three things have to stay in your head:

1. **Decide whether you even need it.** Check the stability index. Below ~0.10 it's noise; switching it on just costs run time. The interesting buildings are the flexible, tall, heavily loaded ones where the index climbs.
2. **It's based on one gravity state, applied to every lateral case.** That's a code-accepted simplification — know that it is one, and pick the gravity combination deliberately.
3. **The global run does P-Δ, not P-δ.** Member-length magnification for slender columns is a separate design check under AS 3600. The ticked box did not do it for you.

The engineers who get caught aren't the ones who forgot to switch P-delta on. They're the ones who switched it on, saw amplified drifts, and assumed every second-order effect in the building was now accounted for. The model captured the sway. Whether your slender columns are safe along their length is still your problem.
