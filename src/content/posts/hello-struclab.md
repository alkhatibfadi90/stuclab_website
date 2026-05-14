## Why we started Insights

StrucLab Insights is where we'll share short, practical writing on the kind
of problems we work on every day: reinforced and post-tensioned concrete,
lateral systems, advanced analysis in **ETABS** and **SAFE**, and the Python
and parametric workflows that tie it all together.

The aim isn't to rewrite the code — there are plenty of references for that.
The aim is to share the small judgement calls, the modelling shortcuts, and
the automation patterns that don't show up in the standards.

## What to expect

- Worked examples (concrete punching, transfer structures, lateral checks)
- ETABS and SAFE modelling notes
- Python snippets for routine post-processing
- Short opinions on workflow and review practice

## A taste of automation

Most of our automation work starts from a familiar place — pulling joint
reactions or pier forces out of an analysis model. Here's a minimal pattern
we use a lot:

```python
import pandas as pd

def summarise_pier_forces(df: pd.DataFrame) -> pd.DataFrame:
    """Return min/max P, V, M envelopes per pier across all load cases."""
    grouped = df.groupby("Pier")
    envelope = pd.concat(
        [grouped[["P", "V2", "M3"]].min().add_suffix("_min"),
         grouped[["P", "V2", "M3"]].max().add_suffix("_max")],
        axis=1,
    )
    return envelope.round(1)
```

It's not glamorous, but five lines of pandas replaces an afternoon of
spreadsheet pivoting — and it's the same five lines on every project.

## What's next

New posts will land here as we write them. If there's a topic you'd like
us to dig into, [get in touch](/#contact).
