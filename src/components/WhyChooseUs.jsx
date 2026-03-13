import { Compass, Cpu, Layers2, ShieldCheck } from 'lucide-react';

const reasons = [
  {
    title: 'Technical Depth',
    text: 'Strong technical background combining industry experience with advanced structural engineering research.',
    Icon: ShieldCheck,
  },
  {
    title: 'Practical Engineering',
    text: 'Focus on practical, buildable structural solutions suited to real project conditions.',
    Icon: Layers2,
  },
  {
    title: 'Flexible Support',
    text: 'Engineering support can be provided to project teams on a flexible basis depending on project needs.',
    Icon: Compass,
  },
  {
    title: 'Efficiency Focus',
    text: 'Use of computational tools and automation to improve design efficiency and reduce engineering time.',
    Icon: Cpu,
  },
];

function WhyChooseUs() {
  return (
    <section className="section" aria-labelledby="why-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">Collaboration Value</p>
          <h2 id="why-title">Why Work With Us</h2>
        </div>

        <div className="why-grid">
          {reasons.map(({ title, text, Icon }) => (
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
