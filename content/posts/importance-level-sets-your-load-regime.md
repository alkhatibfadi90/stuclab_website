---
slug: importance-level-sets-your-load-regime
title: "Importance Level: The One Decision That Quietly Sets Your Entire Load Regime"
date: "2026-09-01"
excerpt: "It's a single classification you make near the start, often almost administratively. It silently scales every wind and seismic load the structure is designed for, and the error is baked in before you draw a member."
tags: [seismic-wind, practice, high-rise]
readingTime: "6 min read"
seoTitle: "Importance Level in AS 1170: The Decision That Sets Your Load Regime"
seoDescription: "How Importance Level cascades through annual probability of exceedance into wind speed and seismic factors, and the classification mistakes that quietly under- or over-design a building."
ogImage: /og-image.svg
---

Importance Level is the least glamorous decision on a project and one of the most consequential. It's a single classification you make near the very start, often almost administratively, and it silently scales the wind and seismic loads the whole structure is designed for. Get it right and nobody notices. Get it wrong and you've either over-designed the entire building or, far worse, under-designed it against the loads it will actually see, and the error is baked in before you've drawn a single member.

For a decision that cascades this far, it gets remarkably little thought on a lot of projects. Worth understanding exactly what it drives.

![How Importance Level cascades through annual probability of exceedance into wind and seismic loads and the whole design](/posts/importance-level-cascade.svg)

## What Importance Level actually is

Importance Level is a measure of the consequences of failure. It isn't about how big the building is or how complex the engineering is. It's about what happens if the structure fails: how many people are exposed, what the hazard to life is, and whether the building has a post-disaster function that has to keep working when everything else has stopped.

The NCC sets it out in a table, from IL1 to IL4. IL1 is low consequence, structures whose failure poses little risk to life, minor storage sheds and the like. IL2 is the ordinary case, the vast majority of normal buildings, houses, offices, retail, car parks. IL3 is buildings holding large numbers of people or with elevated consequence, places of assembly, larger public buildings. IL4 is post-disaster, the structures that must remain operational after an extreme event, hospitals, emergency services, key infrastructure. For non-standard structures outside the building code, AS/NZS 1170.0 gives a parallel route to the same classification.

The classification is a judgement about consequence, and it's the first domino.

## How it cascades into the loads

Here's the part that makes it matter, and the part people don't always trace through. The Importance Level doesn't act on your design directly. It acts through the annual probability of exceedance, and that is what actually sets the loads.

A higher Importance Level means the structure is required to be designed for a rarer, more severe event, a lower annual probability of exceedance. Rarer event, bigger load. The NCC maps each Importance Level to an annual probability of exceedance, separately for wind and for earthquake, and tied to the design working life of the structure.

From there the two actions diverge into their own standards but the logic is identical.

For wind, the annual probability of exceedance sets the regional wind speed. A rarer design event means a higher VR for your wind region, which flows straight through into every wind pressure on the building. Move up an Importance Level and the entire wind load regime scales up with it.

For seismic, the annual probability of exceedance sets the probability factor, kp. That factor multiplies the hazard factor for your site, and kp times Z drives the base shear. A higher Importance Level lifts kp, which lifts the seismic demand across the whole structure.

So one classification, made once, at the start, quietly sets the severity of both your governing lateral actions. Everything downstream, member sizes, drift, foundations, detailing, inherits it. That is a lot of leverage for a dropdown that often gets filled in without much debate.

## Where people get it wrong

The errors cluster in a few predictable places.

The most dangerous is under-classifying, putting a building at a lower Importance Level than its real consequence warrants. It's dangerous precisely because it's invisible. The model runs, the design passes, everything looks complete, and the whole structure is quietly designed for a more frequent, less severe event than it should be. There's no warning. The building is simply under-strength against the loads it will actually experience over its life, and you won't find out at design stage.

A specific and common version of this trap: IL1 structures aren't required to consider earthquake actions at all. Classify something as IL1 that should have been IL2, and you haven't just reduced the seismic load, you've potentially removed the seismic check entirely. That's a large gap to open up with a single wrong classification.

The mirror error is over-classifying, reaching for a higher Importance Level than the building needs out of misplaced conservatism. This one isn't unsafe, but it's expensive. You've scaled up every wind and seismic load on the project, and therefore every member and foundation, to defend against a consequence that isn't there. On a large building that's a lot of unnecessary cost, and it's the kind of conservatism that's hard to unwind later because everything was sized around it.

The subtler trap is mixed or changing use. A building's Importance Level follows its function, and function isn't always uniform or permanent. A structure with a post-disaster component might warrant a higher classification than its bulk use suggests. A change of use over the building's life can shift the Importance Level it should have been designed to. These are the cases where a purely administrative approach to the classification quietly misses the point.

## What this means in practice

Treat Importance Level as an engineering decision, not a form field. It's the upstream classification that sets the annual probability of exceedance, which sets your wind speed and your seismic factor, which sets essentially every load on the structure. The leverage runs one way: a few seconds of thought at the start governs the entire load regime for the life of the building.

So make the call deliberately. Understand the consequence of failure honestly, hazard to life, occupancy, post-disaster function. Check it against the NCC classification rather than defaulting to IL2 out of habit. Watch for the mixed-use and change-of-use cases where the obvious answer isn't the right one. And remember that under-classifying is the silent, dangerous error, because unlike almost every other mistake in a structural model, this one produces a clean-looking design that is simply calibrated to the wrong event.

The Importance Level is one line in a design basis. It also decides how hard the wind blows and how hard the ground shakes in every calculation you run afterwards. It deserves more than a default.

*The above reflects general principles for educational purposes; classification and design on any specific project remain a matter of engineering judgement against the NCC and the relevant standards.*
