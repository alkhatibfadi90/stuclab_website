import PdeltaStability from '../../../../../components/labkit/loads-actions/PdeltaStability';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/loads-actions/pdelta-stability'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/loads-actions/pdelta-stability' },
};

export default function PdeltaStabilityPage() {
  return <PdeltaStability />;
}
