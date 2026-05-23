import LoadsActionsIndex from '../../../../components/labkit/loads-actions/LoadsActionsIndex';
import { staticRoutes } from '../../../../content/seoConfig';

export const metadata = {
  title: staticRoutes['/labkit/loads-actions'].title,
  description: staticRoutes['/labkit/loads-actions'].description,
  alternates: { canonical: '/labkit/loads-actions' },
};

export default function LoadsActionsIndexPage() {
  return <LoadsActionsIndex />;
}
