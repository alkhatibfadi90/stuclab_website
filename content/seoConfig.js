export const SITE_URL = 'https://www.struclab.com.au';

export const staticRoutes = {
  '/': {
    title: 'StrucLab — Structural & Computational Engineering',
    description: 'Structural engineering training, automation, and specialist analysis support across Australia. High-rise, ETABS, post-tensioned concrete, lateral systems, and Python automation.',
  },
  '/labkit': {
    title: 'LabKit — Structural Engineering Tools',
    description: 'Practical engineering tools for concrete, steel, lateral systems, and modelling workflows.',
  },
  '/labkit/concrete': {
    title: 'Concrete Tools — LabKit',
    description: 'Concrete design and detailing tools, starting with column punching shear checks.',
  },
  '/labkit/concrete/column-punching': {
    title: 'Column Punching Shear Calculator',
    description: 'Punching shear check for concrete flat slabs at column locations. Interactive tool — adjust geometry, reinforcement, and loads.',
  },
  '/labkit/concrete/column-punching-bulk': {
    title: 'Column Punching Shear — Bulk Check (AS 3600)',
    description: 'Check punching shear for multiple concrete columns at once to AS 3600:2018 Cl 9.3. Paste a column schedule from Excel; biaxial moments, ties, and shear heads supported. Free StrucLab LabKit tool.',
  },
  '/labkit/concrete/pad-footing': {
    title: 'Isolated Pad Footing Check (AS 3600)',
    description: 'Free preliminary pad footing check to AS 3600:2018 — bearing, one-way shear, punching shear and flexure for an isolated spread footing. StrucLab LabKit.',
  },
  '/labkit/concrete/development-length': {
    title: 'Rebar Development Length & Lap Splice (AS 3600)',
    description: 'Free rebar development length and lap splice calculator to AS 3600:2018 Cl 13.1.2 / 13.2.2 — basic length, hook/cog, and tension lap with all k-factors. StrucLab LabKit.',
  },
  '/labkit/concrete/cover-exposure': {
    title: 'Concrete Cover & Exposure Classification (AS 3600)',
    description: 'Free concrete cover calculator to AS 3600:2018 Cl 4.10.3 — required cover for corrosion protection by exposure classification and grade, including cast-against-ground adjustments. StrucLab LabKit.',
  },
  '/labkit/loads-actions': {
    title: 'Loads & Actions — LabKit',
    description: 'Free structural loading tools to AS/NZS 1170 — gravity load takedowns, combinations, and actions. By StrucLab.',
  },
  '/labkit/loads-actions/load-takedown': {
    title: 'Gravity Load Takedown (AS/NZS 1170)',
    description: 'Free column gravity load takedown to AS/NZS 1170.0 & 1170.1. Accumulates G and Q floor-by-floor with live-load area reduction and load combinations. StrucLab LabKit.',
  },
  '/labkit/loads-actions/load-takedown-multi': {
    title: 'Load Takedown — Multi-Column (AS/NZS 1170)',
    description: 'Run a gravity load takedown for multiple columns from one floor schedule, to AS/NZS 1170. Per-column footing reactions with live-load area reduction. StrucLab LabKit.',
  },
  '/labkit/loads-actions/seismic-lateral': {
    title: 'Seismic Lateral Loads (AS 1170.4:2024)',
    description: 'Free equivalent static seismic analysis to AS 1170.4:2024 — seismic weight, base shear, vertical force distribution and accidental torsion. Encoded spectral shape factors and hazard values. StrucLab LabKit.',
  },
  '/labkit/loads-actions/pdelta-stability': {
    title: 'P-Delta Stability Coefficient (AS 1170.4:2024)',
    description: 'Free inter-storey P-delta stability check to AS 1170.4:2024 Cl 6.7.3. Computes the stability coefficient θ per storey from an ETABS schedule, with amplification factor and verdict. StrucLab LabKit.',
  },
  '/labkit/modelling-analysis': {
    title: 'Modelling & Analysis Tools — LabKit',
    description: 'Modelling helpers for ETABS — stiffness modifiers, cracked section properties, lateral system workflows.',
  },
  '/labkit/modelling-analysis/wall-stiffness-modifier': {
    title: 'Wall Stiffness Modifier Calculator',
    description: 'Cracked-section wall stiffness modifier for ETABS, computed from geometry and demand instead of a blanket 0.35.',
  },
  '/labkit/modelling-analysis/column-stiffness-modifier': {
    title: 'Column Stiffness Modifier Calculator',
    description: 'Column stiffness modifier tool for ETABS modelling — tension, compression, and uncracked cases instead of a blanket 0.7.',
  },
  '/labkit/automation': {
    title: 'Automation — LabKit',
    description: 'Generators and utilities that automate repetitive structural engineering data work. By StrucLab.',
  },
  '/labkit/automation/load-combinations': {
    title: 'Load Combination Generator (AS/NZS 1170.0)',
    description: 'Free load combination generator to AS/NZS 1170.0 — strength, stability and serviceability combinations with Table 4.1 ψ factors, ready to copy or export to CSV. StrucLab LabKit.',
  },
  '/labkit/estimates': {
    title: 'Estimates & Quantities — LabKit',
    description: 'Reinforcement rate and material quantity estimating tools for concrete elements. By StrucLab.',
  },
  '/labkit/estimates/pad-footing-reo': {
    title: 'Pad Footing Reinforcement Rate Calculator',
    description: 'Free pad footing reinforcement rate estimator — kg/m² and kg/m³ from geometry and bar layout, with a live section sketch. StrucLab LabKit.',
  },
  '/labkit/estimates/beam-reo': {
    title: 'Beam Reinforcement Rate Calculator',
    description: 'Free beam reinforcement rate estimator — kg/m³ from a bar schedule and ties for rectangular or T-beam sections, with a live section sketch. StrucLab LabKit.',
  },
  '/labkit/estimates/column-reo': {
    title: 'Column Reinforcement Rate Calculator',
    description: 'Free column reinforcement rate estimator — kg/m³ with and without ties for rectangular, square or circular columns, with a live section sketch. StrucLab LabKit.',
  },
  '/insights': {
    title: 'Insights — Structural Engineering Writing',
    description: 'Short, practical writing on concrete and steel design, lateral systems, advanced analysis, and Python workflows for structural engineers.',
  },
};
