import { Link } from 'react-router-dom';

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function PostList({ items }) {
  if (!items?.length) return null;
  return (
    <ol className="insights-list" aria-label="Posts">
      {items.map((post) => (
        <li key={post.slug} className="insight-item" data-reveal>
          <div className="insight-meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.tags?.length > 0 && (
              <ul className="insight-tags" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link to={`/insights/tag/${tag}`} className="insight-tag">
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <h2 className="insight-title">
            <Link to={`/insights/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="insight-excerpt">{post.excerpt}</p>
          {post.readingTime && (
            <p className="insight-reading-time">{post.readingTime}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

export default PostList;
