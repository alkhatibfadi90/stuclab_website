import Home from '../../components/Home';
import { staticRoutes } from '../../content/seoConfig';

const home = staticRoutes['/'];

// The <title> (browser tab + Google search result) keeps the name so the site
// stays discoverable by a name search. The social share card (og:/twitter:)
// uses the name-free title instead — see openGraph/twitter below.
const titleWithName = `${home.title} | Fadi Al-Khatib, PhD, CPEng`;

export const metadata = {
  // Home keeps its full title verbatim (no "| StrucLab" template suffix).
  title: { absolute: titleWithName },
  description: home.description,
  alternates: { canonical: '/' },
  // openGraph/twitter are redeclared in full on purpose: Next.js shallow-merges
  // metadata, so declaring these here REPLACES (does not deep-merge) the values
  // inherited from app/layout.jsx. siteName/locale/type/card/images below mirror
  // the layout exactly; only the title/description are overridden to the
  // name-free versions so the shared link preview omits the name.
  openGraph: {
    title: home.title,
    description: home.description,
    siteName: 'StrucLab',
    locale: 'en_AU',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: home.title,
    description: home.description,
    images: ['/og-image.svg'],
  },
};

export default function HomePage() {
  return <Home />;
}
