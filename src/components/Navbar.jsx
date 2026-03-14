import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Expertise', id: 'expertise' },
  { label: 'Contact', id: 'contact' },
];

function Navbar({ activeSection }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavClick = (event, id) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  };

  return (
    <header className="navbar navbar-scrolled">
      <div className="container navbar-inner">
        <a href="#home" className="brand" onClick={(event) => handleNavClick(event, 'home')}>
          <span className="brand-struc">Struc</span><span className="brand-lab">Lab</span>
        </a>

        <nav className="nav-desktop" aria-label="Primary navigation">
          {navItems.map((item) => (
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
          {navItems.map((item) => (
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
