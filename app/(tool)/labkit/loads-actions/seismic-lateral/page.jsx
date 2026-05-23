import SeismicLateral from '../../../../../components/labkit/loads-actions/SeismicLateral';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/loads-actions/seismic-lateral'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/loads-actions/seismic-lateral' },
};

export default function SeismicLateralPage() {
  return <SeismicLateral />;
}
