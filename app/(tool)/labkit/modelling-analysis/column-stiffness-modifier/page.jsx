import ColumnStiffnessModifier from '../../../../../components/labkit/modelling-analysis/ColumnStiffnessModifier';
import { staticRoutes } from '../../../../../content/seoConfig';

const route = staticRoutes['/labkit/modelling-analysis/column-stiffness-modifier'];

export const metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: '/labkit/modelling-analysis/column-stiffness-modifier' },
};

export default function ColumnStiffnessModifierPage() {
  return <ColumnStiffnessModifier />;
}
