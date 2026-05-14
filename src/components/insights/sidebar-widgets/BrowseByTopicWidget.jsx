import { Link } from 'react-router-dom';
import { posts } from '../../../content/postsManifest';

function getTagCounts() {
  const counts = new Map();
  posts.forEach((p) => {
    (p.tags || []).forEach((t) => {
      counts.set(t, (counts.get(t) || 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

function BrowseByTopicWidget() {
  const items = getTagCounts();
  if (items.length === 0) return null;

  return (
    <section className="sidebar-widget" aria-labelledby="sidebar-topic-heading">
      <p id="sidebar-topic-heading" className="eyebrow sidebar-widget-eyebrow">
        Browse by topic
      </p>
      <ul className="sidebar-widget-list">
        {items.map(({ tag, count }) => (
          <li key={tag}>
            <Link to={`/insights/tag/${tag}`} className="sidebar-widget-item">
              <span className="sidebar-widget-item-label">{tag}</span>
              <span className="sidebar-widget-item-count">({count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default BrowseByTopicWidget;
