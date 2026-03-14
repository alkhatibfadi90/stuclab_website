import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Expertise from './components/Expertise';
import WhyChooseUs from './components/WhyChooseUs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { SECTION_IDS } from './content/siteContent';
import { useActiveSection } from './hooks/useActiveSection';
import { useRevealOnScroll } from './hooks/useRevealOnScroll';

function App() {
  const activeSection = useActiveSection(SECTION_IDS);
  useRevealOnScroll();

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
