---
slug: differential-column-shortening
title: "Differential Column Shortening: The Movement Your Static Model Doesn't See"
date: "2026-05-30"
excerpt: "Run a tall concrete building in one shot and every column lands at the right level. Real buildings don't get built in one shot — the core and the columns shorten at different rates over years, and the difference redistributes force you never designed for."
tags: [high-rise, concrete, methodology]
readingTime: "9 min read"
seoTitle: "Differential Column Shortening in Tall Concrete Buildings"
seoDescription: "Why cores and columns shorten at different rates, how elastic, creep and shrinkage combine, and why staged construction analysis matters for tall concrete buildings."
ogImage: /og-image.svg
---

Build a forty-storey concrete building in a single analysis step and every vertical element ends up exactly where you drew it. Apply all the load at once to the complete frame, and the model has no way to know that the core was slipformed weeks ahead of the columns, that the concrete at level 5 has been creeping for two years while level 38 is barely a month old, or that the perimeter columns are working at a stress the core never sees.

Real tall concrete buildings shorten. The core and the columns shorten at different rates, and the *difference* between them — not the absolute movement — is what quietly redistributes force into elements that were never designed to carry it. A conventional one-step gravity model is structurally blind to all of it.

## Three mechanisms, stacked

Axial shortening of a concrete vertical element is the sum of three separate effects, and only one of them is instantaneous:

- **Elastic shortening** — the immediate strain when load is applied. Predictable, and the only mechanism a steel column experiences.
- **Creep** — time-dependent strain under sustained stress. It depends on the magnitude of the sustained load, the age of the concrete when loaded, and the loading history, and it keeps developing for years.
- **Shrinkage** — time-dependent strain from drying, largely independent of load, driven by the concrete mix, ambient humidity, and the member's volume-to-surface ratio.

In a reinforced concrete column, all three run together and can't be physically separated — they're only split apart for the purpose of analysis. Steel columns, by contrast, see elastic shortening only, which is exactly why differential movement is such a defining problem in composite and mixed systems where steel and concrete elements sit side by side.

The reinforcement matters here too. As concrete creeps and shrinks, load sheds from the concrete onto the longitudinal bars, so a more heavily reinforced element creeps less. Cores and columns in tall buildings typically carry a couple of percent reinforcement, and that ratio is part of what sets their long-term shortening — a detail that gets lost if you think of shortening as a pure concrete property.

## Why the core and the columns disagree

The reason differential shortening exists at all comes down to stress. Perimeter columns are usually sized to a higher sustained compressive stress than the central core walls, which carry comparatively low gravity stress because they're proportioned for lateral demand and have a large cross-sectional area. Higher sustained stress drives more creep, so the columns shorten faster than the core over time.

That sets up a relative displacement between the core and the columns on every floor, accumulating up the height. And it's genuinely a height problem: the longer the stack of shortening elements, the larger the accumulated differential. The Concrete Society's position is that shortening isn't a significant design concern below roughly 10 to 15 storeys — above that, it climbs onto the list of things you have to actively account for.

The consequences land on the elements spanning between the core and the columns:

- **Slabs and beams tilt** as one support drops relative to the other, inducing additional moments and shears the flat-one-step model never reported. The horizontal members effectively get dragged into redistributing load between the stiffer-staying and faster-shortening supports.
- **The core picks up load it wasn't expecting**, while the columns shed some — a redistribution that runs opposite to the naive gravity take-down.
- **Non-structural elements suffer** — cladding, partitions, façade joints, and finishes accumulate distortion if movement joints and tolerances aren't sized for the differential.

The canonical treatment of all this is the Fintel, Khan, Ghosh and Iyengar body of work through the Portland Cement Association — the first rigorous prediction method for inelastic column shortening, and still the reference most practitioners reach for. Their well-known rule of thumb, that total shortening can approach the order of one inch for every eighty feet of height, is useful as a smell test for whether you're in territory that matters — but it's a rule of thumb, not a design value. The real number depends on your mix, environment, reinforcement, and construction programme, which is why a proper analysis matters above that 10–15 storey threshold.

