import { PROFESSIONAL_CREDENTIALS } from '../content/siteContent';

function ProfessionalCredentials() {
  return (
    <section className="section" aria-labelledby="credentials-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">Professional Recognition</p>
          <h2 id="credentials-title">Professional Credentials</h2>
        </div>

        <div className="credentials-grid">
          {PROFESSIONAL_CREDENTIALS.map(({ title, organization, image }) => (
            <article className="credential-card" key={title} data-reveal>
              <div className="credential-media">
                <img src={image} alt={title} loading="lazy" />
              </div>
              <div className="credential-copy">
                <h3 className="credential-title">{title}</h3>
                <p className="credential-organization">{organization}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProfessionalCredentials;
