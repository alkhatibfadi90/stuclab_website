import AutomationIndex from '../../../../components/labkit/automation/AutomationIndex';
import { staticRoutes } from '../../../../content/seoConfig';

export const metadata = {
  title: staticRoutes['/labkit/automation'].title,
  description: staticRoutes['/labkit/automation'].description,
  alternates: { canonical: '/labkit/automation' },
};

export default function AutomationIndexPage() {
  return <AutomationIndex />;
}
