'use client';

import { BookOpen, Calculator, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS } from '../content/siteContent';
import { scrollToSection } from '../utils/scrollToSection';

function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';

  const handleSectionClick = (event, id) => {
    event.preventDefault();
    if (isHome) {
      scrollToSection(id);
      return;
    }
    router.push(`/#${id}`);
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
        </nav>

        <nav className="footer-nav footer-resources" aria-label="Resources">
          <p className="footer-nav-heading">Explore</p>
          <Link href="/labkit">
            <Calculator size={14} aria-hidden="true" />
            <span>LabKit</span>
          </Link>
          <Link href="/insights">
            <BookOpen size={14} aria-hidden="true" />
            <span>Insights</span>
          </Link>
        </nav>

        <div className="footer-contact-col">
          <p className="footer-nav-heading">Contact</p>
          <a href="mailto:info@struclab.com.au" className="footer-email">info@struclab.com.au</a>
          <a
            href="https://www.linkedin.com/company/struclab-engineering"
            className="footer-linkedin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="StrucLab on LinkedIn"
          >
            <span className="linkedin-badge" aria-hidden="true">
              <Linkedin size={16} />
            </span>
            <span>LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
