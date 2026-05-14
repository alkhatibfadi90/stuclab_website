Most issues I see in lateral stability reviews don't come from bad modelling. They come from skipping the decisions that should have happened *before* the first wall went into ETABS.

A lateral system is not a thing you draw — it's a series of decisions about how a building behaves. Get the decisions wrong and no amount of model refinement saves you. Get them right and the modelling is almost mechanical.

Here's the workflow I'd run on every project, in the order that catches the most problems with the least rework.

## Step 1 — Separate gravity from lateral before anything else

Before you think about what *resists* lateral load, decide what *carries* gravity. These are different problems and they pull the structure in different directions.

A common mistake on early schemes is letting gravity drive the column grid, then bolting lateral elements onto whatever's left. You end up with cores in the wrong place, transfer beams nobody planned for, and a stability system that fights the gravity system instead of complementing it.

The right sequence:

1. Lock in gravity zones (where can columns live, where can't they)
2. Identify the natural locations for vertical lateral elements (cores, lift shafts, stair walls, party walls)
3. *Then* decide how those elements form a coherent system

If your lateral elements have to do gymnastics to fit around the gravity grid, the architecture is fighting you — flag it now, not at DD.

## Step 2 — Classify the system honestly: single, dual, or hybrid

This is where I see the most fuzzy thinking. Engineers will say "we've got shear walls and frames" without committing to which is doing the work. The code cares about the answer.

| System type | What it means in practice | Code implications |
|---|---|---|
| Single | One system (e.g. shear walls only) resists 100% of lateral load | Cleanest design, simplest detailing requirements |
| Dual | Two systems share lateral load, with the secondary system (typically moment frame) designed to take ≥25% independently | More detailing requirements; the redundancy matters |
| Hybrid | Different systems in different directions, or in different parts of the building | Requires explicit analysis of compatibility and load paths |

The honest version of this step is: model both systems independently and see what each actually attracts. If a "dual" system has a frame picking up 3%, it's a single system with some moment connections. Don't kid yourself in the design report.

## Step 3 — Sketch the load path before the model

Before any analysis, draw the load path by hand. Wind or seismic force enters at every floor diaphragm. Where does it go from there?

For each level, you should be able to point to:

- The diaphragm path (slab in-plane action)
- The vertical element it transfers into
- How that element transfers down to foundation
- Where outriggers, transfer levels, or podium effects break the load path

If you can't sketch this in five minutes on a napkin, the model won't fix the underlying problem. The model will just hide it.

This is the single highest-leverage step in the whole workflow. Most rework I see in peer reviews could have been avoided by spending half an hour on a load path sketch before modelling.

## Step 4 — Choose your modelling approach to match the question

Not every analysis needs the same fidelity. Match the model to what you're trying to learn:

| Stage | Question | Right tool |
|---|---|---|
| Concept | Is the system viable? | Hand calcs, basic ETABS with rigid diaphragms |
| Scheme | What are approximate forces and drifts? | ETABS with key elements modelled, response spectrum for seismic |
| DD | Detailed forces, secondary effects, P-Δ | Full ETABS model, properly cracked sections, accidental torsion |
| Final | Capacity checks, code compliance | Full model with all combinations, link to design tools |

Building the final model at concept stage is a classic time-waster. You spend two days getting fancy and find out the architect moved the core anyway.

## Step 5 — Verify dynamic behaviour before chasing forces

Before looking at member forces, look at how the building wants to move:

- **Periods** — does the building's fundamental period feel right for its height and system? (Rough check: T ≈ 0.1×N seconds for moment frames, less for stiffer systems. If your 30-storey building has T = 8 seconds, something's wrong.)
- **Mode shapes** — are the first two modes translational in the principal directions? Or is mode 1 torsion? Torsion-first is a red flag for layout, not a thing to "design around."
- **Mass participation** — are you capturing ≥90% mass in the first dozen or so modes? If not, you're missing significant behaviour.

These checks take ten minutes and surface system-level problems that no amount of force-chasing will fix.

## Step 6 — Drift, then strength, then detailing

Tall buildings are governed by stiffness first, strength second. Run the workflow in that order:

1. Inter-storey drift under serviceability wind and seismic
2. Strength checks under ULS combinations
3. Detailing for ductility (especially in seismic-controlled regions)

If you're failing drift, adding strength won't help. If you're passing drift but failing strength, detailing is the next conversation. Working out of order means you redesign elements that were never going to govern.

## What this means in practice

The pattern across every project I review: the engineers who hit reviews cleanly aren't smarter or faster — they sequenced their thinking right. They separated gravity from lateral, committed to a system classification, sketched the load path, matched model fidelity to the stage, and checked dynamic behaviour before forces.

The workflow above isn't novel. What's novel is doing it in order, every time, instead of treating ETABS as a substitute for thinking.

For tall buildings especially, the lateral system is the project. Get the workflow right and everything downstream — detailing, coordination, peer review — gets easier. Skip it and you'll be reworking at DD for reasons you could have caught at concept.
