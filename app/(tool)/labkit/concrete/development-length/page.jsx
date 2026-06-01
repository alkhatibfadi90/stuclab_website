import DevelopmentLength from '../../../../../components/labkit/concrete/DevelopmentLength';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/concrete/development-length'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/concrete/development-length' },
};

export default function DevelopmentLengthPage() {
  return <DevelopmentLength />;
}
