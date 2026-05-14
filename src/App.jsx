import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import LabKit from './components/LabKit';
import ConcreteIndex from './components/labkit/concrete/ConcreteIndex';
import ColumnPunching from './components/labkit/concrete/ColumnPunching';
import InsightsIndex from './components/insights/InsightsIndex';
import InsightsByTag from './components/insights/InsightsByTag';
import InsightPost from './components/insights/InsightPost';
import Footer from './components/Footer';
import { SECTION_IDS } from './content/siteContent';
import { useActiveSection } from './hooks/useActiveSection';
import { useRevealOnScroll } from './hooks/useRevealOnScroll';

// LabKit tool pages (3+ segments under /labkit) render their own topbar/footer
// and replace the site chrome. Category landings (e.g. /labkit/concrete) keep it.
const TOOL_ROUTE_RE = /^\/labkit\/[^/]+\/[^/]+/;

function App() {
  const location = useLocation();
  const activeSection = useActiveSection(SECTION_IDS, location.pathname);
  useRevealOnScroll(location.pathname);

  const isToolPage = TOOL_ROUTE_RE.test(location.pathname);

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
      {!isToolPage && <Navbar activeSection={activeSection} />}
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/labkit" element={<LabKit />} />
          <Route path="/labkit/concrete" element={<ConcreteIndex />} />
          <Route path="/labkit/concrete/column-punching" element={<ColumnPunching />} />
          <Route path="/insights" element={<InsightsIndex />} />
          <Route path="/insights/tag/:tag" element={<InsightsByTag />} />
          <Route path="/insights/:slug" element={<InsightPost />} />
        </Routes>
      </main>
      {!isToolPage && <Footer />}
    </>
  );
}

export default App;
