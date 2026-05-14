import { Link } from 'react-router-dom';

function AboutWidget() {
  return (
    <section className="sidebar-widget" aria-labelledby="sidebar-about-heading">
      <p id="sidebar-about-heading" className="eyebrow sidebar-widget-eyebrow">
        About StrucLab
      </p>
      <p className="sidebar-widget-body">
        Structural and computational engineering support across design,
        analysis, independent review, and digital engineering tools. Based in
        Perth, working with consultants and contractors Australia-wide.
      </p>
      <Link to="/#about" className="sidebar-widget-link">
        Learn more →
      </Link>
    </section>
  );
}

export default AboutWidget;
