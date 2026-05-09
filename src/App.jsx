import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Toolkit from './components/Toolkit';
import Footer from './components/Footer';
import { SECTION_IDS } from './content/siteContent';
import { useActiveSection } from './hooks/useActiveSection';
import { useRevealOnScroll } from './hooks/useRevealOnScroll';

function App() {
  const location = useLocation();
  const activeSection = useActiveSection(SECTION_IDS, location.pathname);
  useRevealOnScroll(location.pathname);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar activeSection={activeSection} />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/toolkit" element={<Toolkit />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
