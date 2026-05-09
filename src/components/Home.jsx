import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from './Hero';
import About from './About';
import Services from './Services';
import ProfessionalCredentials from './ProfessionalCredentials';
import Expertise from './Expertise';
import WhyChooseUs from './WhyChooseUs';
import Contact from './Contact';
import { scrollToSection } from '../utils/scrollToSection';

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }
    const id = location.hash.slice(1);
    const attempt = () => scrollToSection(id);
    const t1 = window.setTimeout(attempt, 50);
    const t2 = window.setTimeout(attempt, 250);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [location.key, location.hash]);

  return (
    <>
      <Hero />
      <About />
      <Services />
      <Expertise />
      <ProfessionalCredentials />
      <WhyChooseUs />
      <Contact />
    </>
  );
}

export default Home;
