---
slug: etabs-rigid-vs-semi-rigid-diaphragm
title: "Rigid vs Semi-Rigid Diaphragm in ETABS: When the Rigid Assumption Hides a Real Problem"
date: "2026-10-20"
excerpt: "Rigid isn't a modelling convenience, it's a physical claim that the floor cannot deform in its own plane. On some buildings that claim is false, and the rigid model doesn't warn you. It moves load to the wrong elements and hides the forces that would have told you."
tags: [analysis-modelling, seismic-wind]
readingTime: "5 min read"
seoTitle: "Rigid vs Semi-Rigid Diaphragm in ETABS: When Rigid Is Wrong"
seoDescription: "What rigid and semi-rigid diaphragms actually do in ETABS, the four plan conditions where the rigid assumption is unconservative, why only semi-rigid reports chord and collector forces, and the 10% test."
ogImage: /og-image.svg
---

Most engineers assign a rigid diaphragm by default and never revisit it. For a thick concrete slab on a compact plan with walls spread evenly, that's fine, and it runs faster. The trouble is that rigid isn't a modelling convenience, it's a physical claim: that the floor cannot deform in its own plane. On some buildings that claim is false, and when it's false the rigid model doesn't warn you. It quietly moves load to the wrong elements and hides the forces that would have told you.

![Plan of a long narrow floor plate under lateral load, rigid versus semi-rigid: rigid translates as one block with zero in-plane force, semi-rigid bows in-plane with chord and collector forces; below, the four plan conditions where rigid is false and the 10% test](/posts/rigid-vs-semirigid.svg)

## What the two actually do

| | Rigid | Semi-rigid |
|---|---|---|
| In-plane stiffness | Infinite; every node on the floor moves together | The slab's real stiffness, from the shell elements |
| Run time | Fast; the stiffness matrix condenses | Slower; nothing condenses |
| Load distribution | By the stiffness of the vertical elements only | By vertical elements and the slab, together |
| In-plane forces | Not reported; beams show zero axial force | Chord, shear and collector forces available |
| Accidental eccentricity | Applied at the centre of mass | Applied at every node |

The last two rows are the ones that matter. A rigid diaphragm cannot show you a chord force or a collector force, because it has assumed the slab is infinitely stiff and therefore carries them without strain. If you need those forces for design, rigid isn't a simplification, it's a blindfold.

## Where rigid is a false claim

The assumption holds when the slab is much stiffer in-plane than the lateral system it's spanning between. It breaks when it isn't:

- **Long, narrow floor plates** with stiff walls at the ends. Above an aspect ratio of about 3, the slab bows in-plane between the walls like a deep beam. Rigid sends the load straight to the end walls; the real slab deflects, and the elements along the length pick up more than the model says.
- **Large openings.** Lift cores and stair voids cut the diaphragm into sub-diaphragms. The force has to route around the opening through collectors; rigid pretends the hole isn't there.
- **Transfer and podium levels.** Where a tower's lateral system changes to the podium's, the slab carries the full shear transfer in-plane. That's the one floor where the in-plane forces govern, and rigid reports none of them.
- **Irregular plans and re-entrant corners.** The diaphragm behaviour is the problem; assuming it away removes the problem from the model, not the building.

In every one of these, rigid over-shares load to the stiff elements and under-loads the flexible ones. The design passes. The building is loaded differently from the model.

## The test, and the mesh

You don't have to guess. Run the floor both ways and compare storey drifts and element forces. If they agree within about 10%, rigid is a fair simplification for that building and you can keep the speed. If they diverge, the slab's flexibility matters and the semi-rigid model is the real one.

Semi-rigid is only as good as its mesh, though. Start with elements around a tenth of the diaphragm span, refine until the critical results stop moving, and make sure the slab shells share nodes with the walls and columns. A mesh that doesn't connect to the vertical elements gives a diaphragm that looks stiff while the wall beneath it floats with no load.

## What this means in practice

Rigid is the right default for a compact, thick-slab building with walls spread across the plan. Treat it as a hypothesis everywhere else. If the plate is long, holed, a transfer level, or irregular, run semi-rigid, compare, and keep whichever the comparison justifies. And if you need chord or collector forces for the design, there's no choice to make: only the semi-rigid model can give them to you.

The rigid diaphragm never produces an error. It produces a clean, fast result on a floor that may not be able to do what the model assumed. Checking is a second run. Not checking is an assumption carried into the design.

*The above reflects general modelling practice for educational purposes; diaphragm modelling on any specific project remains a matter of engineering judgement against the relevant standards.*
