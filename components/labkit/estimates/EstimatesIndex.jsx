import Link from 'next/link';
import { BookOpen } from 'lucide-react';

// Within a category page, every tool card uses the same category icon.
// For Estimates & Quantities: BookOpen (matches the LabKit landing card).
const CATEGORY_ICON = BookOpen;

const CATEGORIES = [
  {
    title: 'Pad Footing Reo Rate',
    description: 'Reinforcement rate estimator for an isolated pad footing — kg/m² and kg/m³ from geometry and bar layout, with a live section sketch.',
    badge: 'LIVE',
    href: '/labkit/estimates/pad-footing-reo',
  },
  {
    title: 'Beam Reo Rate',
    description: 'Reinforcement rate estimator for a rectangular or T-beam — kg/m³ from a bar schedule and ties, with a live section sketch.',
    badge: 'LIVE',
    href: '/labkit/estimates/beam-reo',
  },
  {
    title: 'Column Reo Rate',
    description: 'Reinforcement rate estimator for rectangular, square or circular columns — kg/m³ with and without ties, with a live section sketch.',
    badge: 'LIVE',
    href: '/labkit/estimates/column-reo',
  },
];

function EstimatesIndex() {
  return (
    <section
      id="labkit-estimates"
      className="section labkit-landing"
      aria-labelledby="labkit-estimates-title"
    >
      <div className="container">
        <Link href="/labkit" className="labkit-back">← Back to LabKit</Link>

        <div className="section-heading labkit-heading" data-reveal>
          <p className="eyebrow">LabKit · Estimates &amp; Quantities</p>
          <h1 id="labkit-estimates-title" className="labkit-h1">Estimates &amp; Quantities</h1>
          <p className="section-lead labkit-lead">
            Reinforcement rate and material quantity estimating tools for concrete elements.
          </p>
        </div>

        <div className="labkit-grid">
          {CATEGORIES.map(({ title, description, badge, href }) => {
            const cardInner = (
              <>
                <div className="labkit-card-icon" aria-hidden="true">
                  <CATEGORY_ICON size={24} color="var(--brand-gold)" strokeWidth={1.5} />
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
                <a
                  className="labkit-card labkit-card-link"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={title}
                  data-reveal
                >
                  {cardInner}
                </a>
              );
            }

            return (
              <article className="labkit-card" key={title} data-reveal aria-disabled="true">
                {cardInner}
              </article>
            );
          })}
        </div>

        <p className="labkit-meta">More estimating tools coming soon.</p>

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
    </section>
  );
}

export default EstimatesIndex;
