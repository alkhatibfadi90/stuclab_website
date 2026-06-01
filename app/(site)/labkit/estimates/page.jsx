import EstimatesIndex from '../../../../components/labkit/estimates/EstimatesIndex';
import { staticRoutes } from '../../../../content/seoConfig';

export const metadata = {
  title: staticRoutes['/labkit/estimates'].title,
  description: staticRoutes['/labkit/estimates'].description,
  alternates: { canonical: '/labkit/estimates' },
};

export default function EstimatesIndexPage() {
  return <EstimatesIndex />;
}
