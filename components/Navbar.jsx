'use client';

import { BookOpen, Calculator, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS } from '../content/siteContent';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { scrollToSection } from '../utils/scrollToSection';

function Navbar({ activeSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const isLabKit = pathname === '/labkit';
  const isInsights = pathname.startsWith('/insights');
  useBodyScrollLock(isOpen);

  const closeMenu = () => setIsOpen(false);

  const handleSectionClick = (event, id) => {
    event.preventDefault();
    if (isHome) {
      scrollToSection(id, closeMenu);
      return;
    }
    closeMenu();
    router.push(`/#${id}`);
  };

  const handleBrandClick = (event) => {
    if (isHome) {
      event.preventDefault();
      scrollToSection('home', closeMenu);
    } else {
      closeMenu();
    }
  };

  const handleLabKitClick = () => {
    closeMenu();
  };

  const handleInsightsClick = () => {
    closeMenu();
  };

  const renderNavLinks = () => (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = isHome && activeSection === item.id;
        const link = (
          <a
            key={item.id}
            href={isHome ? `#${item.id}` : `/#${item.id}`}
            className={`nav-link ${isActive ? 'active' : ''}`}
            onClick={(event) => handleSectionClick(event, item.id)}
          >
            {item.label}
          </a>
        );

        // Inject LabKit pill and Insights link between Expertise and Contact
        if (item.id === 'expertise') {
          return (
            <span key="expertise-with-labkit" style={{ display: 'contents' }}>
              {link}
              <Link
                key="labkit"
                href="/labkit"
                className={`nav-labkit ${isLabKit ? 'is-current' : ''}`}
                onClick={handleLabKitClick}
                aria-current={isLabKit ? 'page' : undefined}
              >
                <Calculator size={16} aria-hidden="true" />
                <span>LabKit</span>
              </Link>
              <Link
                key="insights"
                href="/insights"
                className={`nav-labkit ${isInsights ? 'is-current' : ''}`}
                onClick={handleInsightsClick}
                aria-current={isInsights ? 'page' : undefined}
              >
                <BookOpen size={16} aria-hidden="true" />
                <span>Insights</span>
              </Link>
            </span>
          );
        }

        return link;
      })}
    </>
  );

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div className="brand-group">
          {isHome ? (
            <a href="#home" className="brand" onClick={handleBrandClick}>
              <span className="brand-struc">Struc</span><span className="brand-lab">Lab</span>
            </a>
          ) : (
            <Link href="/" className="brand" onClick={handleBrandClick}>
              <span className="brand-struc">Struc</span><span className="brand-lab">Lab</span>
            </Link>
          )}
        </div>

        <nav className="nav-desktop" aria-label="Primary navigation">
          {renderNavLinks()}
        </nav>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <nav
        id="mobile-nav"
        className={`nav-mobile ${isOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
      >
        <div>
          {renderNavLinks()}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
