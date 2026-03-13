const expertiseItems = [
  'High-rise buildings',
  'Reinforced concrete structures',
  'Steel structures',
  'Complex transfer structures',
  'Structural optimisation',
  'Finite element modelling',
  'Seismic and wind engineering',
  'Engineering automation tools',
];

function Expertise() {
  return (
    <section id="expertise" className="section section-alt" aria-labelledby="expertise-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">Technical Capability</p>
          <h2 id="expertise-title">Expertise</h2>
          <p>Experience across a range of complex structural systems and project types.</p>
        </div>

        <ul className="expertise-grid" data-reveal>
          {expertiseItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Expertise;
