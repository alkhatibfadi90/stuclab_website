import LoadTakedown from '../../../../../components/labkit/loads-actions/LoadTakedown';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/loads-actions/load-takedown'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/loads-actions/load-takedown' },
};

export default function LoadTakedownPage() {
  return <LoadTakedown />;
}
