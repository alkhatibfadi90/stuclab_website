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
            <span style={{ display: 'block', fontSize: '0.55em', fontWeight: 700, marginTop: '0.6em' }}>
              Specialist Support for Complex Structures
            </span>
          </h1>
          <p className="hero-subtext">
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
