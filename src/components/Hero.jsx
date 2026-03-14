// Helper: generate horizontal floor plate lines for a building
const floorLines = (x1, x2, topY, bottomY, spacing) => {
  const lines = [];
  for (let y = topY; y <= bottomY; y += spacing) {
    lines.push(<line key={y} x1={x1} y1={y} x2={x2} y2={y} />);
  }
  return lines;
};

// Helper: generate vertical interior mullion lines
const mullionLines = (x1, x2, topY, bottomY, count) => {
  const lines = [];
  const step = (x2 - x1) / (count + 1);
  for (let i = 1; i <= count; i++) {
    const x = Math.round(x1 + step * i);
    lines.push(<line key={`m${i}`} x1={x} y1={topY} x2={x} y2={bottomY} />);
  }
  return lines;
};

function Hero() {
  return (
    <section id="home" className="hero section" aria-labelledby="hero-title">

      {/* Full-bleed dark atmospheric background */}
      <div className="hero-bg" aria-hidden="true">
        <svg className="hero-grid-svg" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="heroAtm1" cx="68%" cy="50%" r="48%">
              <stop offset="0%" stopColor="rgba(200,162,74,0.07)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <radialGradient id="heroAtm2" cx="18%" cy="75%" r="38%">
              <stop offset="0%" stopColor="rgba(80,110,180,0.055)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          <rect width="1400" height="800" fill="url(#heroAtm1)" />
          <rect width="1400" height="800" fill="url(#heroAtm2)" />
          <g stroke="rgba(255,255,255,0.022)" strokeWidth="1" fill="none">
            {Array.from({ length: 29 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="800" />
            ))}
            {Array.from({ length: 17 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 50} x2="1400" y2={i * 50} />
            ))}
          </g>
        </svg>
      </div>

      <div className="container hero-grid">

        {/* Left: headline + CTA */}
        <div className="hero-content" data-reveal>
          <p className="eyebrow hero-eyebrow">Structural &amp; Computational Engineering</p>
          <h1 id="hero-title">
            Engineering Precision.<br />
            <span className="hero-title-accent">Delivered with Rigour.</span>
          </h1>
          <p className="hero-subtext">
            StrucLab provides expert structural engineering support  from complex structural design
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
          <ul className="trust-points" aria-label="Key credentials">
            <li><span className="trust-label">Chartered Structural Engineer</span></li>
            <li><span className="trust-label">9+ Years Experience</span></li>
            <li><span className="trust-label">High-Rise &amp; Complex Structures</span></li>
          </ul>
        </div>

        {/* Right: animated high-rise building scene */}
        <div className="hero-visual" aria-hidden="true" data-reveal>
          <div className="hero-frame">
            <div className="hero-frame-label">High-Rise Structural Systems</div>

            <svg className="hero-illustration" viewBox="0 0 480 410" role="presentation">
              <defs>
                <radialGradient id="bldAtm" cx="50%" cy="60%" r="55%">
                  <stop offset="0%" stopColor="rgba(200,162,74,0.06)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                <filter id="nodeGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="2.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="scanGlow" x="-5%" y="-200%" width="110%" height="500%">
                  <feGaussianBlur stdDeviation="1" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Atmosphere wash */}
              <rect width="480" height="410" fill="url(#bldAtm)" />

              {/*  LAYER 1: Background towers (very faint silhouettes)  */}
              <g className="bld-rise-bg" fill="none" stroke="rgba(200,215,232,0.092)" strokeWidth="0.75">
                <line x1="0"   y1="192" x2="0"   y2="402" />
                <line x1="48"  y1="192" x2="48"  y2="402" />
                {floorLines(0, 48, 192, 402, 30)}

                <line x1="58"  y1="230" x2="58"  y2="402" />
                <line x1="93"  y1="230" x2="93"  y2="402" />
                {floorLines(58, 93, 230, 402, 30)}

                <line x1="392" y1="168" x2="392" y2="402" />
                <line x1="438" y1="168" x2="438" y2="402" />
                {floorLines(392, 438, 168, 402, 30)}

                <line x1="441" y1="208" x2="441" y2="402" />
                <line x1="479" y1="208" x2="479" y2="402" />
                {floorLines(441, 479, 208, 402, 30)}
              </g>

              {/*  LAYER 2: Midground towers  */}
              <g className="bld-rise-mid" fill="none">
                <g stroke="rgba(150,182,215,0.32)" strokeWidth="1">
                  <line x1="42"  y1="80" x2="42"  y2="402" strokeWidth="1.25" />
                  <line x1="104" y1="80" x2="104" y2="402" strokeWidth="1.25" />
                  {floorLines(42, 104, 80, 402, 22)}
                </g>
                <g stroke="rgba(150,182,215,0.14)" strokeWidth="0.7">
                  {mullionLines(42, 104, 80, 402, 2)}
                </g>

                <g stroke="rgba(150,182,215,0.33)" strokeWidth="1">
                  <line x1="340" y1="68" x2="340" y2="402" strokeWidth="1.25" />
                  <line x1="406" y1="68" x2="406" y2="402" strokeWidth="1.25" />
                  {floorLines(340, 406, 68, 402, 22)}
                </g>
                <g stroke="rgba(150,182,215,0.14)" strokeWidth="0.7">
                  {mullionLines(340, 406, 68, 402, 2)}
                </g>
              </g>

              {/*  LAYER 3: Foreground secondary tower  */}
              <g className="bld-rise-fg-sec" fill="none">
                <g stroke="rgba(168,198,228,0.54)" strokeWidth="1.35">
                  <line x1="270" y1="90" x2="270" y2="402" />
                  <line x1="346" y1="90" x2="346" y2="402" />
                  {floorLines(270, 346, 90, 402, 18)}
                </g>
                <g stroke="rgba(168,198,228,0.17)" strokeWidth="0.7">
                  {mullionLines(270, 346, 90, 402, 3)}
                </g>
              </g>

              {/*  LAYER 4: Featured main tower (GOLD)  */}
              <g className="bld-rise-fg-main" fill="none">
                {/* Primary structural columns */}
                <g stroke="rgba(200,162,74,0.8)" strokeWidth="1.85">
                  <line x1="160" y1="35" x2="160" y2="402" />
                  <line x1="250" y1="35" x2="250" y2="402" />
                </g>
                {/* Top cap beam */}
                <line x1="158" y1="35" x2="252" y2="35" stroke="rgba(200,162,74,0.8)" strokeWidth="1.85" fill="none" />
                {/* Floor plates */}
                <g stroke="rgba(200,162,74,0.48)" strokeWidth="1">
                  {floorLines(160, 250, 35, 402, 18)}
                </g>
                {/* Interior curtain wall mullions */}
                <g stroke="rgba(200,162,74,0.145)" strokeWidth="0.75">
                  {mullionLines(160, 250, 35, 402, 5)}
                </g>
                {/* Crown spire */}
                <line x1="205" y1="35" x2="205" y2="13" stroke="rgba(200,162,74,0.65)" strokeWidth="1.2" />
                {/* Spire node */}
                <circle cx="205" cy="13" r="2.2" fill="rgba(200,162,74,0.85)" />
              </g>

              {/*  Ground plane  */}
              <g fill="none">
                <line x1="0" y1="402" x2="480" y2="402" stroke="rgba(200,218,235,0.22)" strokeWidth="1" />
                <line x1="0" y1="405" x2="480" y2="405" stroke="rgba(200,218,235,0.08)" strokeWidth="0.7" />
                <line x1="0" y1="410" x2="480" y2="410" stroke="rgba(200,218,235,0.04)" strokeWidth="0.5" />
              </g>

              {/*  Analysis scan line (animates upward after build)  */}
              <line
                className="hero-scan"
                x1="0" y1="35" x2="480" y2="35"
                stroke="rgba(200,162,74,0.6)"
                strokeWidth="1"
                filter="url(#scanGlow)"
              />

              {/*  Structural joint nodes (pulsing)  */}
              <g filter="url(#nodeGlow)">
                <circle className="node-pulse"         cx="160" cy="35"  r="3.5" fill="rgba(200,162,74,0.88)" />
                <circle className="node-pulse-delayed" cx="250" cy="35"  r="3.5" fill="rgba(200,162,74,0.88)" />
                <circle className="node-pulse"         cx="160" cy="215" r="2.5" fill="rgba(200,162,74,0.58)" />
                <circle className="node-pulse-delayed" cx="250" cy="215" r="2.5" fill="rgba(200,162,74,0.58)" />
                <circle className="node-pulse"         cx="205" cy="13"  r="2.5" fill="rgba(200,162,74,0.92)" />
              </g>

            </svg>

            <div className="hero-tags">
              <span>High-Rise Design</span>
              <span>FEA Modelling</span>
              <span>Structural Systems</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;
