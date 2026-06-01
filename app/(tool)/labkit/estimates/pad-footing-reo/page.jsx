import PadFootingReo from '../../../../../components/labkit/estimates/PadFootingReo';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/estimates/pad-footing-reo'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/estimates/pad-footing-reo' },
};

export default function PadFootingReoPage() {
  return <PadFootingReo />;
}
