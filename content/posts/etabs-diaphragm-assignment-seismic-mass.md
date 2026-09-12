---
slug: etabs-diaphragm-assignment-seismic-mass
title: "Diaphragm Assignment in ETABS: The Mistake That Quietly Drops Your Seismic Mass"
date: "2026-09-01"
excerpt: "Miss a diaphragm on a floor, or assign it to the wrong thing, and nothing complains. The model runs, the seismic loads generate, the results look complete. Part of the building's mass has quietly stopped participating, and the accidental torsion on that floor has disappeared."
tags: [analysis-modelling, seismic-wind]
readingTime: "5 min read"
seoTitle: "ETABS Diaphragm Assignment: How It Quietly Drops Seismic Mass"
seoDescription: "Why a missing or mis-assigned diaphragm in ETABS silently removes mass from the auto seismic load and accidental torsion, the three ways it goes wrong, and a two-minute check."
ogImage: /og-image.svg
---

A diaphragm assignment feels like housekeeping. You draw the slab, you assign the diaphragm, you move on. Miss it on a floor, or assign it to the wrong thing, and nothing complains. The model runs, the seismic loads generate, the results look complete. What you don't see is that part of your building's mass has quietly stopped participating in the lateral load, and the accidental torsion on that floor has disappeared altogether.

This is one of the more consequential silent errors in ETABS, because the auto seismic load is built on the diaphragm. No diaphragm, no correct load.

![Plan view showing an unassigned patch of slab leaking mass out of the seismic load, shifting the centre of mass and lightening the storey force, with an inset contrasting a diaphragm assigned to the area versus to the points](/posts/diaphragm-mass-leak.svg)

## What the diaphragm is actually doing for your seismic load

In ETABS the diaphragm isn't just a stiffness constraint. It's the thing the automatic lateral loads are distributed through. The program needs a defined diaphragm, rigid or semi-rigid, to know which mass belongs to which storey and how the storey force is applied. Three things hang off it:

| Function | Depends on the diaphragm because |
|---|---|
| **Storey mass lumping** | Meshed internal points only lump to storey level through a diaphragm assigned to the area |
| **Auto seismic force distribution** | The program applies the storey force to the diaphragm; without one, there's nothing to apply it to |
| **Accidental eccentricity** | The accidental torsion moment is applied only to storeys that have a diaphragm assignment |

Every one of these fails quietly when the diaphragm is missing or wrong.

## The three ways it goes wrong

**1. A floor with no diaphragm at all.** Any shell you forgot to assign contributes no tributary mass to the auto seismic load and receives no accidental torsion. The rest of the building is loaded; that floor, or that patch of floor, is not. A plant room, a mezzanine, a transfer slab drawn late in the modelling are the usual victims.

**2. Diaphragm assigned to points instead of the area object.** This is the subtle one. A rigid diaphragm has to be assigned to the area, so that the internal points ETABS creates during meshing get lumped to the storey. Assign it to the corner points instead and the meshed interior mass never lumps. The floor looks constrained; its mass is leaking out of the seismic calculation.

**3. Auto-meshed walls.** CSI notes directly that mass isn't lumped to storey level when auto area meshing is applied to walls. In a wall-heavy model this can strip a meaningful share of the mass from where the storey force expects to find it.

## Why the eccentricity part matters so much

Rigid and semi-rigid diaphragms handle accidental eccentricity differently, and the difference is where an unassigned shell bites hardest.

- **Rigid:** the accidental eccentricity is concentrated and applied at the centre of mass. A missing shell shifts that centre and shrinks the mass it's computed from.
- **Semi-rigid:** the eccentricity is applied at every node, with each nodal force multiplied by the eccentricity based on that node's tributary mass. An unassigned shell has no nodal force at all, so its contribution to the accidental torsion is exactly zero.

Either way, the accidental torsion your code requires (AS 1170.4's ±0.1b, applied to every building) is being computed from less mass than the building actually has. The corner and perimeter elements, which the torsion loads hardest, are under-designed, and the design report says nothing.

## How to check in two minutes

1. **Read the storey mass table** after the run and compare it to a hand estimate from floor area and unit loads. A shortfall on one storey is a diaphragm problem on that storey.
2. **Display the diaphragm assignments** in plan, floor by floor. Any shell not coloured as part of a diaphragm is a shell that isn't in your seismic load. Check the ones drawn last.
3. **Confirm rigid diaphragms sit on area objects, not points**, and check whether any walls are auto-meshed.
4. **Compare the auto seismic storey force** to the storey mass times the design coefficient. If the force is light on a floor, that floor's mass is missing.

## What this means in practice

The diaphragm is the foundation the entire auto seismic load stands on: mass lumping, force distribution, and accidental torsion all run through it. A missing or mis-assigned diaphragm doesn't produce an error. It produces a model that's loaded lighter than the real building and has less torsion on its most vulnerable elements, and it produces it silently.

Assign every diaphragm deliberately, to the area object, on every floor including the ones drawn late. Then read the storey mass table and confirm the building actually weighs what it should. Two minutes of checking against a design that's quietly missing part of its seismic load.

*The above reflects general modelling practice for educational purposes; resolving any specific model remains a matter of engineering judgement.*
