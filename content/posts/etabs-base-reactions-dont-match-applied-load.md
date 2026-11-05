---
slug: "etabs-base-reactions-dont-match-applied-load"
title: "ETABS Base Reactions Don't Match Your Applied Load? Where the Force Went"
date: "2026-11-16"
excerpt: "The force is almost never lost. It's at a restraint you didn't sum, a moment about a point you didn't choose, a mass defined differently from the load, or a floor that never got loaded. Six places to look, and the one check that settles it."
tags: ["analysis-modelling", "seismic-wind"]
readingTime: "5 min read"
seoTitle: "ETABS Base Reactions Don't Match Applied Load: Six Places the Force Went | StrucLab"
seoDescription: "Why ETABS base reactions differ from your hand sum: restraints above Base, moments about the global origin, mass source vs load pattern, signless response spectrum results, floors without diaphragms, and how to use the analysis log force balance."
ogImage: "/og-image.svg"
---

You add up the gravity load by hand, pull the Base Reactions table, and the numbers don't agree. Or the seismic base shear is 15% under what the coefficient times the weight should give. Or the sum of the column shears at the base is nowhere near the base reaction for the spectrum case. The first instinct is that the model is wrong. Usually it isn't. Usually the force is exactly where ETABS put it, and the mismatch is between what you summed and what the table reports.

Here are the six places it goes, roughly in the order they catch people.

![Building section with numbered callouts showing where base reaction mismatches come from: restraints above Base, moment about the global origin, excluded base-level mass, a floor with no diaphragm receiving no wind, and the equilibrium ledger the analysis log checks](/posts/base-reactions-where-force-went.svg)

## 1. It's sitting at a restraint you weren't counting

The Base Reactions table is the resultant of every joint reaction in the model: every restrained joint, every point spring, every line and area spring, on every level. If you have basement walls restrained laterally at each slab, a retained podium, or a ground floor pinned to a stiff element that isn't at the Base storey, those reactions are in the table and not in your base-level sum. One real case: joint reactions summed at Base gave 15,000 kN; the table said 23,000 kN; the other 8,000 kN was in the walls above. Both numbers were right. Only one was the total.

## 2. The moment is about the wrong point

Base forces don't depend on where you take them. Base moments do. The table reports moments about the global origin unless you set a different location, so if your origin is at a corner grid, the reported moment is not the overturning moment about the base centroid and won't match your hand number or your storey-plot overturning curve. Set the location, or compute the overturning moment from storey shears and heights and leave the base moment alone.

## 3. The seismic force came from the mass source, not the load pattern

Equivalent static base shear is coefficient times seismic weight, and seismic weight is whatever the mass source says, not what the dead-load pattern sums to. Three things drive the gap. Mass at the restrained base level is excluded, so the bottom half-storey of columns and walls never counts. Element self-mass plus a load pattern that also carries a self-weight multiplier of one double-counts the structure. And a mass source that forgot superimposed dead or the sustained fraction of live load under-counts it. Reconcile against the Mass Summary by Story table, converted back to weight, not against a load combination of the same patterns. Those are different quantities.

## 4. It's a signless number

A response spectrum case gives you a CQC or SRSS magnitude. The base reaction is positive by construction and so is every member force, each at its own peak, at a different instant. Summing column and wall shears at the base will not reproduce the base reaction, and the gap is not an error. If you want a base shear for scaling, use the Storey Forces table for the lowest storey. If you want member forces that sum, you need a static case.

## 5. The wind never got applied

Auto wind from diaphragm extents only loads floors that have a diaphragm assigned. A plant level, a mezzanine, a transfer floor you left without one, or a storey where the diaphragm got dropped during an edit, receives no wind at all. The base shear comes in short and nothing warns you. Check the Auto Wind Loads table storey by storey, and if a level is missing, that's the gap.

## 6. The check that actually settles it

Stop summing joints. Open the last analysis run log. ETABS computes a global force balance for every static, modal, spectrum and combination case: applied loads, inertial loads, spring forces, link forces, reactions, constraint forces and P-delta forces, all resolved at the origin, with a relative error for each of the six components. If that error is tiny, the model is in equilibrium and the force went somewhere you didn't look. If it isn't, you have a real problem, usually a numerical instability, and the log will say so on the same page. One thing to know: the balance is not computed for time-history cases, so those need a different check.

## What this means in practice

A mismatch between applied load and base reaction is almost never lost force. It is force at a support you didn't sum, a moment about a point you didn't choose, a mass you defined differently from the load, a signless quantity you tried to add, or a floor that never got loaded. Run the force balance first. Then build a one-pattern test case, a single unit load on one column, and watch where it goes. Ten minutes of that beats an afternoon of recounting joints.

*The above reflects general modelling principles for educational purposes and the behaviour of the software as documented by CSI; results on any specific project remain a matter of engineering judgement and should be verified against the current version's documentation.*
