---
slug: construction-sequence-loads-model-never-sees
title: "Construction Sequence: The Loads Your Final-Condition Model Never Sees"
date: "2026-06-03"
excerpt: "Your model analyses a finished building under its design loads. The structure has to survive every stage of getting there — half-built, propped, eccentrically loaded — and some of those stages are worse than the day it opens."
tags: [concrete, high-rise]
readingTime: "5 min read"
seoTitle: "Construction Sequence Loads — What the Final-Condition Model Misses"
seoDescription: "Why a final-condition analysis misses critical temporary states during construction, and which sequence-dependent effects govern in real structures."
ogImage: /og-image.svg
---

A standard analysis answers one question: will the finished building carry its design loads? It's the right question, but it's not the only one. The structure also has to survive the process of becoming finished — and the partly built, freshly cast, temporarily propped, unevenly loaded states it passes through on the way are not in the final-condition model at all.

Most of the time the finished condition governs and the temporary states are comfortably inside it. But not always. And the cases where a construction stage is worse than the in-service condition are exactly the ones that don't announce themselves in the model you ran.

## The model assumes a building that never existed all at once

A final-condition analysis applies all the loads to the complete structure in one step. That implies the whole building sprang into existence fully formed and fully loaded. It didn't. It went up floor by floor, each element cast or erected, loaded, and braced in a sequence — and at no point during that sequence did the structure look like the model.

This is the same blind spot behind differential column shortening, but it's broader than that. Sequence affects load paths, locked-in forces, stability, and the demands on individual elements at moments the final model simply doesn't represent. The finished structure is one snapshot. Construction is the whole film, and some frames are harsher than the ending.

![Back-propping during construction: a freshly cast slab's load shared down through props onto younger slabs below](/posts/construction-sequence.svg)

## The states that actually bite

A few recurring situations where a construction stage governs:

**Freshly cast concrete carrying load early.** Concrete gains strength over time. A slab loaded by formwork, props, and the pour above while it's only days old is carrying load at a fraction of its design strength. Back-propping distributes construction loads through several floors at once, and a lower slab can briefly see more load during construction than it ever does in service — at an age when it's least able to take it.

**Steel erection before the structure is complete.** A steel frame mid-erection isn't yet braced the way the finished building is. Stability that relies on a diaphragm, a core, or bracing that hasn't been installed yet has to come from somewhere — temporary bracing, or the erection sequence itself. The partly erected frame is a different, often more flexible structure than the one analysed.

**Eccentric and asymmetric temporary loads.** Construction loads rarely arrive symmetrically. A crane, stacked materials, a pour proceeding across a floor from one side — these load the structure in patterns the balanced design case never considered, and can govern local elements or temporary stability.

**Locked-in forces from sequence.** When you connect elements matters. Tie two parts of a structure together at one stage and the loads applied after that point distribute differently than if you'd connected them later. The classic case is outriggers in tall buildings: connect them before the differential shortening between core and columns has played out and you lock in forces that have nothing to do with wind or seismic — they're purely a consequence of *when* the connection was made.

## Whose problem is this?

This is where it gets murky in practice, and worth being clear-eyed about. The permanent works are the design engineer's. The temporary works and the means and methods of construction are usually the contractor's. But the line isn't clean: the sequence can affect the permanent structure's locked-in forces, and the permanent design can constrain what sequences are even safe.

The defensible position is that the design engineer should understand which construction stages could govern the permanent works, flag the sequence-dependent assumptions the design relies on, and make them explicit rather than leaving them buried. If your design assumes outriggers are connected late, or that a slab won't be loaded before a certain strength, or that a particular bracing element is in place before another is removed — that assumption is part of the design, and it belongs on the drawings, not in your head.

## What this means in practice

For most ordinary structures, the final condition governs and a construction-stage check confirms it quickly. The discipline is knowing when you're *not* in that ordinary case: tall concrete buildings where shortening and back-propping matter, steel frames relying on not-yet-installed bracing, transfer structures, outrigger systems, and anything where the sequence locks in force.

In those cases, the questions to ask before signing off: which temporary state is worst for each critical element? Does the structure have a stable, complete load path at every stage, not just at the end? What does the design quietly assume about the order of construction — and is that assumption written down where the contractor will actually see it?

The model told you the finished building works. It said nothing about the six months of getting there. For most of those months the structure is fine. The job is knowing which of them it isn't.
