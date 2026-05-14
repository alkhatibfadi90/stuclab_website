import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../../content/postsManifest';

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function InsightsIndex() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <section
      id="insights"
      className="section labkit-landing insights-landing"
      aria-labelledby="insights-title"
    >
      <div className="container">
        <div className="section-heading labkit-heading" data-reveal>
          <p className="eyebrow">Latest Writing</p>
          <h1 id="insights-title" className="labkit-h1">Insights</h1>
          <p className="section-lead labkit-lead">
            Short, practical writing on concrete and steel design, lateral
            systems, advanced analysis, and the Python and parametric
            workflows that support them.
          </p>
        </div>

        <ol className="insights-list" aria-label="Posts">
          {posts.map((post) => (
            <li key={post.slug} className="insight-item" data-reveal>
              <div className="insight-meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.tags?.length > 0 && (
                  <ul className="insight-tags" aria-label="Tags">
                    {post.tags.map((tag) => (
                      <li key={tag} className="insight-tag">{tag}</li>
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

        {posts.length === 0 && (
          <p className="labkit-meta">No posts yet. Check back soon.</p>
        )}
      </div>
    </section>
  );
}

export default InsightsIndex;
