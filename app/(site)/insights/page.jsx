import InsightsIndex from '../../../components/insights/InsightsIndex';
import { staticRoutes } from '../../../content/seoConfig';

export const metadata = {
  title: staticRoutes['/insights'].title,
  description: staticRoutes['/insights'].description,
  alternates: { canonical: '/insights' },
};

export default function InsightsPage() {
  return <InsightsIndex />;
}
