'use client';

import { useEffect } from 'react';
import Hero from './Hero';
import About from './About';
import Services from './Services';
import ProfessionalCredentials from './ProfessionalCredentials';
import Expertise from './Expertise';
import WhyChooseUs from './WhyChooseUs';
import Contact from './Contact';
import { scrollToSection } from '../utils/scrollToSection';

function Home() {
  useEffect(() => {
    // When the home page is reached with a hash (e.g. /#contact from another
    // route), scroll to the target section once the layout has settled.
    const { hash } = window.location;
    if (!hash) {
      return undefined;
    }
    const id = hash.slice(1);
    const attempt = () => scrollToSection(id);
    const t1 = window.setTimeout(attempt, 50);
    const t2 = window.setTimeout(attempt, 250);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

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
