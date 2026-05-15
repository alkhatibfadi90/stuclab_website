import ColumnPunching from '../../../../../components/labkit/concrete/ColumnPunching';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/concrete/column-punching'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/concrete/column-punching' },
};

export default function ColumnPunchingPage() {
  return <ColumnPunching />;
}
