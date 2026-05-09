import { useEffect } from 'react';
import {
  BookOpen,
  Box,
  Columns3,
  Frame,
  Terminal,
  Wind,
} from 'lucide-react';

const TOOLKIT_CATEGORIES = [
  {
    title: 'Loads & Actions',
    description: 'Wind, seismic, and load combinations to AS/NZS 1170.',
    badge: 'Coming soon',
    Icon: Wind,
  },
  {
    title: 'Concrete Design',
    description: 'Member design, cover, and detailing to AS 3600.',
    badge: 'Coming soon',
    Icon: Columns3,
  },
  {
    title: 'Steel Design',
    description: 'Member capacity and connections to AS 4100.',
    badge: 'Coming soon',
    Icon: Frame,
  },
  {
    title: 'Analysis & Modelling',
    description: 'Section properties and analysis helpers.',
    badge: 'Coming soon',
    Icon: Box,
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

function Toolkit() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <section id="toolkit" className="section toolkit-page" aria-labelledby="toolkit-title">
      <div className="container">
        <div className="section-heading toolkit-heading" data-reveal>
          <p className="eyebrow">Free Engineering Tools</p>
          <h1 id="toolkit-title" className="toolkit-h1">Toolkit</h1>
          <p className="section-lead toolkit-lead">
            Free calculators and utilities for practicing structural engineers.
            Built around Australian Standards.
          </p>
        </div>

        <div className="toolkit-grid">
          {TOOLKIT_CATEGORIES.map(({ title, description, badge, Icon }) => (
            <article className="toolkit-card" key={title} data-reveal aria-disabled="true">
              <div className="toolkit-card-icon" aria-hidden="true">
                <Icon size={30} strokeWidth={2} />
              </div>
              <h3 className="toolkit-card-title">{title}</h3>
              <p className="toolkit-card-desc">{description}</p>
              <span className="toolkit-card-badge">{badge}</span>
            </article>
          ))}
        </div>

        <p className="toolkit-meta">More tools added regularly.</p>

        <aside className="toolkit-disclaimer" role="note" data-reveal>
          <p className="toolkit-disclaimer-label">Disclaimer</p>
          <p className="toolkit-disclaimer-body">
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

export default Toolkit;