## The one-step model is solving the wrong problem

Here's the core modelling issue. A standard analysis applies the full gravity load to the fully assembled frame in a single step. That implies the entire building existed, fully loaded, at the same instant — which is physically false for any tall building.

In reality the structure is built floor by floor. By the time an upper floor is cast, the floors below have already shortened under their own self-weight and the loads above them at the time of casting are levelled out during construction. Each floor is built to its intended level *as it goes*, so the shortening that happened before a given floor was cast is effectively erased by the construction process — it's the shortening that happens *after* a floor is built that distorts it. A one-step analysis can't represent any of this. It applies all the load to all the floors at once and reports a deflected shape that no floor of the real building ever experiences.

This is why a one-step analysis can give you misleading vertical displacements *and* misleading member forces in the horizontal elements that tie the cores to the columns. The error isn't conservative in a predictable direction — it can over- or under-state forces depending on the geometry and the load path.

## Staged construction analysis is the honest tool

The fix is to analyse the building the way it's actually built: in stages, with time-dependent material behaviour switched on.

Staged (sequential) construction analysis adds the structure floor by floor, applies load as each stage is built, and lets the concrete age, creep, shrink, and gain strength between stages. ETABS supports this with time-dependent material definitions, and you can drive the creep and shrinkage prediction from the established models — AS 3600 carries its own creep and shrinkage provisions, and the CEB-FIP / fib Model Code and ACI 209 models are the other widely used bases. It's worth knowing that these models can give noticeably different shortening predictions for the same building, which is one reason significant projects benchmark predictions against field strain measurements where they can.

What staged analysis actually buys you:

- **Realistic differential displacements** between core and columns at each level, accumulated correctly up the height
- **The redistributed forces** in slabs and beams that the one-step model misses entirely
- **A basis for compensation** — once you know the predicted shortening profile, you can specify built-in level corrections (casting upper floors slightly high) so the structure settles toward its intended levels over time

The inputs that move the answer most are the construction rate (how fast you go up), the concrete grade and mix, the age at loading, the reinforcement ratios, and the environmental conditions. Those aren't all knowable with precision at design stage, which is the honest limitation — but a staged analysis with reasonable assumptions tells you far more than a one-step model that assumes the problem away.

## Where this interacts with the lateral system

One trap worth flagging for anyone working on outrigger buildings: differential shortening and outrigger systems interact, and not helpfully. An outrigger ties the core to the perimeter columns precisely to mobilise the columns against core rotation under lateral load — but that same stiff connection means the differential *axial* shortening between core and columns now induces forces in the outrigger itself. Lock the outrigger in at the wrong time relative to the shortening, and you can build in locked-in forces that have nothing to do with wind or seismic. The construction sequence and the timing of outrigger connection become a structural decision, not just a programme one. That's a deeper topic in its own right, but if you're modelling outriggers without thinking about shortening, you're only seeing half the force.

## What this means in practice

For a concrete building under about 10–15 storeys, a one-step gravity model is fine — the shortening is real but small enough not to govern. Above that, and especially for tall buildings with a stiff central core and heavily stressed perimeter columns, differential shortening becomes a design action you have to account for, and a one-step analysis is genuinely solving a different problem from the one you're building.

The practical sequence: recognise when you're above the threshold, run a staged construction analysis with time-dependent material properties, pick a creep/shrinkage model and know that the choice affects the answer, look at the *differential* between core and columns rather than the absolute movement, and use the predicted profile to set compensation and to check the forces redistributed into your slabs and beams. If you've got outriggers, fold the connection timing into the same conversation.

The shortening is going to happen whether or not your model sees it. The only question is whether you found out about the redistributed forces at design stage or after the slabs started cracking.
