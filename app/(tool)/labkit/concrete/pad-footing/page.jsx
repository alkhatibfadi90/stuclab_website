import PadFooting from '../../../../../components/labkit/concrete/PadFooting';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/concrete/pad-footing'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/concrete/pad-footing' },
};

export default function PadFootingPage() {
  return <PadFooting />;
}
