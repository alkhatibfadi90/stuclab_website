---
slug: wind-vs-seismic-governs
title: "Wind or Seismic Governs — And Why the Answer Changes Up the Height"
date: "2026-05-23"
excerpt: "Comparing base shears tells you almost nothing. The governing action flips between shear, overturning, and drift — and between wind and seismic — at different levels of the same building. Here's how to read it."
tags: [wind, seismic, high-rise]
readingTime: "8 min read"
seoTitle: "Wind vs Seismic Governing in Tall Buildings — Reading It Properly"
seoDescription: "Why base shear comparison misleads, how wind and seismic governance flips through a tall building's height, and what drift-governed vs strength-governed means for stiffness and detailing."
ogImage: /og-image.svg
---

"Wind governs" or "seismic governs" is one of those statements people make about a whole building, as if it were a single property of the structure. It isn't. On most tall buildings in Australia it's wrong at some level, in some direction, for some response quantity — and the engineers who treat it as one global answer end up detailing for the wrong thing.

The honest version is more useful and more annoying: governance is a function of *what* you're checking, *where* you're checking it, and *which direction* you're looking. Get that straight and the design decisions fall out cleanly. Miss it and you'll stiffen a building that didn't need stiffening, or detail for ductility you were never going to mobilise.

## Base shear is the wrong quantity to compare

The instinct is to run both actions, compare base shears, and declare a winner. In a low-to-moderate seismic environment like most of Australia, wind usually wins that contest on a tall building, and people stop there.

The problem is that base shear is a single scalar — the total horizontal force at one elevation, the bottom. It says nothing about how that force is distributed up the height, and distribution is where the two actions diverge most.

Wind builds with height. AS/NZS 1170.2 scales pressure up the building through the terrain/height multiplier, so the force on each level grows toward the top and the load profile is heavily weighted into the upper half. Seismic is the opposite kind of action — it's inertial, so the force at each level is driven by the mass there and how that mass participates in the mode shapes. AS 1170.4 distributes the base shear up the structure in a pattern tied to mass and height, not wind pressure. The two profiles look nothing alike, and that difference — not the total at the base — is what governs your design.

Two buildings can have near-identical base shears and entirely different storey-force profiles. Comparing the totals throws away exactly the information you need.

## Overturning moment is where the two actions really separate

If base shear is the wrong quantity, overturning moment is the right one to expose the disagreement.

Overturning is force times lever arm. Wind's pressure is concentrated high up, so it gets multiplied by the longest moment arms — which means wind can *lose* the base-shear contest and still *win* decisively on base overturning moment. Seismic's inertial force, distributed by mass and mode shape, produces a different overturning profile entirely, and one that AS 1170.4's spectral shape factor pushes down for longer-period structures (more on that below).

This is the cleaner demonstration that "compare the base shears and pick a winner" is broken: on the same building, in the same direction, the two actions can rank one way on shear and the opposite way on overturning. A single number can't capture that.

And overturning is what actually drives the elements that matter in a tall building:

- Core wall axial-flexural demand and the tension/compression couple across the core
- Coupling beam forces over the height
- Pile and raft demands — uplift, tension piles, edge bearing pressures
- The foundation system as a whole, which is sized on overturning, not shear

If you've checked shear and skipped a proper overturning comparison between the two actions, you haven't actually established what governs the foundations or the core.

## Drift, shear, and overturning are three separate questions

Before you can say what governs, you have to say *what you're checking*. The three checks that matter pull in different directions:

| Check | What it asks | What drives it |
|---|---|---|
| Shear | Can the section carry the horizontal force? | Total force and where it's distributed |
| Overturning | Can the system and foundation resist the moment? | Force times lever arm — upper-level forces dominate |
| Drift | Does the building move too much? | Stiffness and the shape of the deflected profile |

These are not the same question wearing three hats. A building can pass shear comfortably, govern on overturning under wind, and fail drift under a different combination entirely.

