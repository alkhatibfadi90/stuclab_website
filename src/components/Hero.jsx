function Hero() {
  return (
    <section id="home" className="hero section" aria-labelledby="hero-title">
      <div className="hero-structure-layer" aria-hidden="true" />

      <div className="container hero-grid">

        <div className="hero-content" data-reveal>
          <p className="eyebrow hero-eyebrow">Structural &amp; Computational Engineering</p>
          <h1 id="hero-title">
            Engineering Precision.<br />
            <span className="hero-title-accent">Delivered with Rigour.</span>
          </h1>
          <p className="hero-subtext">
            StrucLab provides expert structural engineering support from complex structural design
            and analysis to independent review and engineering automation.
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
