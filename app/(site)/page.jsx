import Home from '../../components/Home';
import { staticRoutes } from '../../content/seoConfig';

export const metadata = {
  // Home keeps its full title verbatim (no "| StrucLab" template suffix).
  title: { absolute: staticRoutes['/'].title },
  description: staticRoutes['/'].description,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <Home />;
}
