const footerLinks = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Expertise', id: 'expertise' },
  { label: 'Contact', id: 'contact' },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-brand">StrucLab</p>
          <p>Structural &amp; Computational Engineering</p>
          <p>Perth, Australia</p>
          <p className="footer-copy">&copy; StrucLab</p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          {footerLinks.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
