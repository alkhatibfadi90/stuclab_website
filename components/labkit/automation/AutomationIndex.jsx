import Link from 'next/link';
import { Terminal } from 'lucide-react';

// Within a category page, every tool card uses the same category icon.
// For Automation: Terminal.
const CATEGORY_ICON = Terminal;

const CATEGORIES = [
  {
    title: 'Load Combination Generator',
    description: 'AS/NZS 1170.0 strength, stability and serviceability combinations with Table 4.1 ψ factors — ready to copy or export to CSV.',
    badge: 'LIVE',
    href: '/labkit/automation/load-combinations',
  },
];

function AutomationIndex() {
  return (
    <section
      id="labkit-automation"
      className="section labkit-landing"
      aria-labelledby="labkit-automation-title"
    >
      <div className="container">
        <Link href="/labkit" className="labkit-back">← Back to LabKit</Link>

        <div className="section-heading labkit-heading" data-reveal>
          <p className="eyebrow">LabKit · Automation</p>
          <h1 id="labkit-automation-title" className="labkit-h1">Automation</h1>
          <p className="section-lead labkit-lead">
            Generators and utilities that automate repetitive engineering data work.
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

        <p className="labkit-meta">More automation tools coming soon.</p>

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

export default AutomationIndex;
