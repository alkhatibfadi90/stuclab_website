---
slug: modal-results-that-look-fine
title: "Modal Results That Look Fine and Aren't"
date: "2026-05-23"
excerpt: "The model ran, the periods came out, the building drew a nice mode shape. None of that tells you the dynamics are right. Here are the checks that catch the silent errors before they reach a design report."
tags: [etabs, seismic, methodology]
readingTime: "8 min read"
seoTitle: "ETABS Modal Results: The Checks That Catch Silent Errors"
seoDescription: "Mass source mistakes, torsion-first modes, low participation, eigen vs Ritz — the modal sanity checks that separate a model that ran from a model that's right."
ogImage: /og-image.svg
---

A modal analysis almost never fails loudly. The model solves, ETABS reports a set of periods, the deformed shape animates, and everything looks like a building that's breathing. That's exactly the problem. The errors that matter most in modal analysis don't throw a warning — they sit quietly in the results and feed wrong forces into everything downstream.

The gap between "the model ran" and "the dynamics are right" is bigger than most people check for. Here are the things I look at on every model, in the order that surfaces the biggest problems first.

## Start with the mass source — it's the most common silent error

Before periods, before mode shapes, look at how mass is defined. Get this wrong and every dynamic result is wrong by a consistent factor, which is the worst kind of error because nothing looks obviously off.

ETABS builds mass from the Mass Source definition, and you can assemble it three ways: element self-mass plus specified additional mass, from a set of load patterns, or a combination of both. The classic mistake is in the combination: people tick self-mass *and* include the dead load pattern in the load list, so the structure's self-weight gets counted twice — once from the elements, once from the dead load case. The model runs fine. The mass is just inflated, the periods are too long, and the seismic base shear is wrong.

A few things worth knowing about how ETABS treats this mass, straight from the program's behaviour:

- Only the **global Z component** of the specified loads becomes mass. Loads applied in other directions don't contribute.
- Mass is distributed to joints on a tributary basis, in all three translational directions.
- **Negative mass is not allowed** — if a net uplift makes a joint's mass negative, ETABS sets it to zero rather than warning you. Net uplift situations can therefore quietly drop mass you assumed was there.

The other half of this is *which* loads belong in the seismic mass at all. AS 1170.4 sets the seismic weight as the dead load plus a portion of the live load through the combination factor — not the full live load, and not dead alone. Dumping the full live load into the mass source over-masses the building; using dead only under-masses it. Neither matches the standard. Check the mass source against the seismic weight the code actually asks for before you trust a single period.

A thirty-second habit that saves hours: after the run, read the total seismic mass off the modal results table and hand-check it against the building's floor areas and unit loads. If your total mass doesn't match a back-of-envelope estimate, stop — nothing downstream is worth looking at yet.

## Check the periods against a hand estimate

Once mass is trustworthy, look at the fundamental period. Not for three decimal places of accuracy — for whether it's in the right postcode.

A flexible building has a long period; a stiff one has a short period. If the model's fundamental period is wildly different from what the system and height suggest, something is wrong with stiffness, mass, or connectivity — and it's almost always more useful to find that now than after you've designed members off the forces.

The empirical period formulas in the codes exist precisely for this reconciliation. Compare the model's first-mode period against the code's height-based estimate for the system type. They won't match exactly — the code formulas are deliberately conservative and your cracked-section assumptions move the model period around — but they should be the same order of magnitude. A model period three or four times the code estimate usually means the structure is far more flexible than intended: released connections, walls modelled as membranes with no in-plane stiffness, missing elements, or a diaphragm that isn't tying things together.

## Read the first three modes — and watch for torsion first

The shape of the first few modes tells you whether the building is laid out sensibly.

For a well-conceived building, you want the first two modes to be translational in the two principal directions, with the torsional (rotation about the vertical axis) mode coming later. A quick way to confirm this in ETABS: compare the rotational participation (RZ) against the translational (UX, UY) in the modal participating mass ratio table for the first mode, or just animate modes one, two, and three and watch what the plan does.

If the **first mode is torsional** — the plan twists before it sways — that's a red flag about the layout, not something to design around. It means the centre of rigidity is too far from the centre of mass, or the building simply lacks torsional stiffness. Adding modes or refining the analysis won't fix it; the lateral system needs rebalancing. Torsion-first behaviour is a conceptual problem dressed up as an analysis output, and chasing it with more modelling effort is wasted time.

One practical note: ETABS needs a rigid diaphragm to report a clean centre of mass and centre of rigidity. A common workflow is to run with rigid diaphragms to check CM/CR and the torsional behaviour, then switch to semi-rigid for the final analysis and design.

## Confirm you've captured enough mass

The participation check is the one most people know about and still get caught by. The convention, carried in the major seismic codes, is to include enough modes to capture at least about 90% of the participating mass in each principal direction. Below that, you're missing real dynamic response and your forces are unconservative.

When participation stalls well below 90% no matter how many modes you add, it's usually one of two things:

- **Local modes eating the mode count.** Disconnected or poorly meshed elements vibrate on their own, so ETABS spends modes on bits of structure flapping in isolation instead of the building swaying. Animate the deformed shape under the early modes — rogue local modes are obvious once you look. Tightening connectivity and meshing usually clears it.
- **Genuine torsional flexibility or large eccentricity**, where mixed translational-torsional modes dominate and mass comes in slowly. Here, more modes is treating the symptom; the real answer is more torsional stiffness.

Either way, the fix is rarely "just add modes until it passes." The participation shortfall is telling you something about the model or the building.

## Eigen or Ritz — know which question you're answering

ETABS gives you two ways to extract modes, and the choice isn't arbitrary.

Per CSI's own guidance, eigenvector analysis finds the true undamped free-vibration modes and frequencies, which give the best insight into how the structure actually behaves — useful for checking the model and spotting problems, and the natural choice when you care about the real dynamic characteristics. Ritz vectors instead find modes excited by a specific loading pattern, and for response-spectrum and time-history analysis based on modal superposition they're often the better basis: for the same number of modes they deliver better participation, run faster for the same accuracy, and automatically account for missing-mass (residual-mass) effects that eigen analysis can leave out at the high-frequency end.

The practical split: use eigen modes to understand and validate the building's behaviour, and Ritz vectors when you're driving a response-spectrum analysis and want efficient, load-relevant participation. What you shouldn't do is pick one out of habit without knowing which question you're asking.

## What this means in practice

None of these checks take long. Mass source against a hand estimate, period against the code formula, first three mode shapes, participation to 90%, and the right vector type for the analysis — call it fifteen minutes total. The reason they matter is that modal analysis fails silently. There's no red banner for a double-counted dead load, a torsion-first layout, or a participation shortfall hidden behind local modes.

The engineers who get burned aren't the ones who can't run ETABS — running it is the easy part. They're the ones who trusted a clean-looking set of periods and a nice mode shape animation without asking whether the mass was right and whether the building was moving the way a real building of that system and height should move. The model will happily give you precise answers to the wrong problem. The fifteen minutes of checking is what keeps you from designing on them.
