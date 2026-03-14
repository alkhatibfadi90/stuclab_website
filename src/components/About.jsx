import { BriefcaseBusiness, Clock3, GraduationCap, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const stats = [
  { target: 15, suffix: '+', label: 'Years Experience', Icon: Clock3 },
  { target: 40, suffix: '+', label: 'Projects Delivered / Contributed', Icon: BriefcaseBusiness },
  { target: 20, suffix: '+', label: 'Professional Training Programs', Icon: GraduationCap },
  { target: 100, suffix: '%', label: 'Engineering-Focused Solutions', Icon: ShieldCheck },
];

function About() {
  const countersRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState(() => stats.map(() => 0));

  useEffect(() => {
    if (!countersRef.current || hasAnimated) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(countersRef.current);

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) {
      return;
    }

    const duration = 1250;
    let frameId;
    let start;

    const tick = (timestamp) => {
      if (!start) {
        start = timestamp;
      }

      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounts(stats.map(({ target }) => Math.round(target * eased)));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [hasAnimated]);

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

        <div className="about-counters" data-reveal ref={countersRef}>
          {stats.map(({ label, suffix, Icon }, index) => (
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
