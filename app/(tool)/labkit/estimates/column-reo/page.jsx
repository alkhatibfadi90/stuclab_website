import ColumnReo from '../../../../../components/labkit/estimates/ColumnReo';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/estimates/column-reo'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/estimates/column-reo' },
};

export default function ColumnReoPage() {
  return <ColumnReo />;
}
