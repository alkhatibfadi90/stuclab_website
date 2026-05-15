import { EXPERTISE_ITEMS } from '../content/siteContent';

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
          {EXPERTISE_ITEMS.map(({ label, image }) => (
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
