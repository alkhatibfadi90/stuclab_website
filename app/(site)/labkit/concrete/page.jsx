import ConcreteIndex from '../../../../components/labkit/concrete/ConcreteIndex';
import { staticRoutes } from '../../../../content/seoConfig';

export const metadata = {
  title: staticRoutes['/labkit/concrete'].title,
  description: staticRoutes['/labkit/concrete'].description,
  alternates: { canonical: '/labkit/concrete' },
};

export default function ConcreteIndexPage() {
  return <ConcreteIndex />;
}
