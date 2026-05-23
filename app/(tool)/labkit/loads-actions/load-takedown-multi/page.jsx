import LoadTakedownMulti from '../../../../../components/labkit/loads-actions/LoadTakedownMulti';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/loads-actions/load-takedown-multi'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/loads-actions/load-takedown-multi' },
};

export default function LoadTakedownMultiPage() {
  return <LoadTakedownMulti />;
}
