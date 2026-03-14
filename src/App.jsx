import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Expertise from './components/Expertise';
import WhyChooseUs from './components/WhyChooseUs';
import Contact from './components/Contact';
import Footer from './components/Footer';

const sectionIds = ['home', 'about', 'services', 'expertise', 'contact'];

function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '-20% 0px -45% 0px',
      },
    );

    sections.forEach((section) => sectionObserver.observe(section));

    const revealElements = document.querySelectorAll('[data-reveal]');
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    return () => {
      sections.forEach((section) => sectionObserver.unobserve(section));
      revealElements.forEach((element) => revealObserver.unobserve(element));
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar activeSection={activeSection} />
      <main id="main-content">
        <Hero />
        <About />
        <Services />
        <Expertise />
        <WhyChooseUs />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
