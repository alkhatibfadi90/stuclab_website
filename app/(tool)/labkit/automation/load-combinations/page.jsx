import LoadCombinations from '../../../../../components/labkit/automation/LoadCombinations';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/automation/load-combinations'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/automation/load-combinations' },
};

export default function LoadCombinationsPage() {
  return <LoadCombinations />;
}
