import LabKit from '../../../components/LabKit';
import { staticRoutes } from '../../../content/seoConfig';

export const metadata = {
  title: staticRoutes['/labkit'].title,
  description: staticRoutes['/labkit'].description,
  alternates: { canonical: '/labkit' },
};

export default function LabKitPage() {
  return <LabKit />;
}
