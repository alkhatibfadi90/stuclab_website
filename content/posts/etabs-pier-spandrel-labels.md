---
slug: etabs-pier-spandrel-labels
title: "Pier and Spandrel Labels in ETABS: Get Them Wrong and Your Wall Design Is Meaningless"
date: "2026-10-03"
excerpt: "The wall is modelled, meshed and analysed, and the design output comes back empty, or every wall reports the same number, or a wall shows zero moment where there's obviously bending. The geometry is fine. The labels are wrong."
tags: [analysis-modelling, concrete]
readingTime: "5 min read"
seoTitle: "ETABS Pier and Spandrel Labels: Why Wrong Labels Ruin Wall Design"
seoDescription: "What pier and spandrel labels actually do in ETABS, why forces are only reported at pier ends and spandrel ends, the three labelling mistakes that corrupt wall design, and the checks to run first."
ogImage: /og-image.svg
---

The wall is modelled, meshed, loaded and analysed. Then the design output comes back empty, or every wall in the core reports the same number, or a wall shows zero moment where there's obviously bending. Nine times out of ten the geometry and loads are fine. The pier and spandrel labels are wrong, and in ETABS the label isn't a tag, it's the instruction that decides how forces are integrated and where they're reported. Get that wrong and the wall design is built on numbers that don't describe any real wall.

![Wall elevation showing pier cuts at pier top and bottom and spandrel cuts at the lintel ends, beside a core labelled with one pier label versus one label per wall](/posts/pier-spandrel-labels.svg)

## What a label actually does

A shell wall carries a continuous stress field. To design it, ETABS has to cut through that field and integrate the stresses into forces a design check can use. The label is what defines the cut.

| Label | The cut | Behaves like | Forces reported at |
|---|---|---|---|
| **Pier** | Horizontal section through the wall | A column: P-M interaction, vertical reo for flexure, horizontal reo for shear | Top and bottom of the pier only |
| **Spandrel** | Vertical section through the wall | A beam: horizontal reo for flexure, vertical reo for shear | Left and right ends only |

Two consequences follow straight from this. No label means no cut, so no forces and no design, which is why an unlabelled wall simply reports nothing. And a label integrates everything that shares it, so the scope of the label is the scope of the design section.

## The three mistakes that corrupt the result

**1. One pier label on every wall.** Assign P1 to all the walls on a floor and ETABS integrates them into one section cut and reports one critical result for the lot. The core's four walls become a single number. Each pier in a coupled system, each leg of an L, each wall that will be detailed separately needs its own label.

**2. Expecting results where there's no cut.** Piers report only at their top and bottom. A pier spanning a door opening reports at the top and bottom of the opening, and nothing at mid-height, because the cut is made at the ends of the pier, not the ends of each shell. If you need forces at an intermediate level, subdivide the wall and give the segment its own label. The same logic gives the classic "zero moment" symptom: a wall with no pier assignment has no section to report moment on.

**3. A label across joints that don't line up.** A pier label must not be applied to shells whose top and bottom joints sit at different levels, and a spandrel's end joints must be vertically aligned. ETABS draws the forces between the cut ends and connects them with a straight line; misaligned joints make that line meaningless.

## Two traps that look like features

Wall Stack is convenient and quietly assigns the same pier label to the whole stack, so reassign per level if you want level-by-level results. And a spandrel that is two shells above and below a level is two spandrels unless you give them a new label and tick "Multistory", which integrates them as one full-depth beam. Leave it unticked and you've designed two shallow beams instead of one deep one.

## The check

1. Every wall segment you'll detail separately has its own pier label.
2. Every lintel or coupling beam has its own spandrel label, Multistory ticked where it spans a level.
3. No label spans misaligned joints.
4. Subdivide wherever you need an intermediate result.
5. Read the pier forces at a few cuts against a hand estimate of axial and moment before trusting the design.

## What this means in practice

The label is the design section. It says what gets summed, where the cut is made, and which element the reinforcement is being designed for. Assign it per wall, per level, with the geometry aligned, and the output describes a real pier or a real beam. Assign it by habit and the output is a single merged number that no wall in the building actually experiences.

*The above reflects general modelling practice for educational purposes; wall design on any specific project remains a matter of engineering judgement against the relevant standards.*
