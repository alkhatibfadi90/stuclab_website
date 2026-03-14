import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NAV_ITEMS } from '../content/siteContent';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { scrollToSection } from '../utils/scrollToSection';

function Navbar({ activeSection }) {
  const [isOpen, setIsOpen] = useState(false);
  useBodyScrollLock(isOpen);

  const handleNavClick = (event, id) => {
    event.preventDefault();
    scrollToSection(id, () => setIsOpen(false));
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="#home" className="brand" onClick={(event) => handleNavClick(event, 'home')}>
          <span className="brand-struc">Struc</span><span className="brand-lab">Lab</span>
        </a>

        <nav className="nav-desktop" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={(event) => handleNavClick(event, item.id)}
            >
              {item.label}
            </a>
          ))}
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
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={(event) => handleNavClick(event, item.id)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
