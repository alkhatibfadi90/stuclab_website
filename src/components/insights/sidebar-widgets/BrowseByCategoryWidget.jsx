import { Link } from 'react-router-dom';
import { LABKIT_CATEGORIES } from '../../LabKit';

function parseToolCount(badge) {
  if (!badge) return 0;
  const match = String(badge).match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function getCategoryItems() {
  return LABKIT_CATEGORIES
    .map((c) => ({
      title: c.title,
      href: c.href,
      count: parseToolCount(c.badge),
    }))
    .filter((c) => c.count > 0 && c.href)
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
}

function BrowseByCategoryWidget() {
  const items = getCategoryItems();
  if (items.length === 0) return null;

  return (
    <section className="sidebar-widget" aria-labelledby="sidebar-category-heading">
      <p id="sidebar-category-heading" className="eyebrow sidebar-widget-eyebrow">
        Browse by category
      </p>
      <ul className="sidebar-widget-list">
        {items.map(({ title, href, count }) => (
          <li key={title}>
            <Link to={href} className="sidebar-widget-item">
              <span className="sidebar-widget-item-label">{title}</span>
              <span className="sidebar-widget-item-count">({count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default BrowseByCategoryWidget;
