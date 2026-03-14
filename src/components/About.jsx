import { ABOUT_STATS } from '../content/siteContent';
import { useCountUpOnVisible } from '../hooks/useCountUpOnVisible';

function About() {
  const { triggerRef, counts } = useCountUpOnVisible(ABOUT_STATS, {
    threshold: 0.35,
    duration: 1250,
  });

  return (
    <section id="about" className="section section-alt" aria-labelledby="about-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">About StrucLab</p>
          <h2 id="about-title"><span className="about-title-accent">Built to Support</span> — Not to Compete</h2>
        </div>

        <div className="about-body" data-reveal>
          <div className="about-text-col">
            <p className="about-lead">
              StrucLab provides structural and computational engineering support to consultants,
              contractors, and developers across a wide range of building projects.
            </p>
            <p>
              The practice combines practical structural engineering expertise with advanced
              analytical and computational tools, delivering technically rigorous, efficient, and
              buildable structural solutions.
            </p>
            <p>
              StrucLab was founded by Chartered Engineers with extensive structural engineering
              experience in Australia, bringing together decades of combined industry expertise
              across complex building projects.
            </p>
            <p>
              Working collaboratively with project teams, StrucLab provides flexible specialist
              support across structural design, advanced analysis, independent review,
              computational engineering, and professional training.
            </p>
          </div>
        </div>

        <div className="about-counters" data-reveal ref={triggerRef}>
          {ABOUT_STATS.map(({ label, suffix, Icon }, index) => (
            <article className="about-counter-card" key={label}>
              <div className="about-counter-top">
                <div className="about-counter-icon" aria-hidden="true">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <p className="about-counter-value">{counts[index]}{suffix}</p>
              </div>
              <p className="about-counter-label">{label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
