import { useEffect } from 'react';
import { posts } from '../../content/postsManifest';
import PostList from './PostList';
import Sidebar from './Sidebar';

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
        <div className="page-with-sidebar">
          <div className="page-main">
            <div className="section-heading labkit-heading" data-reveal>
              <p className="eyebrow">Latest Writing</p>
              <h1 id="insights-title" className="labkit-h1 insight-page-title">
                Insights
              </h1>
              <p className="section-lead labkit-lead">
                Short, practical writing on concrete and steel design, lateral
                systems, advanced analysis, and the Python and parametric
                workflows that support them.
              </p>
            </div>

            <PostList items={posts} />

            {posts.length === 0 && (
              <p className="labkit-meta">No posts yet. Check back soon.</p>
            )}
          </div>

          <Sidebar variant="insights" />
        </div>
      </div>
    </section>
  );
}

export default InsightsIndex;
