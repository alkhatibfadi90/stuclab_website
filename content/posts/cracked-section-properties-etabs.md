---
slug: cracked-section-properties-etabs
title: "Cracked Section Properties in ETABS — What Most Engineers Get Wrong"
date: "2026-05-22"
excerpt: "Applying 0.7 to all columns and 0.35 to all walls and moving on is the most common stiffness-modifier mistake I see — and the one with the biggest downstream consequences."
tags: [etabs, methodology, high-rise]
readingTime: "8 min read"
seoTitle: "Cracked Section Properties in ETABS — A Practical Guide"
seoDescription: "How to set cracked-section stiffness modifiers correctly in ETABS instead of defaulting to 0.7/0.35 everywhere."
ogImage: /og-image.svg
---

The stiffness modifier section in ETABS is one of those screens where engineers click through quickly because they "know what to put." That confidence is misplaced.

The standard answer — 0.7 for columns, 0.35 for beams and walls — comes from ACI 318 and gets applied uniformly across the model. It's not wrong, exactly. But it treats a nuanced behavioural problem as a fill-in-the-blank exercise, and the consequences show up everywhere downstream: in periods, drifts, force distribution, and ultimately in reinforcement that's either uneconomical or unsafe.

Here are the four things I see consistently mishandled in cracked section assignment, and what to do instead.

## 1. Applying cracked properties uniformly to everything

The most common mistake. The engineer opens section modifiers, sets walls to 0.35, columns to 0.7, beams to 0.35, hits OK, and never thinks about it again.

The problem: code values represent **lower-bound member stiffness** to capture the response after cracking. But not every member cracks. A perimeter gravity column with no flexural demand and high axial compression doesn't crack the way a coupling beam over a doorway does. Treating them identically distorts the load path.

In a typical high-rise:

- **Core walls in upper stories** often remain uncracked under service loads — the lower flexural demand and high axial compression keep them in the uncracked range
- **Walls in lower stories** crack under lateral load and need the full reduction
- **Coupling beams** crack severely and may need values lower than 0.35
- **Gravity-only frame columns** rarely crack and could carry near-gross stiffness for axial behaviour

If your stiffness model doesn't reflect this gradient, you're not modelling the real building — you're modelling the worst-case version of every element simultaneously. That makes the structure attract load patterns that wouldn't actually occur.

The senior version of this step: apply cracked properties **where cracking is expected at the limit state being analysed**, not as a blanket setting.

## 2. Confusing serviceability and strength contexts

Cracked section properties serve two distinct purposes, and the right values differ:

| Analysis purpose | Stiffness assumption | Why |
|---|---|---|
| Serviceability drift (wind, EQ) | Cracked (code values) | We want realistic deflections; concrete will crack at SLS |
| Strength design (ULS) | Cracked, but consider iteration | Force distribution depends on relative stiffness — must match cracking pattern at ULS |
| Period and base shear (seismic) | Cracked | Lengthens period, affects spectral acceleration — but check ASCE 7 scaling rules |
| Foundation reactions (gravity) | Closer to gross | Cracking minimal under gravity-only loads |

Engineers will run one model with one set of modifiers and pull all four outputs from it. That's a shortcut that can produce inconsistent, sometimes unconservative, results.

The cleaner workflow is two models — one for service/drift checks, one for strength. Or one model with multiple analysis cases that re-apply modifiers appropriately. Either way: the modifier assumption needs to match the question being asked.

## 3. Ignoring the wall stiffness directionality problem

This one is subtle and almost never caught in junior modelling.

Shear walls in ETABS use shell stiffness modifiers — `f11`, `f22`, `f12` for in-plane, `m11`, `m22`, `m12` for out-of-plane. The default approach is to apply the same reduction (e.g. 0.35) to everything.

But walls don't crack uniformly in all directions:

- **In-plane bending stiffness** drops most dramatically when the wall cracks under lateral load
- **In-plane axial stiffness** (compression direction) is barely affected by cracking
- **Out-of-plane stiffness** depends on whether the wall has out-of-plane demand at all

Setting `f22` (vertical/axial stiffness in a typical wall orientation) to 0.35 along with `f11` (horizontal in-plane bending) implies the wall's compression capacity is 35% of gross — which it isn't. This over-softens the wall's gravity behaviour and shifts gravity load to columns that may not have been designed to take it.

Take a few extra minutes per project to think through which stiffness component represents what behaviour, and which actually needs reducing.

## 4. Skipping the cracking verification step

ACI 318 commentary requires a second iteration if the first analysis shows tension exceeding the modulus of rupture. Almost nobody does this.

The process should be:

1. Run analysis with initial modifiers
2. Check which elements actually exceed cracking moment under factored loads
3. Re-run with reduced modifiers applied only to those elements
4. Verify that the new force distribution matches what the reinforcement is being designed for

Skipping step 2 and 3 means you're guessing at the cracked extent. For low-rise buildings this rarely matters. For 30+ storey towers with mixed core-and-frame systems, it can produce wall shears that are 20–30% off, which propagates into under-reinforced critical elements.

This iteration takes minutes once the model is set up. The value is in catching the case where lower-storey walls crack far more than your initial assumption — and need correspondingly more reinforcement.

## What this means in practice

The pattern: most engineers treat cracked sections as a check-box, applying default values uniformly and moving on. That's fine for a sketch-design model on a low-rise building. For anything with meaningful lateral demand, it's a quiet source of error that flows through every downstream output.

The senior approach is to treat stiffness modifiers as a **modelling decision tied to behaviour**, not a code lookup. That means:

- Different modifiers for different parts of the same building, based on expected cracking
- Different modifiers for different analysis purposes (service vs strength)
- Directional thinking on wall shells, not blanket reductions
- One iteration of cracking verification before locking in the model

None of this is exotic. It's just doing the analysis the way the code actually intends, rather than the way the dropdown defaults invite you to do it.

If your ETABS models are using identical modifier values everywhere and you've never iterated on them, that's the first place to start the next time you open a high-rise model. The improvements in force distribution accuracy — and downstream reinforcement economy — typically pay for the analysis time many times over.

---

**Related tools:** explore the [modelling and analysis utilities in LabKit](/labkit/modelling-analysis) for practical helpers on stiffness assignment, model setup, and ETABS workflows.
