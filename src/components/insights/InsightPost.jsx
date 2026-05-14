import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Linkedin } from 'lucide-react';
import 'highlight.js/styles/atom-one-dark.css';
import { posts, getRelatedPosts } from '../../content/postsManifest';

// Vite eagerly statically maps every markdown file under posts/ so we can
// resolve them synchronously by slug. ?raw returns the file text.
const postFiles = import.meta.glob('../../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function getPostBody(slug) {
  const key = `../../content/posts/${slug}.md`;
  return postFiles[key];
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function InsightPost() {
  const { slug } = useParams();
  const post = useMemo(() => posts.find((p) => p.slug === slug), [slug]);
  const body = post ? getPostBody(slug) : undefined;
  const related = useMemo(() => getRelatedPosts(slug, 3), [slug]);
  // Hide the section entirely if fewer than 2 other posts exist in total.
  const showRelated = posts.length - 1 >= 2 && related.length > 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  if (!post || !body) {
    return (
      <section
        className="section labkit-landing insights-landing"
        aria-labelledby="insight-missing-title"
      >
        <div className="container">
          <Link to="/insights" className="labkit-back">← Back to Insights</Link>
          <div className="section-heading labkit-heading" data-reveal>
            <p className="eyebrow">404 · Post Not Found</p>
            <h1 id="insight-missing-title" className="labkit-h1">
              We couldn't find that post
            </h1>
            <p className="section-lead labkit-lead">
              The article you're looking for has moved or doesn't exist yet.
              Head back to the index to see what's available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="section labkit-landing insight-post"
      aria-labelledby="insight-title"
    >
      <div className="container insight-post-container">
        <Link to="/insights" className="labkit-back">← Back to Insights</Link>

        <header className="insight-post-header" data-reveal>
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
          <h1 id="insight-title" className="insight-post-title">{post.title}</h1>
          <p className="insight-post-meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.readingTime && (
              <>
                <span aria-hidden="true"> · </span>
                <span>{post.readingTime}</span>
              </>
            )}
          </p>
        </header>

        <article className="insight-post-body" data-reveal>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {body}
          </ReactMarkdown>
        </article>

        <hr className="insight-divider" />

        <aside className="insight-author-card" aria-labelledby="author-label" data-reveal>
          <div className="insight-author-photo">
            <img src="/assets/fadi-headshot.jpg" alt="" />
          </div>
          <div className="insight-author-content">
            <p id="author-label" className="eyebrow insight-author-label">
              About the author
            </p>
            <p className="insight-author-bio">
              <strong>Fadi Al-Khatib, PhD, CPEng</strong> — Senior Structural
              Engineer and founder of StrucLab. Specialises in high-rise design,
              advanced FE analysis, ETABS modelling, post-tensioned concrete,
              and engineering automation.
            </p>
            <a
              href="https://www.linkedin.com/in/fadi-alkhatib"
              className="btn btn-ghost insight-author-cta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fadi Al-Khatib on LinkedIn"
            >
              <span>Connect on LinkedIn</span>
              <span className="linkedin-badge" aria-hidden="true">
                <Linkedin size={14} />
              </span>
            </a>
          </div>
        </aside>

        <aside className="insight-explore-callout" data-reveal>
          <p className="eyebrow insight-explore-eyebrow">Explore LabKit</p>
          <p className="insight-explore-text">
            Practical engineering tools for concrete, steel, lateral systems,
            and automation.
          </p>
          <Link to="/labkit" className="insight-explore-link">
            Browse LabKit tools →
          </Link>
        </aside>

        <aside className="insight-cta" data-reveal>
          <p className="insight-cta-text">
            Need automation, training, or structural support? Get in touch.
          </p>
          <Link to="/#contact" className="btn btn-primary insight-cta-btn">
            Get in touch
          </Link>
        </aside>

        {showRelated && (
          <aside className="insight-related" aria-labelledby="related-heading">
            <h2 id="related-heading" className="insight-related-heading">
              Related posts
            </h2>
            <ul className="insight-related-grid">
              {related.map((p) => (
                <li key={p.slug} className="related-card">
                  <div className="related-card-meta">
                    <time dateTime={p.date}>{formatDate(p.date)}</time>
                    {p.tags?.length > 0 && (
                      <ul className="insight-tags" aria-label="Tags">
                        {p.tags.map((tag) => (
                          <li key={tag}>
                            <Link
                              to={`/insights/tag/${tag}`}
                              className="insight-tag"
                            >
                              {tag}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <h3 className="related-card-title">
                    <Link to={`/insights/${p.slug}`}>{p.title}</Link>
                  </h3>
                  <p className="related-card-excerpt">{p.excerpt}</p>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </section>
  );
}

export default InsightPost;
