function Hero() {
  return (
    <section id="home" className="hero section" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-content" data-reveal>
          <p className="eyebrow">StrucLab</p>
          <h1 id="hero-title">Structural &amp; Computational Engineering Solutions</h1>
          <p className="hero-subtext">
            Providing efficient and technically rigorous structural engineering support across
            structural design, analysis, independent review, and engineering automation.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#contact">
              Get in Touch
            </a>
            <a className="btn btn-secondary" href="#services">
              View Services
            </a>
          </div>
          <ul className="trust-points" aria-label="Key offerings">
            <li>Structural Design Support</li>
            <li>Design Review &amp; Independent Checking</li>
            <li>Engineering Automation &amp; Digital Tools</li>
          </ul>
        </div>
        <div className="hero-visual" aria-hidden="true" data-reveal>
          <div className="hero-frame">
            <svg className="hero-illustration" viewBox="0 0 520 520" role="presentation">
              <defs>
                <linearGradient id="steelGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3f3f3f" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#2c2c2c" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="goldTrace" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#c8a24a" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#ad8634" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              <rect x="52" y="52" width="416" height="416" rx="20" fill="#ffffff" stroke="#e8e8e8" />

              <g stroke="#ececec" strokeWidth="1">
                <path d="M90 108H430" />
                <path d="M90 166H430" />
                <path d="M90 224H430" />
                <path d="M90 282H430" />
                <path d="M90 340H430" />
                <path d="M90 398H430" />
                <path d="M108 90V430" />
                <path d="M166 90V430" />
                <path d="M224 90V430" />
                <path d="M282 90V430" />
                <path d="M340 90V430" />
                <path d="M398 90V430" />
              </g>

              <g fill="none" stroke="url(#steelGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M112 354L178 276L250 330L332 216L412 284" />
                <path d="M112 354L176 220L252 250L330 160L412 188" />
              </g>

              <g fill="#ffffff" stroke="#d6d6d6" strokeWidth="3">
                <circle cx="112" cy="354" r="8" />
                <circle cx="176" cy="220" r="8" />
                <circle cx="250" cy="250" r="8" />
                <circle cx="330" cy="160" r="8" />
                <circle cx="412" cy="188" r="8" />
              </g>

              <path
                className="analysis-trace"
                d="M112 396C152 340 194 364 236 312C272 268 312 288 346 250C372 222 392 230 412 206"
                fill="none"
                stroke="url(#goldTrace)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              <g fill="#f1f1f1" stroke="#e5e5e5">
                <rect x="92" y="420" width="58" height="18" rx="4" />
                <rect x="156" y="420" width="58" height="18" rx="4" />
                <rect x="220" y="420" width="58" height="18" rx="4" />
                <rect x="284" y="420" width="58" height="18" rx="4" />
              </g>
            </svg>

            <div className="hero-tags">
              <span>Finite Element Model</span>
              <span>Parametric Workflow</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
