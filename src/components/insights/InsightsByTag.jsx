import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPostsByTag } from '../../content/postsManifest';
import PostList from './PostList';

function InsightsByTag() {
  const { tag } = useParams();
  const matches = useMemo(() => getPostsByTag(tag), [tag]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [tag]);

  return (
    <section
      className="section labkit-landing insights-landing"
      aria-labelledby="insights-tag-title"
    >
      <div className="container">
        <Link to="/insights" className="labkit-back">← All insights</Link>

        <div className="section-heading labkit-heading" data-reveal>
          <p className="eyebrow">Filter by tag</p>
          <h1 id="insights-tag-title" className="labkit-h1">
            Posts tagged: <span className="insight-tag-name">{tag}</span>
          </h1>
          <p className="section-lead labkit-lead">
            {matches.length === 0
              ? 'No posts with this tag yet.'
              : `${matches.length} post${matches.length === 1 ? '' : 's'} tagged with “${tag}”.`}
          </p>
        </div>

        <PostList items={matches} />
      </div>
    </section>
  );
}

export default InsightsByTag;
