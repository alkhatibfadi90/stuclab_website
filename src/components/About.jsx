import { Building2, BriefcaseBusiness, Clock3, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const stats = [
  { target: 9, suffix: '+', label: 'Years Experience', Icon: Clock3 },
  { target: 50, suffix: '+', label: 'Projects Delivered / Contributed', Icon: BriefcaseBusiness },
  { target: 20, suffix: '+', label: 'Complex / High-Rise Structures', Icon: Building2 },
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
          <h2 id="about-title">Built on Experience.<br />Focused on Results.</h2>
        </div>

        <div className="about-body" data-reveal>
          <div className="about-text-col">
            <p className="about-lead">
              StrucLab provides structural and computational engineering support to consultants,
              contractors, and developers across a wide range of building projects.
            </p>
            <p>
              The practice combines practical structural engineering experience with advanced
              analytical and computational tools — delivering technically rigorous, efficient, and
              buildable structural solutions.
            </p>
            <p>
              The founder, Fadi Alkhatib, is a Chartered Structural Engineer with more than nine
              years of professional experience delivering complex structural projects including
              high-rise buildings, mixed-use developments, and technically demanding structures.
            </p>
            <p>
              StrucLab works collaboratively with project teams on a flexible basis, providing
              specialist support across structural design, advanced analysis, independent review,
              and digital engineering.
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
