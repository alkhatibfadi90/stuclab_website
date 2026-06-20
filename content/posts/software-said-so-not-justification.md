---
slug: software-said-so-not-justification
title: "\"The Software Said So\" Was Never an Engineering Justification"
date: "2026-06-20"
excerpt: "The model gave a number, the number went in the report, and nobody asked whether it was right. That was a problem before AI. It's a bigger one now."
tags: [AI, practice, analysis-modelling]
readingTime: "5 min read"
seoTitle: "\"The Software Said So\" Is Not an Engineering Justification"
seoDescription: "Why deferring to software output instead of engineering judgement was always a failure of reasoning — and why the habit is more dangerous in the age of AI."
ogImage: /og-image.svg
---

Every reviewer has heard some version of it. You query a result that looks wrong, and the answer comes back: "that's what the model gave." As if the software running is the same thing as the engineering being right. It never was, and the habit of treating a tool's output as its own justification is one of the quieter failures in the profession — one that just got more dangerous.

## Software produces numbers. Engineering produces reasons.

A structural analysis package will give you a number for almost anything you ask it. The number is a consequence of the inputs, the idealisation, the mesh, the assumptions baked into the model — and it is exactly as good as those things and no better. The software has no opinion about whether your model represents a real, buildable structure. It solves the problem you posed, whether or not that's the problem in front of you.

So "the software said so" answers the wrong question. The question is never "did the model produce this number" — of course it did, that's what models do. The question is "is this number right, and do I understand why." Those require an engineer. The output is the start of the reasoning, not a substitute for it.

## The number that looks wrong usually is

The most useful instinct an engineer develops is the one that fires when a result doesn't feel right — a period too long for the building's height, a reaction that doesn't sum, a member force an order of magnitude off what the load suggests. That instinct is pattern recognition built from doing the work, and it exists precisely to catch the cases where the software faithfully computed the wrong thing.

Deferring to "that's what it gave" is the act of overriding that instinct with misplaced trust in the tool. The engineers who get caught aren't the ones who couldn't run the software. They're the ones who saw a number that didn't sit right, and let the fact that a computer produced it talk them out of their own judgement. The tool was working perfectly. It was solving a model that didn't match the building, and only an engineer asking "why" would ever have found that.

## Where the output comes from is the engineer's job to know

Behind every number is a chain: the assumptions, the boundary conditions, the stiffness modifiers, the load path you built in, the idealisations you accepted. Trusting the output means understanding that chain well enough to know where it could be wrong. "The software said so" is, functionally, an admission that the chain wasn't examined — that the number was accepted because it appeared, not because it was understood.

This is why the justification is hollow. It points to the tool as the authority, when the authority in engineering is the reasoning that the tool was used to support. A result you can't explain is a result you haven't checked, regardless of how sophisticated the package that produced it.

## Why this matters more now

This was always true. AI makes it sharper, because AI raises the fluency of the output without raising its reliability in lockstep. A modern tool — analysis package or AI assistant — produces results that are clean, formatted, confident, and plausible whether or not they're correct. The more polished and authoritative the output looks, the stronger the pull to accept it, and the easier it becomes to substitute "the tool produced it" for "I checked it."

"The software said so" is the old version. "The AI said so" is the same failure in newer clothing, and it's more seductive because the output is more articulate. The defence is identical and just as weak: a tool generating a confident answer is not the same as an engineer establishing a correct one. As the tools get more fluent, the discipline of refusing to outsource your judgement to them matters more, not less.

## What this means in practice

The standard is simple to state and harder to hold: you are accountable for every number that goes out under your name, and "the software produced it" transfers none of that accountability to the software. The tool doesn't carry the result — you do.

So treat every output as a claim to be verified, not a fact to be accepted. Know where it came from. Have an independent sense of what the answer should roughly be before you look. When a result surprises you, chase it down rather than rationalising it because a computer said it. And never let the sophistication of the tool stand in for the soundness of the reasoning — they are not the same thing, and the gap between them is exactly where the failures live.

The software said so. That was never the end of the sentence. The engineer's job is everything that comes after it.
