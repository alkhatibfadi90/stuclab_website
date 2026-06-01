---
slug: pt-slab-secondary-moments
title: "PT Slabs: The Secondary Moments That Quietly Govern Your Design"
date: "2026-06-01"
excerpt: "In a continuous PT slab, the prestress doesn't just balance load — the supports fight the camber it induces, and that restraint generates moments that survive all the way to your ultimate strength check."
tags: [pt, concrete, high-rise]
readingTime: "5 min read"
seoTitle: "Secondary (Hyperstatic) Moments in PT Slabs — Getting Them Right"
seoDescription: "What secondary moments in post-tensioned slabs are, why they survive to ULS, the load factor that applies, and the double-counting mistake that corrupts capacity checks."
ogImage: /og-image.svg
---

Most engineers can recite that post-tensioning "balances load." Fewer are comfortable with what happens to the prestress moments in a *continuous* slab — and that gap is where secondary moments live. They're routinely misunderstood, occasionally forgotten, and they survive all the way to your ultimate strength check whether or not you accounted for them. The mistakes here aren't conservative; they corrupt the capacity check directly.

## Where the second moment comes from

In a simply supported beam, the moment from prestress at any section is just the force times its eccentricity, P·e — the **primary moment**. Clean and intuitive.

A continuous slab is statically indeterminate, and that changes things. The prestress wants to lift the member into a camber, but the intermediate supports restrain that deformation — they won't let the slab move freely. That restraint generates additional **hyperstatic reactions** at the supports, and those reactions induce their own moments throughout the member. Those are the **secondary moments** (also called hyperstatic or parasitic — same thing, different vocabulary).

So in a continuous PT slab, the total prestress moment at a section is the **primary plus the secondary**. A clean way to extract them falls out of the load-balancing method: the balanced-load analysis gives the total prestress moment, and the secondary moment is simply that total minus P·e.

## The detail people get wrong: secondary moments don't vanish at ULS

There's an intuition that prestress effects are a serviceability concern — that at ultimate, the prestress just becomes tendon force contributing to capacity and the moment effects wash out. That intuition is half right and half dangerous.

The **primary** moment does effectively fold into the capacity side at ULS: the tendon is treated as reinforcement with an initial stress, and its force is part of the section's resistance. You don't add P·e separately to the applied load — doing so double-counts the prestress, because the same tendon can't both apply a load and provide the resistance to it. Prestress is not a sky-hook; the gravity load it was balancing is still there.

The **secondary** moment is different. It's a genuine action effect from real support reactions, and it does *not* disappear at ultimate. It crosses over to the strength combination and adds to the factored load effects. Experimental work on continuous PT beams confirms secondary effects persist to ULS — they don't even vanish after a plastic hinge forms and the structural system changes.

So the rule, stated cleanly:

- At ULS, **include the secondary (hyperstatic) moment** as an applied action, combined with the factored gravity moments.
- At ULS, **do not add the primary P·e moment** separately — the prestress force is in the section capacity.

Getting this backwards — adding the primary, dropping the secondary — gives you a capacity check that looks complete and is quietly wrong.

## The load factor

Because the secondary moment is a real action effect, it goes into the ULS combination — but at its own factor. In AS 3600 practice (consistent with ACI), the hyperstatic action is applied at a **load factor of 1.0** at the strength limit state, alongside the factored gravity actions:

> factored dead + factored live + 1.0 × secondary (hyperstatic)

The 1.0 reflects that the secondary moment is a determinate consequence of the prestress geometry and force — calculable, not a variable load you'd factor up for uncertainty. It's added at face value.

## Don't assume it's small

It's tempting to treat secondary moments as a minor correction. They can be small, but not reliably — on a heavily restrained, fully balanced slab they can become a substantial fraction of the primary moment and shift the governing section. The magnitude is driven by span and support arrangement (more redundancy, more restraint), tendon profile, and prestress force. "Small enough to ignore" is something you check, not assume.

One elegant special case: a **concordant tendon** profile produces zero secondary moment, because the tendon follows a line that induces no support reactions. Most practical profiles aren't concordant, so in most real slabs the secondary moments are there — concordance is a concept to understand, not a default to assume.

## What this means in practice

For a continuous PT slab, the secondary moments aren't an optional refinement — they're an action effect that has to reach the strength check:

1. **Compute them properly.** Run load balancing and extract the secondary moment as the total prestress moment minus P·e. Software (RAM Concept, ADAPT) gives it directly, but know what the number means rather than trusting a label.
2. **Combine correctly at ULS.** Add the secondary moment to the factored gravity actions at a factor of 1.0. Do *not* add the primary P·e separately — the tendon force is in the capacity.
3. **Check the magnitude.** Don't assume negligible; it can shift where the design governs.

The trap is treating prestress as a single "PT effect" that either helps you by balancing load or sits in the serviceability check and goes away at ultimate. It doesn't go away. The primary moment folds into capacity; the secondary moment crosses to ULS as a real applied action. Knowing which does which is the difference between a PT design that's actually checked and one that just looks like it is.
