import ModellingAnalysisIndex from '../../../../components/labkit/modelling-analysis/ModellingAnalysisIndex';
import { staticRoutes } from '../../../../content/seoConfig';

export const metadata = {
  title: staticRoutes['/labkit/modelling-analysis'].title,
  description: staticRoutes['/labkit/modelling-analysis'].description,
  alternates: { canonical: '/labkit/modelling-analysis' },
};

export default function ModellingAnalysisIndexPage() {
  return <ModellingAnalysisIndex />;
}
