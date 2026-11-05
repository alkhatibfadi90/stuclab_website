---
slug: "inter-storey-drift-limits-h500"
title: "Inter-Storey Drift Limits: Where H/500 Actually Comes From and When It's the Wrong Number"
date: "2026-10-29"
excerpt: "H/500 is in every office template and almost nobody can say what it protects, which load it pairs with, or what stiffness it assumes. Get those three right and the number is either exactly right or obviously wrong."
tags: ["seismic-wind", "practice", "high-rise"]
readingTime: "5 min read"
seoTitle: "Inter-Storey Drift Limits: Where H/500 Comes From | StrucLab"
seoDescription: "Where the H/500 drift limit comes from in AS/NZS 1170.0 and AS 3600, what it protects, which wind load and stiffness it should be checked against, and when H/300, H/1000 or the 1.5% seismic limit is the right number instead."
ogImage: "/og-image.svg"
---

Ask most engineers what the drift limit is and you'll get H/500 without a pause. It's in the office template, it's in the design criteria, it's been H/500 on every job they've worked on. Few can say where it comes from, what it's protecting, or which load it's meant to be checked against.

That matters, because H/500 is a sensible default for one situation and the wrong number for several others, and the code never actually told you to use it.

![Log-scale drift ratio with H/1000, H/500, H/300 serviceability limits and the 1.5% AS 1170.4 ultimate limit, plus inter-storey, total and gravity-lean drifts on a frame](/posts/drift-limits-scale.svg)

## It's guidance, not a limit

AS/NZS 1170.0 does not mandate an inter-storey drift limit. What it gives you is an informative appendix of serviceability criteria, described as generally suitable for importance level 2 buildings, with values that depend on the element being protected. The AS 3600 commentary says something similar: 1/500 of the storey height is described as appropriate for most multistorey buildings, with the clear implication that it is a general-case figure, not a universal one.

So the number you're using is a recommendation that someone copied into a template years ago. That's fine as a starting point. It's not fine as a substitute for deciding three things on every job: what you're protecting, which load you're checking against, and what stiffness you're computing the drift with.

## What the number is protecting

A drift limit exists to keep something from being damaged or someone from being uncomfortable. The limit follows from the thing, not the other way round.

| Situation | Typical limit | What it's really about |
|---|---|---|
| Tolerant finishes, flexible cladding | H/300 | Occupant comfort governs before damage does |
| General multistorey, brittle partitions or cladding | H/500 | The general-case figure, cracking in masonry and plasterboard |
| Sensitive facades, glazing with tight joints | H/1000, sometimes a total-drift limit | Joints and glass can't take the racking |
| Seismic ultimate event | 1.5% of storey height (AS 1170.4) | Damage control and P-delta stability, not comfort |

The seismic figure deserves a note because it gets mixed up with the others. The 1.5% in AS 1170.4 is an ultimate-limit-state cap for a rare event. Damage is accepted; the point is that the structure stays stable and the P-delta effect stays bounded. H/500 is a serviceability check against frequent wind, where no damage is accepted at all. One is about 0.2%, the other is 1.5%. They are seven and a half times apart, they pair with different loads, and they are not interchangeable. A building has to pass both, each against its own load.

## Which load, at which stiffness

Two things decide whether H/500 passes long before the limit itself does.

The first is the load. Serviceability wind for a normal building sits around a 1 in 25 annual probability of exceedance, not the 1 in 500 ultimate event. Checking H/500 against ultimate wind is a common template error and it quietly over-stiffens the building. Checking it against the right event but the wrong terrain or shielding has the opposite effect.

The second is stiffness, and this is where most of the real variation hides. An uncracked model can pass H/500 comfortably while the same building at cracked stiffness fails it. The difference is not small. Neither answer is wrong on its own; what's wrong is not deciding. Pick the stiffness deliberately for the serviceability check, be consistent across walls, columns and coupling beams, and state it in the design criteria so the next person knows what the number means.

## The two things the template leaves out

The first is total drift. Inter-storey drift is a floor-by-floor check, and a tall building can pass it on every level while the roof offset over the full height is large enough to trouble lifts, stairs, risers and the facade movement joints. Above a certain height you need a separate total-drift limit, and it should be set with the people who design those elements.

The second is long-term lean. With an eccentric core or a plan where the gravity load is not symmetric about the stiffness, differential axial shortening between columns and the core produces a lateral offset that accumulates over years and has nothing to do with wind. It needs its own criterion first, and then it has to be combined with the wind drift when you check what the facade actually sees.

## What this means in practice

H/500 is a good default for an ordinary multistorey building with ordinary finishes, checked against serviceability wind at a cracked stiffness that you have chosen and written down. Move the limit when the finishes demand it: looser for tolerant cladding, tighter for glazing and sensitive facades. Add a total-drift check once the building is tall enough for the roof offset to matter. Add a gravity-lean check when the core is eccentric. Run the seismic 1.5% as a separate ultimate check and don't let it get near the serviceability number.

The template gives you a number. The job is to know what it's protecting, which event it's for, and what stiffness it assumes. Get those three right and H/500 is either exactly right or obviously wrong, and you'll know which.

*The above reflects general design principles for educational purposes; drift criteria on any specific project remain a matter of engineering judgement against the relevant standards and the elements being protected.*
