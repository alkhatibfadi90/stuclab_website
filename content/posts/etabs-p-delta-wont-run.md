---
slug: etabs-p-delta-wont-run
title: "P-Delta Won't Run in ETABS: What's Actually Wrong and How to Fix It"
date: "2026-09-22"
excerpt: "The model runs perfectly. You switch on P-Delta and everything stops. P-Delta almost never fails on its own: the model has a real problem linear analysis was tolerating, and the iteration is the first thing honest enough to refuse."
tags: [analysis-modelling, high-rise]
readingTime: "5 min read"
seoTitle: "P-Delta Won't Run in ETABS: Real Causes and How to Fix It"
seoDescription: "Why ETABS stops running once P-Delta is switched on, the four causes of non-convergence, why buckling under gravity is the one nobody suspects, and the gravity-scaling method that finds it."
ogImage: /og-image.svg
---

The model runs perfectly. You switch on P-Delta, run it again, and everything stops. No results, no lateral cases, often no clear error, just a model that will no longer analyse. The natural conclusion is that P-Delta is fussy. It isn't. P-Delta almost never fails on its own. When it won't run, the model has a real problem that linear analysis was quietly tolerating, and the P-Delta iteration is the first thing honest enough to refuse.

![The P-Delta gate blocking every linear case behind it, and the gravity-scaling ladder that finds the buckling load and shape](/posts/p-delta-wont-run.svg)

## Why switching it on breaks a model that "worked"

ETABS runs the initial P-Delta analysis first, as an iterative nonlinear case on your gravity combination, then reuses the resulting stiffness for every linear case after it. The consequence people don't expect: if the P-Delta iteration fails to converge, the subsequent linear cases are not run at all. The gate at the front of the queue closes, and the model loses everything, not just its P-Delta results. That's why it looks like "ETABS won't run anymore" rather than "P-Delta gave a warning."

## The four things that actually stop it

CSI's documentation lists the causes of non-convergence directly. Every real case fits one:

| Cause | In the model | Why P-Delta refuses when linear didn't |
|---|---|---|
| **Buckling under gravity** | Compression large enough that an element, or the frame, buckles | Linear can't see buckling; the iteration hits it and diverges |
| **Inadequate support or connection** | A missing restraint, a disconnected element | Marginal in linear; second-order stiffness tips it over |
| **Excessively large stiffness** | Rigid elements, huge modifiers, stiff springs | Poor conditioning the iteration amplifies |
| **Significant nonlinearity** | Links, hinges, layered shells | The iteration can't settle on equilibrium |

The first row is the big one, and the one nobody suspects.

## The one nobody suspects: your model is buckling

P-Delta applies the gravity load and asks, each iteration, whether the structure can hold it in its deformed shape. If compression is large enough relative to an element's stiffness, that element buckles, and ETABS makes no distinction between local buckling of one member and global buckling of the whole frame. Either way the run stops.

Linear analysis never sees this. It reports forces on the undeformed geometry without asking whether the member could survive them, so a model can pass linear while containing an element that collapses under its own gravity the moment second-order effects are considered. The usual suspects:

- **Walls modelled as membranes**, which CSI explicitly warns against, or shells with unrealistic thickness
- **Stiffness modifiers set so low** the element can no longer carry its compression
- **Slender members** never checked for stability
- **Floors carrying in-plane load with no diaphragm**, where the slab itself buckles in-plane

None show up in linear results. All of them stop P-Delta cold.

## How to find it: two steps

**1. Run linear first and look at the deflections.** CSI's own rule is that P-Delta should only be attempted once the model runs cleanly for linear cases and the deformations are realistic. Run a gravity case and look at the shape. Any zone deflecting out of proportion is your stability problem.

**2. Scale the gravity down until it converges.** The sharpest trick, from experienced practitioners. Create P-Delta combinations with gravity factored to 10, 20, 30 percent and so on. Find where it stops converging. If it solves at 86 percent and diverges at 87, the deflected shape at 86 is the incipient buckling mode. The element doing something dramatic in that shape is the one that's buckling, and now you know exactly what to fix.

## Fix the structure, not the setting

- Replace membrane walls with proper shells and realistic thickness
- Bring unrealistically low modifiers back to defensible values
- Add columns or bracing where the frame is too flexible to carry gravity laterally
- Assign a diaphragm where a floor is carrying in-plane load it can't hold
- Restore the missing support or connection

Loosening the convergence tolerance can make the run complete, but that's silencing the messenger. If the structure buckles under gravity in the model, the design has a problem the solver just found for you.

## What this means in practice

P-Delta not running is a diagnostic gift dressed as an error. It's the first part of the analysis that asks whether your structure can stand up under second-order effects, and when it refuses, something is usually buckling under gravity in a way linear analysis was blind to. Run linear first, scale the gravity down to find the buckling shape, fix the element it points at. Then P-Delta runs, because the thing it was refusing to accept is gone.

*The above reflects general modelling practice for educational purposes; resolving any specific model remains a matter of engineering judgement.*
