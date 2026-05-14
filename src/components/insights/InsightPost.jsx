import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { posts } from '../../content/postsManifest';

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
                <li key={tag} className="insight-tag">{tag}</li>
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

        <aside className="insight-author" data-reveal>
          <p className="insight-author-line">
            Written by <strong>Fadi Alkhatib, CPEng.</strong> StrucLab.
          </p>
          <a
            href="https://www.linkedin.com/company/struclab-australia"
            className="insight-author-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Connect on LinkedIn →
          </a>
        </aside>

        <aside className="insight-cta" data-reveal>
          <p className="insight-cta-text">
            Need training or automation support?
          </p>
          <Link to="/#contact" className="btn btn-primary insight-cta-btn">
            Get in touch
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default InsightPost;
