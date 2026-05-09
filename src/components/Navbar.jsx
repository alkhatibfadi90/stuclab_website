import { Menu, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../content/siteContent';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { scrollToSection } from '../utils/scrollToSection';

function Navbar({ activeSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isToolkit = location.pathname === '/toolkit';
  useBodyScrollLock(isOpen);

  const closeMenu = () => setIsOpen(false);

  const handleSectionClick = (event, id) => {
    event.preventDefault();
    if (isHome) {
      scrollToSection(id, closeMenu);
      return;
    }
    closeMenu();
    navigate({ pathname: '/', hash: `#${id}` });
  };

  const handleBrandClick = (event) => {
    if (isHome) {
      event.preventDefault();
      scrollToSection('home', closeMenu);
    } else {
      closeMenu();
    }
  };

  const handleToolkitClick = () => {
    closeMenu();
  };

  const renderNavLinks = () => (
    <>
      {NAV_ITEMS.map((item, index) => {
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

        // Inject Toolkit pill between Expertise and Contact
        if (item.id === 'expertise') {
          return (
            <span key="expertise-with-toolkit" style={{ display: 'contents' }}>
              {link}
              <Link
                key="toolkit"
                to="/toolkit"
                className={`nav-toolkit ${isToolkit ? 'is-current' : ''}`}
                onClick={handleToolkitClick}
                aria-current={isToolkit ? 'page' : undefined}
              >
                <Wrench size={15} strokeWidth={2.25} aria-hidden="true" />
                <span>Toolkit</span>
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
            <Link to="/" className="brand" onClick={handleBrandClick}>
              <span className="brand-struc">Struc</span><span className="brand-lab">Lab</span>
            </Link>
          )}
          <a
            href="https://www.linkedin.com/company/struclab-australia"
            className="brand-linkedin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="StrucLab on LinkedIn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="#0A66C2"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
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
