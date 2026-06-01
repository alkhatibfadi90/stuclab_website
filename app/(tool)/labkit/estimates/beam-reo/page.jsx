import BeamReo from '../../../../../components/labkit/estimates/BeamReo';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/estimates/beam-reo'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/estimates/beam-reo' },
};

export default function BeamReoPage() {
  return <BeamReo />;
}
