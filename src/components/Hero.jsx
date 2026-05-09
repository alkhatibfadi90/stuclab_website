function Hero() {
  return (
    <section id="home" className="hero section" aria-labelledby="hero-title">
      <div className="hero-structure-layer" aria-hidden="true" />

      <div className="container hero-grid">

        <div className="hero-content" data-reveal>
          <p className="eyebrow hero-eyebrow">Structural &amp; Computational Engineering</p>
          <h1 id="hero-title">
            Shaping Structures<br />
            <span className="hero-title-accent">One Algorithm at a Time</span>
          </h1>
          <p
            style={{
              display: 'block',
              maxWidth: '54ch',
              margin: '1.6rem 0 0.6rem',
              fontSize: 'clamp(1.35rem, 1.9vw, 1.75rem)',
              fontWeight: 700,
              lineHeight: 1.35,
              letterSpacing: '-0.005em',
              color: 'rgba(220, 228, 245, 0.62)',
            }}
          >
            Specialist Support for Complex Structures
          </p>
          <p className="hero-subtext" style={{ marginTop: '0.4rem' }}>
            StrucLab provides senior-level structural analysis, design support, computational
            engineering and professional training for consulting firms, contractors, and developers across Australia —
            delivered as flexible, project-based collaboration.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#contact">
              Start a Conversation
            </a>
            <a className="btn btn-ghost" href="#services">
              View Services
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;