For tall buildings the order is almost always stiffness first. The structure is drift-governed long before it's strength-governed, which means the action controlling member sizing is whichever produces the larger *deflection*, not the larger *force*. The load case with the bigger base shear can easily produce the smaller drift if its force sits low in the building. AS/NZS 1170.2 gives you serviceability wind specifically for this — the comfort and inter-storey drift checks at the top of a tall building are routinely a wind serviceability problem, not a strength one.

## Why governance flips through the height

Here's where the "one global answer" framing breaks down completely.

Wind's top-weighted profile means it tends to dominate the response near the top — longest overturning lever arm, and the serviceability deflections that bother occupants accumulate up there. Seismic's mass-driven, mode-shape-weighted distribution can dominate lower down, particularly where there's a mass irregularity, a stiffness change, or a transfer level redistributing inertial force.

So on a single building you can genuinely have:

- **Wind governing drift and overturning in the upper levels**, where occupant comfort and inter-storey drift are set by the top-weighted pressure profile
- **Seismic governing shear at a transfer level or podium**, where concentrated mass above dumps inertial force into a stiffness discontinuity
- **Different actions governing in each orthogonal direction**, because stiffness, plan aspect ratio, and exposed face area are rarely symmetric

The governing action is not a property of the building. It's a property of the location and the check. Any design report that says "seismic governs" full stop is compressing a surface into a point.

## The long-period effect: why wind takes over as buildings get taller

There's a mechanism worth making explicit because it explains the pattern across an entire portfolio of tall buildings.

AS 1170.4 sets seismic demand through a spectral shape factor that falls away as the fundamental period lengthens. Taller buildings have longer periods, so they attract proportionally *less* seismic force — the standard's own spectrum winds the action down as the building gets taller and more flexible. Wind goes the other way: a taller, more exposed building sees higher pressures over a larger area at longer lever arms, so AS/NZS 1170.2 demand climbs with height.

The two trends cross. Below the crossover, seismic is in the contest; above it, wind runs away with overturning and drift. That's why the answer genuinely changes as you move up a tall building, and why it changes across buildings of different heights on the same site.

## The Australian wrinkle: low seismicity doesn't mean seismic is irrelevant

It's tempting in Australian practice to wave seismic away because the hazard is low and wind so often wins the comparison. That's a trap for two reasons.

First, AS 1170.4 still drives **detailing**, even where wind governs the forces. The standard requires every building to be designed for earthquake actions and carries ductility and detailing provisions through its earthquake design categories regardless of whether seismic sized your members. You can have a wind-governed building whose reinforcement detailing is dictated by its earthquake design category. Treating seismic as "not governing" and skipping the detailing is a compliance failure, not a conservative shortcut.

Second, AS 1170.4 carries no minimum base-shear floor at long periods the way some overseas codes (and NZS 1170.5) do. That's a known feature of the Australian standard, not a bug you can lean on — it means the seismic action on a very tall, long-period building can fall to genuinely small numbers, which reinforces wind's dominance up high but also puts the weight back onto getting your detailing and ductility assumptions right rather than trusting a force floor to protect you.

## What this means in practice

Stop asking "does wind or seismic govern this building." It's the wrong question, and the answer is always "it depends on what and where."

Ask instead, for each direction:

1. Which action governs **shear** at each level — and watch the transfer levels and podium
2. Which action governs **overturning** at the base and at any major setback or transfer — this is your core and foundation driver
3. Which action governs **drift** in the upper levels — usually wind serviceability on a tall building

Run those three and you'll often find wind owning overturning and drift up high while seismic still has a say in shear lower down, with the orthogonal directions disagreeing with each other. That's not a contradiction to resolve — it's the actual answer, and it tells you exactly where to put stiffness and where to put detailing.

The engineers who get caught out are the ones who ran both load cases, compared two base shear numbers, wrote "wind governs" in the report, and detailed the whole building on that basis. The numbers were real. The conclusion was a single point standing in for a surface.
