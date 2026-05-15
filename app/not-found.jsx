import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content">
      <section
        className="section labkit-landing insights-landing"
        aria-labelledby="not-found-title"
      >
        <div className="container">
          <Link href="/" className="labkit-back">← Back to StrucLab</Link>
          <div className="section-heading labkit-heading">
            <p className="eyebrow">404 · Page Not Found</p>
            <h1 id="not-found-title" className="labkit-h1">
              We couldn&apos;t find that page
            </h1>
            <p className="section-lead labkit-lead">
              The page you&apos;re looking for has moved or doesn&apos;t exist.
              Head back to the home page, browse LabKit tools, or read the
              latest insights.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
