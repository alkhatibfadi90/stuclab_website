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
              StrucLab is a specialist structural engineering practice supporting consulting firms,
              contractors, and developers on complex and demanding structural projects.
            </p>
            <p>
              The practice was founded to fill a specific gap — providing senior technical capacity
              that established teams can call on when projects need deeper analysis, specialist
              input, or extra hands at critical stages. StrucLab works as a collaborator, not a
              competitor, integrating with client teams under their project leadership.
            </p>
            <p>
              Founded by Chartered Professional Engineers with over a decade of experience on
              Australian projects, StrucLab combines technical depth with practical, buildable
              thinking. Every engagement is delivered with the same standard of rigour expected
              on landmark projects, scaled to suit the brief.
            </p>
            <p>
              By keeping the practice focused and specialist, StrucLab offers structural firms a
              reliable extension of their own technical capability — without the overhead of a
              permanent hire.
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
