import CoverExposure from '../../../../../components/labkit/concrete/CoverExposure';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/concrete/cover-exposure'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/concrete/cover-exposure' },
};

export default function CoverExposurePage() {
  return <CoverExposure />;
}
