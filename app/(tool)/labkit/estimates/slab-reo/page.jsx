import SlabReo from '../../../../../components/labkit/estimates/SlabReo';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/estimates/slab-reo'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/estimates/slab-reo' },
};

export default function SlabReoPage() {
  return <SlabReo />;
}
