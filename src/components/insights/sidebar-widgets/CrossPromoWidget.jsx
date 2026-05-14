import { Link } from 'react-router-dom';
import { posts } from '../../../content/postsManifest';
import { LABKIT_CATEGORIES } from '../../LabKit';

function parseToolCount(badge) {
  if (!badge) return 0;
  const match = String(badge).match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function formatShortDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function CrossPromoWidget({ mode }) {
  if (mode === 'labkit') {
    const top = LABKIT_CATEGORIES
      .map((c) => ({ ...c, count: parseToolCount(c.badge) }))
      .filter((c) => c.href && c.count > 0)
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
      .slice(0, 3);

    return (
      <section className="sidebar-widget" aria-labelledby="sidebar-from-labkit">
        <p id="sidebar-from-labkit" className="eyebrow sidebar-widget-eyebrow">
          From LabKit
        </p>
        {top.length > 0 && (
          <ul className="sidebar-widget-list">
            {top.map((c) => (
              <li key={c.title}>
                <Link to={c.href} className="sidebar-widget-cross-link">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link to="/labkit" className="sidebar-widget-link">
          Explore all tools →
        </Link>
      </section>
    );
  }

  // mode === 'insights'
  const recent = [...posts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <section className="sidebar-widget" aria-labelledby="sidebar-from-insights">
      <p id="sidebar-from-insights" className="eyebrow sidebar-widget-eyebrow">
        From Insights
      </p>
      {recent.length > 0 && (
        <ul className="sidebar-widget-list">
          {recent.map((p) => (
            <li key={p.slug}>
              <Link to={`/insights/${p.slug}`} className="sidebar-widget-cross-item">
                <span className="sidebar-widget-cross-date">
                  {formatShortDate(p.date)}
                </span>
                <span className="sidebar-widget-cross-title">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/insights" className="sidebar-widget-link">
        Explore all writing →
      </Link>
    </section>
  );
}

export default CrossPromoWidget;
