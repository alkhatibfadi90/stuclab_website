import Link from 'next/link';
import PostList from './PostList';

// Presentational tag-archive view. The page component supplies the tag and
// the posts that match it.
function InsightsByTag({ tag, matches = [] }) {
  return (
    <section
      className="section labkit-landing insights-landing"
      aria-labelledby="insights-tag-title"
    >
      <div className="container">
        <Link href="/insights" className="labkit-back">← All insights</Link>

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
