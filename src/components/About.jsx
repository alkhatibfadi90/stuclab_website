const highlights = [
  'Chartered Structural Engineer',
  '9+ Years Experience',
  'Structural & Computational Focus',
];

const stats = [
  { value: '9+', label: 'Years Experience' },
  { value: 'CEng', label: 'Chartered Engineer' },
  { value: '∞', label: 'High-Rise & Complex' },
  { value: 'S+C', label: 'Structural & Computational' },
];

function About() {
  return (
    <section id="about" className="section section-alt" aria-labelledby="about-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">About StrucLab</p>
          <h2 id="about-title">Built on Experience.<br />Focused on Results.</h2>
        </div>

        <div className="about-body" data-reveal>
          <div className="about-text-col">
            <p className="about-lead">
              StrucLab provides structural and computational engineering support to consultants,
              contractors, and developers across a wide range of building projects.
            </p>
            <p>
              The practice combines practical structural engineering experience with advanced
              analytical and computational tools — delivering technically rigorous, efficient, and
              buildable structural solutions.
            </p>
            <p>
              The founder, Fadi Alkhatib, is a Chartered Structural Engineer with more than nine
              years of professional experience delivering complex structural projects including
              high-rise buildings, mixed-use developments, and technically demanding structures.
            </p>
            <p>
              StrucLab works collaboratively with project teams on a flexible basis, providing
              specialist support across structural design, advanced analysis, independent review,
              and digital engineering.
            </p>
          </div>

          <div className="about-stats-col">
            <div className="about-stats-grid">
              {stats.map(({ value, label }) => (
                <div className="about-stat" key={label}>
                  <span className="about-stat-value">{value}</span>
                  <span className="about-stat-label">{label}</span>
                </div>
              ))}
            </div>
            <ul className="about-highlights" aria-label="Key credentials">
              {highlights.map((item) => (
                <li key={item}>
                  <span className="highlight-dot" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
