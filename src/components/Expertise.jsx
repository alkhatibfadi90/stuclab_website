const expertiseItems = [
  {
    label: 'Reinforced Concrete Structures',
    image: '/assets/expertise/reinforced-concrete-structures.jpg',
  },
  {
    label: 'Post Tensioned Concrete Structures',
    image: '/assets/expertise/post-tensioned-concrete-structures.jpg',
  },
  {
    label: 'Steel Structures',
    image: '/assets/expertise/steel-structures.jpg',
  },
  {
    label: 'High-rise / Complex Structures',
    image: '/assets/expertise/high-rise-complex-structures.png',
  },
  {
    label: 'Structural Retrofit and Strengthening',
    image: '/assets/expertise/structural-assessment-and-investigation.jpg',
  },
  {
    label: 'Seismic and Wind Design',
    image: '/assets/expertise/seismic-and-wind-design.png',
  },
  {
    label: 'Advance Structural Analysis',
    image: '/assets/expertise/advanced-structural-analysis.jpg',
  },
  {
    label: 'Structural Optimization and Automation',
    image: '/assets/expertise/structural-optimization-and-automation.jpeg',
  },
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
          {expertiseItems.map(({ label, image }) => (
            <li key={label}>
              <div className="expertise-media">
                <img src={image} alt={label} loading="lazy" />
              </div>
              <span className="expertise-label">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Expertise;
