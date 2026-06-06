import SlabPtReo from '../../../../../components/labkit/estimates/SlabPtReo';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/estimates/slab-pt-reo'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/estimates/slab-pt-reo' },
};

export default function SlabPtReoPage() {
  return <SlabPtReo />;
}
