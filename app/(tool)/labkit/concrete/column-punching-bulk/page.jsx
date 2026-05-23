import ColumnPunchingBulk from '../../../../../components/labkit/concrete/ColumnPunchingBulk';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/concrete/column-punching-bulk'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/concrete/column-punching-bulk' },
};

export default function ColumnPunchingBulkPage() {
  return <ColumnPunchingBulk />;
}
