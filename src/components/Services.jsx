import {
  Blocks,
  Bot,
  GraduationCap,
  HardHat,
  SearchCheck,
  Waypoints,
} from 'lucide-react';

const services = [
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
      'ETABS and structural modelling guidance',
      'Engineering scripting and computational workflows training',
    ],
    Icon: GraduationCap,
  },
];

function Services() {
  return (
    <section id="services" className="section" aria-labelledby="services-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">What We Offer</p>
          <h2 id="services-title">Services</h2>
          <p className="section-lead">
            Technically rigorous engineering support across design, analysis, review, and digital engineering.
          </p>
        </div>

        <div className="services-grid">
          {services.map(({ title, description, points, Icon }) => (
            <article className="service-card" key={title} data-reveal>
              <div className="service-card-top">
                <div className="service-icon" aria-hidden="true">
                  <Icon size={34} strokeWidth={2} />
                </div>
                <h3 className="service-title">{title}</h3>
                <p className="service-desc">{description}</p>
              </div>
              <ul className="service-points">
                {points.map((point) => (
                  <li key={point}>
                    <span className="service-point-bullet" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
