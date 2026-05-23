import Link from 'next/link';
import {
  BookOpen,
  Box,
  Columns3,
  Frame,
  Terminal,
  Wind,
} from 'lucide-react';
import Sidebar from './insights/Sidebar';

export const LABKIT_CATEGORIES = [
  {
    title: 'Loads & Actions',
    description: 'Wind, seismic, and load combinations to AS/NZS 1170.',
    badge: '4 tools',
    Icon: Wind,
    href: '/labkit/loads-actions',
  },
  {
    title: 'Concrete Design',
    description: 'Member design, cover, and detailing to AS 3600.',
    badge: '3 tools',
    Icon: Columns3,
    href: '/labkit/concrete',
  },
  {
    title: 'Steel Design',
    description: 'Member capacity and connections to AS 4100.',
    badge: 'Coming soon',
    Icon: Frame,
  },
  {
    title: 'Modelling & Analysis',
    description: 'Section properties, stiffness modifiers, and modelling assumptions for elastic analysis.',
    badge: '2 tools',
    Icon: Box,
    href: '/labkit/modelling-analysis',
  },
  {
    title: 'Detailing & Reference',
    description: 'Reo schedules, bolt lookups, and code references.',
    badge: 'Coming soon',
    Icon: BookOpen,
  },
  {
    title: 'Productivity & Automation',
    description: 'Unit converters, ETABS helpers, and Python snippets.',
    badge: 'Coming soon',
    Icon: Terminal,
  },
];

function LabKit() {
  return (
    <section id="labkit" className="section labkit-landing" aria-labelledby="labkit-title">
      <div className="container">
        <div className="page-with-sidebar">
          <div className="page-main">
            <div className="section-heading labkit-heading" data-reveal>
              <p className="eyebrow">Free Engineering Tools</p>
              <h1 id="labkit-title" className="labkit-h1 labkit-page-title">LabKit</h1>
              <p className="section-lead labkit-lead">
                Free calculators and utilities for practicing structural engineers.
                Built around Australian Standards.
              </p>
            </div>

            <div className="labkit-grid">
              {LABKIT_CATEGORIES.map(({ title, description, badge, Icon, href }) => {
                const cardInner = (
                  <>
                    <div className="labkit-card-icon" aria-hidden="true">
                      <Icon size={36} color="var(--brand-gold)" strokeWidth={1.5} />
                    </div>
                    <div className="labkit-card-body">
                      <h3 className="labkit-card-title">{title}</h3>
                      <p className="labkit-card-desc">{description}</p>
                      <span className="labkit-card-badge">{badge}</span>
                    </div>
                  </>
                );

                if (href) {
                  return (
                    <Link
                      className="labkit-card labkit-card-link"
                      href={href}
                      key={title}
                      data-reveal
                    >
                      {cardInner}
                    </Link>
                  );
                }

                return (
                  <article className="labkit-card" key={title} data-reveal aria-disabled="true">
                    {cardInner}
                  </article>
                );
              })}
            </div>

            <p className="labkit-meta">More tools added regularly.</p>

            <aside className="labkit-disclaimer" role="note" data-reveal>
              <p className="labkit-disclaimer-label">Disclaimer</p>
              <p className="labkit-disclaimer-body">
                All tools provided by StrucLab are for educational and indicative
                purposes only. Results must be independently verified by a qualified
                engineer. Use of these tools does not create an engineer-client
                relationship and StrucLab accepts no liability for design decisions
                made using them.
              </p>
            </aside>
          </div>

          <Sidebar variant="labkit" />
        </div>
      </div>
    </section>
  );
}

export default LabKit;
