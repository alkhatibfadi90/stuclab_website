'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { SECTION_IDS } from '../../content/siteContent';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';

// Site chrome: every route in the (site) group gets the Navbar + Footer.
// LabKit tool pages live in the (tool) group and deliberately render their
// own chrome instead — this mirrors the original App.jsx behaviour.
export default function SiteLayout({ children }) {
  const pathname = usePathname();
  const activeSection = useActiveSection(SECTION_IDS, pathname);
  const isInsightsRoute = pathname.startsWith('/insights');
  useRevealOnScroll(pathname, { disabled: isInsightsRoute });

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <>
      <Navbar activeSection={activeSection} />
      <main
        id="main-content"
        className={isInsightsRoute ? 'no-reveal-animations' : undefined}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
