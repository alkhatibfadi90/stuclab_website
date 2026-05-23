---
slug: accidental-torsion-as1170-4
title: "Accidental Torsion: The Load Case Your Symmetric Building Still Needs"
date: "2026-06-13"
excerpt: "Your plan is symmetric, the centre of mass sits on the centre of rigidity, so torsion is zero — right? AS 1170.4 disagrees, and the eccentricity it makes you carry lands hardest on the corner elements you were least worried about."
tags: [seismic, etabs, methodology]
readingTime: "8 min read"
seoTitle: "Accidental Torsion in AS 1170.4 — Why Symmetric Buildings Still Twist"
seoDescription: "How AS 1170.4 handles accidental torsion with the 0.1b eccentricity, why it differs from US codes, how it loads corner elements, and how to apply it correctly in ETABS."
ogImage: /og-image.svg
---

There's a comfortable assumption that a symmetric building doesn't have a torsion problem. Centre of mass over centre of rigidity, no eccentricity, no twist, move on. It's wrong, and AS 1170.4 makes it wrong on purpose — the standard forces you to design for a torsion that your perfectly balanced model says doesn't exist.

That's accidental torsion, and the reasoning behind it is sound: no real building is as symmetric as its model. Mass gets distributed unevenly by occupancy and fit-out, stiffness varies with material scatter and cracking, and the seismic input itself has a rotational component. The code's response is to assume the centre of mass isn't where you drew it, and to make you check the consequences.

## What AS 1170.4 actually requires

The Australian approach is a flat, up-front eccentricity. The earthquake actions are applied at a position **±0.1b** from the nominal centre of mass, where b is the plan dimension of the structure at right angles to the direction of the action. That eccentricity is applied in the same direction at all levels, and oriented to produce the most adverse torsional moment.

Two features of this are worth dwelling on because they're where the practical mistakes happen.

First, the eccentricity is **±** — you apply it both ways. Shifting the mass in one direction loads one side of the building; shifting it the other way loads the opposite side. You can't pick the convenient one. For each direction of earthquake action, both eccentricity positions have to be checked, and the resisting elements designed for the worse of the two.

Second, this combines with the **100%/30% orthogonal rule**. Earthquake doesn't politely align with your grid, so you take the full action in one direction acting with a fraction in the orthogonal direction, and the accidental eccentricity is applied to produce the most adverse combined effect. The number of permutations multiplies quickly — direction, sign of eccentricity, orthogonal pairing — which is exactly why this is a load-case bookkeeping problem as much as an engineering one.

The action effects from torsion are then combined with the translational action effects by direct summation, with signs chosen to produce the most adverse result in each resisting member. There's no statistical combination that lets the torsion partly cancel — it stacks.

## Why AS differs from the US codes, and why it matters

If you've worked to ASCE 7, the AS approach will feel different, and importing the US habits is a real source of error.

ASCE 7 uses a smaller base accidental eccentricity (5% of the plan dimension) but then, for torsionally irregular buildings under the equivalent static procedure, multiplies it by a torsional amplification factor — the well-known Ax, which can climb up to 3. AS 1170.4 doesn't do this. It uses the larger 0.1b eccentricity flat, with no equivalent amplification factor on top.

The practical upshot: **don't go looking for an Ax factor in AS 1170.4, and don't bolt one on out of ASCE habit.** The 0.1b is the Australian answer in full. For a symmetric building this is actually more conservative than the ASCE 5%-then-amplify approach — the comparison work done when the code was revised noted a significant effective doubling of the accidental torsional moment for symmetric buildings relative to the older basis. For strongly asymmetric buildings the two codes' torsional effects correlate more closely. Either way, the AS method is a single flat eccentricity, and treating it as "5% plus amplification" or "10% plus amplification" is over-engineering at best and a misread of the standard at worst.

## Where the load actually goes — the corner element problem

Accidental torsion is easy to dismiss because the eccentricity looks small. The reason it bites is leverage.

A torsional moment about the building's vertical axis is resisted by the in-plane forces in the lateral elements, and those forces scale with distance from the centre of rigidity. The elements furthest from the centre — the corner columns, the perimeter walls at the ends of the plan, the far edges of the floor plate — pick up the largest additional demand from the twist. The closer an element is to the centre of rigidity, the less the torsion touches it.

So accidental torsion is, in practice, a **corner and perimeter element** load case. On a building with its lateral system concentrated in a central core, the torsional resistance comes from the core's torsional stiffness and from whatever perimeter elements engage — and the accidental eccentricity can drive meaningful additional shear and axial demand into perimeter columns that the pure translational analysis treated as lightly loaded. The engineer who sizes the corner columns off the symmetric, no-torsion case and never revisits them under the accidental torsion combinations is the one who gets caught.

This is also why building plan shape and aspect ratio matter. A long, narrow plan has its extreme elements a long way from the centre, so the same rotation translates into larger edge displacements and forces. A torsionally flexible building — one without enough perimeter lateral stiffness to resist the twist — amplifies all of this, which is the deeper reason a torsion-first fundamental mode is a layout red flag rather than something to design around.

## Getting it right in ETABS

The mechanics of applying accidental torsion depend on the analysis type, and ETABS handles them differently.

For **equivalent static** analysis, ETABS applies the storey forces at a diaphragm eccentricity of ±0.1b, and you generate the load cases for the eccentricity signs and the orthogonal combinations. The diaphragm has to be assigned for this to work — the eccentric force needs a diaphragm to act on.

For **response spectrum** analysis, there are two accepted routes, and CSI supports both:

- **The static torsion approach** — a torsional moment is computed from the response-spectrum storey forces multiplied by the specified eccentricity, then applied as a static Mz to each diaphragm level and combined with the dynamic translational results. This is a static approximation layered onto the dynamic analysis.
- **The mass-shift (dynamic) approach** — the floor mass is physically offset by the required eccentricity, which changes the model's stiffness matrix and dynamic properties and captures the torsion directly in the dynamic run. ETABS automates this for recent versions. The trade-off is that shifting mass alters the building's modal characteristics, so it's a different (and arguably more rigorous) representation than the static add-on.

A couple of practical cautions. The accidental torsion load cases are easy to under-build — it's common to see a model with one eccentricity sign checked and the orthogonal permutations skipped, which quietly misses the governing case for some corner elements. And whichever response-spectrum route you take, be consistent: don't mix a mass-shift model with a separately added static torsion moment, or you'll double-count.

## What this means in practice

Accidental torsion is not an exotic load case for irregular buildings — it's a mandatory one for every building, including the symmetric ones your model says have zero eccentricity. AS 1170.4 makes you carry a flat ±0.1b eccentricity, both signs, combined with the 100%/30% orthogonal actions and summed directly with the translational effects. No amplification factor, because the flat 0.1b already is the allowance.

The discipline is in two places. The bookkeeping — generating and tracking the full set of eccentricity-and-orthogonal permutations so the genuinely governing combination isn't the one you skipped. And the design check — going back to the corner columns and perimeter elements, the ones farthest from the centre of rigidity, and confirming they're sized for the torsional demand rather than the comfortable symmetric result.

The building doesn't know it's symmetric. The code assumes it isn't, the corner elements feel the difference, and the only question is whether your load combinations did the work to find out.
