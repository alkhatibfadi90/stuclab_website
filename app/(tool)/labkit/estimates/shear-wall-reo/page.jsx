import WallReo from '../../../../../components/labkit/estimates/WallReo';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/estimates/shear-wall-reo'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/estimates/shear-wall-reo' },
};

export default function ShearWallReoPage() {
  return <WallReo />;
}
