import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../content/siteContent';
import { scrollToSection } from '../utils/scrollToSection';

function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const handleSectionClick = (event, id) => {
    event.preventDefault();
    if (isHome) {
      scrollToSection(id);
      return;
    }
    navigate({ pathname: '/', hash: `#${id}` });
  };

  return (
    <footer className="footer">
      <div className="footer-top-rule" aria-hidden="true" />
      <div className="container footer-inner">
        <div className="footer-brand-col">
          <p className="footer-brand"><span className="brand-struc">Struc</span><span className="brand-lab">Lab</span></p>
          <p className="footer-descriptor">Structural &amp; Computational Engineering</p>
          <p className="footer-location">Perth, Australia</p>
          <p className="footer-copy">&copy; {year} StrucLab. All rights reserved.</p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <p className="footer-nav-heading">Navigation</p>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={isHome ? `#${item.id}` : `/#${item.id}`}
              onClick={(event) => handleSectionClick(event, item.id)}
            >
              {item.label}
            </a>
          ))}
          <Link to="/labkit">LabKit</Link>
        </nav>

        <div className="footer-contact-col">
          <p className="footer-nav-heading">Contact</p>
          <a href="mailto:info@struclab.com.au" className="footer-email">info@struclab.com.au</a>
          <a
            href="https://www.linkedin.com/company/struclab-australia"
            className="footer-linkedin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="StrucLab on LinkedIn"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
