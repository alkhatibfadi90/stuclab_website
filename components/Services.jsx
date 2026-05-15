import { SERVICES } from '../content/siteContent';

function Services() {
  return (
    <section id="services" className="section" aria-labelledby="services-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">What We Offer</p>
          <h2 id="services-title">Services</h2>
          <p className="section-lead">
            Technically rigorous engineering support across design, analysis, review, and digital engineering.
          </p>
        </div>

        <div className="services-grid">
          {SERVICES.map(({ title, description, points, Icon }) => (
            <article className="service-card" key={title} data-reveal>
              <div className="service-card-top">
                <div className="service-icon" aria-hidden="true">
                  <Icon size={34} strokeWidth={2} />
                </div>
                <h3 className="service-title">{title}</h3>
                <p className="service-desc">{description}</p>
              </div>
              <ul className="service-points">
                {points.map((point) => (
                  <li key={point}>
                    <span className="service-point-bullet" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
