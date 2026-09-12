---
slug: etabs-zero-mass-participation
title: "Zero Mass Participation in ETABS: Why Your Modal Results Are Wrong and Where to Look"
date: "2026-09-18"
excerpt: "The UX and UY columns read zero, sometimes with a period that makes no sense. The model ran, nothing crashed, and the dynamics are completely wrong. It's rarely mysterious: the table itself tells you which of four causes you've got."
tags: [analysis-modelling, seismic-wind]
readingTime: "5 min read"
seoTitle: "Zero Mass Participation in ETABS: Causes and Where to Look"
seoDescription: "Why ETABS reports zero mass participation in X and Y, the four cause families behind it (no mass, local modes, a locked-out building, too few modes), and how to read the table to find which one you have."
ogImage: /og-image.svg
---

You open the modal participating mass ratios table and the UX and UY columns read zero. Sometimes the cumulative sum sits frozen at a fraction of a percent, mode after mode. Sometimes it comes with a period that makes no sense: a ten-storey building reporting eleven hertz, as if it were a stiff little block. The model ran, nothing crashed, and the dynamics are completely wrong.

The good news is this is rarely mysterious. The participation ratio is just an accounting of how much mass each mode mobilises in each direction, so when it reads zero, one of two things is true: there's no mass to move, or the mass is there but the modes you're looking at aren't moving it. Every cause below is a version of one of those, and the table itself tells you which.

![Decoder card: three patterns in the ETABS modal participation table, each pointing to its cause family, with a quick test for each](/posts/mass-participation-decoder.svg)

## The symptom tells you the family

| What the table shows | Family | What's happening |
|---|---|---|
| Zero everywhere, sum frozen near zero | **No mass in the model** | The mass source isn't delivering mass |
| Zero early, translation appears at a high mode | **Local modes first** | Stiff or isolated elements are consuming the early modes |
| Zero in X and Y with an absurd frequency | **Locked out** | Something is restraining lateral movement |
| Present but never reaching 90% | **Too few modes** | The mass is real; you haven't captured it yet |

## Family 1: there's no mass to participate

The frozen-near-zero table. It comes from the mass source and hides well because the model runs perfectly.

- **The source isn't pointed at anything.** Set to load patterns with none listed, or the wrong ones. Check Define, Mass Source.
- **Net mass went negative and got zeroed.** ETABS doesn't allow negative mass: if a joint's combined mass comes out negative, it's silently set to zero. A net-uplift pattern in the mass source can strip mass out of the building with no warning.
- **Mass isn't lumping to the storey.** A rigid diaphragm lumps mass only when assigned to an area object, not to points, and auto-meshed walls don't lump the way you'd expect.

The quick test: read the total mass off the results and hand-check it against floor area and unit loads. If it's a fraction of what it should be, stop. Nothing downstream is worth looking at yet.

## Family 2: the mass is there, but local modes are eating the count

UX and UY sit at zero for the first twenty or thirty modes, then a big translational mode suddenly appears at, say, mode 38. The mass is real. Stiff or poorly connected elements, a wall panel, an isolated member, a plant deck, are vibrating on their own, and each one consumes a mode before the whole building gets to sway.

Animate the early modes and you'll see it: a single element flapping instead of the building moving. The fix is connectivity and lumping, not more modes. Adding modes until the number passes only hides what the model is telling you, that something is disconnected.

## Family 3: something is locking the building out

The absurd-period case. A multi-storey building at ten or eleven hertz with zero lateral participation isn't stiff; it's restrained. Something is preventing translation entirely, so the sway modes don't exist and the first modes ETABS finds are local ones. Look for restraints where they shouldn't be, a diaphragm pinned against translation, or supports at intermediate levels. Quick confirmation: apply a static lateral load. If the building barely moves, the restraint is the problem, not the dynamics.

## Family 4: you just haven't asked for enough

If participation is present and climbing but stalls under 90 percent, the model is probably fine. Add modes, or switch to Ritz vectors, which reach the target with far fewer modes and include the missing-mass effect. This is the only family where "add modes" is the right answer. For the other three, it's a way of hiding the problem.

## The check sequence

1. **Read the total mass.** Wrong total means Family 1.
2. **Read the table's pattern.** Frozen: 1. Zero then a jump: 2. Zero with an absurd frequency: 3. Climbing but short: 4.
3. **Animate the first three modes.** Building sways: healthy. One element flaps: 2. Nothing moves: 3.
4. **Fix the cause, not the number.** Only add modes once the mass and behaviour are already right.

## What this means in practice

Zero mass participation is the model telling you, in plain numbers, that the mass isn't there, the early modes are local, or the building can't move. The table and a ten-second animation say which. Diagnose from the symptom, fix the real cause, and keep "just add more modes" for the one case where the model is already right.

*The above reflects general modelling practice for educational purposes; resolving any specific model remains a matter of engineering judgement.*
