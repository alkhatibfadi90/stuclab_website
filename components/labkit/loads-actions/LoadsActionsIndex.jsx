import Link from 'next/link';
import { Wind } from 'lucide-react';

// Within a category page, every tool card uses the same category icon.
// For Loads & Actions: Wind.
const CATEGORY_ICON = Wind;

const CATEGORIES = [
  {
    title: 'Load Takedown',
    description: 'Gravity load takedown for a single column to AS/NZS 1170 — cumulative G & Q with live-load area reduction.',
    badge: 'LIVE',
    href: '/labkit/loads-actions/load-takedown',
  },
  {
    title: 'Load Takedown — Multi-Column',
    description: 'Run a gravity load takedown for multiple columns from one floor schedule to AS/NZS 1170.',
    badge: 'LIVE',
    href: '/labkit/loads-actions/load-takedown-multi',
  },
  {
    title: 'Seismic Lateral',
    description: 'Equivalent static seismic analysis to AS 1170.4:2024 — base shear, vertical distribution, and accidental torsion.',
    badge: 'LIVE',
    href: '/labkit/loads-actions/seismic-lateral',
  },
  {
    title: 'P-Delta Stability',
    description: 'Inter-storey P-delta stability coefficient θ to AS 1170.4:2024 Cl 6.7.3 — amplification factor and verdict per storey.',
    badge: 'LIVE',
    href: '/labkit/loads-actions/pdelta-stability',
  },
];

function LoadsActionsIndex() {
  return (
    <section
      id="labkit-loads-actions"
      className="section labkit-landing"
      aria-labelledby="labkit-loads-actions-title"
    >
      <div className="container">
        <Link href="/labkit" className="labkit-back">← Back to LabKit</Link>

        <div className="section-heading labkit-heading" data-reveal>
          <p className="eyebrow">LabKit · Loads &amp; Actions</p>
          <h1 id="labkit-loads-actions-title" className="labkit-h1">Loads &amp; Actions</h1>
          <p className="section-lead labkit-lead">
            Free structural loading tools to AS/NZS 1170 — gravity load takedowns, combinations, and actions.
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

        <p className="labkit-meta">More loads &amp; actions tools coming soon.</p>

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

export default LoadsActionsIndex;
