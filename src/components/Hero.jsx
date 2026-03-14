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
          <p className="hero-subtext">
            StrucLab delivers advanced structural design support, independent engineering review,
            computational engineering solutions, and industry-focused training.
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
