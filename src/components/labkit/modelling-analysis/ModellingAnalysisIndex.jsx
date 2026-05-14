import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box } from 'lucide-react';

// Within a category page, every tool card uses the same category icon.
// For Modelling & Analysis: Box (3D modelling representation).
const CATEGORY_ICON = Box;

const CATEGORIES = [
  {
    title: 'Wall Stiffness Modifier',
    description: 'Cracked-section Ieff for wall elements in ULS elastic analysis — AS 3600 Cl 6.2.4.2 & Table 6.2.4.',
    badge: 'LIVE',
    href: '/labkit/modelling-analysis/wall-stiffness-modifier',
  },
  {
    title: 'Column Stiffness Modifier',
    description: 'Cracked-section Ieff for column elements in ULS elastic analysis — AS 3600 Cl 6.2.4.2 & Table 6.2.4.',
    badge: 'LIVE',
    href: '/labkit/modelling-analysis/column-stiffness-modifier',
  },
];

function ModellingAnalysisIndex() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <section
      id="labkit-modelling-analysis"
      className="section labkit-landing"
      aria-labelledby="labkit-modelling-analysis-title"
    >
      <div className="container">
        <Link to="/labkit" className="labkit-back">← Back to LabKit</Link>

        <div className="section-heading labkit-heading" data-reveal>
          <p className="eyebrow">LabKit · Modelling &amp; Analysis</p>
          <h1 id="labkit-modelling-analysis-title" className="labkit-h1">Modelling &amp; Analysis</h1>
          <p className="section-lead labkit-lead">
            Free helpers for elastic analysis — section properties, stiffness modifiers, and modelling assumptions for structural software.
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

        <p className="labkit-meta">More modelling &amp; analysis tools coming soon.</p>

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

export default ModellingAnalysisIndex;
