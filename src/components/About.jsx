const highlights = [
  'Chartered Structural Engineer',
  '9+ Years Experience',
  'Structural & Computational Focus',
];

function About() {
  return (
    <section id="about" className="section section-alt" aria-labelledby="about-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">About</p>
          <h2 id="about-title">About</h2>
        </div>

        <div className="about-grid" data-reveal>
          <p>
            StrucLab provides structural and computational engineering support to consultants,
            contractors, and developers across a wide range of building projects.
          </p>
          <p>
            The practice focuses on delivering technically rigorous and efficient structural
            solutions by combining practical structural engineering experience with advanced
            analytical and computational tools.
          </p>
          <p>
            The founder, Fadi Alkhatib, is a Chartered Structural Engineer with more than nine
            years of professional experience delivering complex structural projects including
            high-rise buildings, mixed-use developments, and technically demanding structures.
          </p>
          <p>
            StrucLab works collaboratively with project teams to provide flexible engineering
            support across structural design, advanced analysis, design review, and digital
            engineering.
          </p>
        </div>

        <ul className="about-highlights" data-reveal>
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default About;
