import {
  Blocks,
  Bot,
  BriefcaseBusiness,
  Clock3,
  Compass,
  Cpu,
  GraduationCap,
  HardHat,
  Layers2,
  SearchCheck,
  ShieldCheck,
  Waypoints,
} from 'lucide-react';

export const SECTION_IDS = ['home', 'about', 'services', 'expertise', 'contact'];

export const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Expertise', id: 'expertise' },
  { label: 'Contact', id: 'contact' },
];

export const ABOUT_STATS = [
  { target: 15, suffix: '+', label: 'Years Experience', Icon: Clock3 },
  { target: 40, suffix: '+', label: 'Projects Delivered / Contributed', Icon: BriefcaseBusiness },
  { target: 20, suffix: '+', label: 'Professional Training Programs', Icon: GraduationCap },
  { target: 100, suffix: '%', label: 'Engineering-Focused Solutions', Icon: ShieldCheck },
];

export const SERVICES = [
  {
    title: 'Structural Design Support',
    description:
      'Support to consulting engineers and project teams in the design and delivery of structural systems for building projects.',
    points: [
      'Concrete and steel member design',
      'Slab, column, wall, and transfer structure design support',
      'Coordination with design teams during project delivery',
    ],
    Icon: Blocks,
  },
  {
    title: 'Design Review & Independent Checking',
    description:
      'Independent structural review to verify design compliance, improve efficiency, and identify potential risks early in the project.',
    points: [
      'Independent structural design verification',
      'Value engineering and optimisation review',
      'Constructability and coordination assessment',
    ],
    Icon: SearchCheck,
  },
  {
    title: 'Structural Analysis & Advanced Modelling',
    description:
      'Advanced structural analysis and modelling to assess complex structural behaviour and support critical design decisions.',
    points: [
      'Finite element modelling and advanced analysis',
      'Lateral system and global stability assessment',
      'Nonlinear and performance-based studies',
    ],
    Icon: Waypoints,
  },
  {
    title: 'Structural Assessment & Investigations',
    description:
      'Assessment of existing structures and investigation of structural issues to support remediation, refurbishment, or safety evaluation.',
    points: [
      'Structural condition assessments',
      'Investigation of cracking and structural defects',
      'Capacity assessment of existing structures',
    ],
    Icon: HardHat,
  },
  {
    title: 'Engineering Automation & Digital Tools',
    description:
      'Development of computational tools and automated workflows to improve structural design efficiency and engineering productivity.',
    points: [
      'Structural design automation tools',
      'Parametric modelling and scripting workflows',
      'Engineering calculation and design optimisation tools',
    ],
    Icon: Bot,
  },
  {
    title: 'Training & Technical Mentoring',
    description:
      'Technical training and mentoring for engineers and teams in structural design principles, analysis methods, and digital engineering tools.',
    points: [
      'Structural design and analysis training',
      'CSI ETABS, SAFE, SAP2000, RAMConcept, Python, Parametric Modelling',
      'Engineering scripting and computational workflows training',
    ],
    Icon: GraduationCap,
  },
];

export const EXPERTISE_ITEMS = [
  {
    label: 'Reinforced Concrete Structures',
    image: '/assets/expertise/reinforced-concrete-structures.jpg',
  },
  {
    label: 'Post Tensioned Concrete Structures',
    image: '/assets/expertise/post-tensioned-concrete-structures.jpg',
  },
  {
    label: 'Steel Structures',
    image: '/assets/expertise/steel-structures.jpg',
  },
  {
    label: 'High-rise / Complex Structures',
    image: '/assets/expertise/high-rise-complex-structures.png',
  },
  {
    label: 'Structural Retrofit and Strengthening',
    image: '/assets/expertise/structural-assessment-and-investigation.jpg',
  },
  {
    label: 'Seismic and Wind Design',
    image: '/assets/expertise/seismic-and-wind-design.png',
  },
  {
    label: 'Advance Structural Analysis',
    image: '/assets/expertise/advanced-structural-analysis.jpg',
  },
  {
    label: 'Structural Optimization and Automation',
    image: '/assets/expertise/structural-optimization-and-automation.jpeg',
  },
];

export const PROFESSIONAL_CREDENTIALS = [
  {
    title: 'APEC IntPE(Aus)',
    organization: 'ENGINEERS AUSTRALIA',
    image: '/assets/credentials/apec-intpe-aus.webp',
  },
  {
    title: 'CPEng Chartered Engineer',
    organization: 'ENGINEERS AUSTRALIA',
    image: '/assets/credentials/cpeng-chartered-engineer.png',
  },
  {
    title: 'NER Registred Engineer',
    organization: 'ENGINEERS AUSTRALIA',
    image: '/assets/credentials/ner-registred-engineer.png',
  },
  {
    title: 'MIEAus Full Member',
    organization: 'ENGINEERS AUSTRALIA',
    image: '/assets/credentials/mieaus-full-member.png',
  },
];

export const WHY_CHOOSE_US_REASONS = [
  {
    title: 'Technical Depth',
    text: 'Strong technical background combining industry experience with advanced structural engineering research.',
    Icon: ShieldCheck,
  },
  {
    title: 'Practical Engineering',
    text: 'Focus on practical, buildable structural solutions suited to real project conditions.',
    Icon: Layers2,
  },
  {
    title: 'Flexible Support',
    text: 'Engineering support can be provided to project teams on a flexible basis depending on project needs.',
    Icon: Compass,
  },
  {
    title: 'Efficiency Focus',
    text: 'Use of computational tools and automation to improve design efficiency and reduce engineering time.',
    Icon: Cpu,
  },
];
