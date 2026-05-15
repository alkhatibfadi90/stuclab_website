import Link from 'next/link';
import { Square } from 'lucide-react';

// Within a category page, every tool card uses the same category icon.
// For Concrete: Square (column cross-section).
const CATEGORY_ICON = Square;

const CATEGORIES = [
  {
    title: 'Concrete Column Punching',
    description: 'Biaxial punching shear check at slab–column connections to AS 3600 Cl 9.3.',
    badge: 'LIVE',
    href: '/labkit/concrete/column-punching',
  },
  {
    title: 'Cover & Durability Selector',
    description: 'AS 3600 Section 4 cover requirements lookup.',
    badge: 'Coming soon',
  },
  {
    title: 'Beam Capacity Check',
    description: 'Flexural and shear capacity check to AS 3600 Cl 8 & 9.',
    badge: 'Coming soon',
  },
];

function ConcreteIndex() {
  return (
    <section
      id="labkit-concrete"
      className="section labkit-landing"
      aria-labelledby="labkit-concrete-title"
    >
      <div className="container">
        <Link href="/labkit" className="labkit-back">← Back to LabKit</Link>

        <div className="section-heading labkit-heading" data-reveal>
          <p className="eyebrow">LabKit · Concrete Design</p>
          <h1 id="labkit-concrete-title" className="labkit-h1">Concrete Design</h1>
          <p className="section-lead labkit-lead">
            Free design and analysis tools for reinforced and prestressed concrete to AS 3600.
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

        <p className="labkit-meta">More concrete tools coming soon.</p>

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

export default ConcreteIndex;
