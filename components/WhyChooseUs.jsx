import { WHY_CHOOSE_US_REASONS } from '../content/siteContent';

function WhyChooseUs() {
  return (
    <section className="section section-alt" aria-labelledby="why-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">Collaboration Value</p>
          <h2 id="why-title">Why Work With Us</h2>
        </div>

        <div className="why-grid">
          {WHY_CHOOSE_US_REASONS.map(({ title, text, Icon }) => (
            <article className="why-card" key={title} data-reveal>
              <Icon size={20} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
