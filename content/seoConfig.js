export const SITE_URL = 'https://www.struclab.com.au';

export const staticRoutes = {
  '/': {
    title: 'StrucLab — Structural & Computational Engineering | Fadi Al-Khatib, PhD, CPEng',
    description: 'Structural engineering training, automation, and specialist analysis support across Australia. Led by Fadi Al-Khatib, PhD, CPEng — high-rise, ETABS, post-tensioned concrete, lateral systems, and Python automation.',
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
  '/insights': {
    title: 'Insights — Structural Engineering Writing',
    description: 'Short, practical writing on concrete and steel design, lateral systems, advanced analysis, and Python workflows for structural engineers.',
  },
};
