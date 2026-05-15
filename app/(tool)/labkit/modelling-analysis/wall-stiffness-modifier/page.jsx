import WallStiffnessModifier from '../../../../../components/labkit/modelling-analysis/WallStiffnessModifier';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/modelling-analysis/wall-stiffness-modifier'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/modelling-analysis/wall-stiffness-modifier' },
};

export default function WallStiffnessModifierPage() {
  return <WallStiffnessModifier />;
}
