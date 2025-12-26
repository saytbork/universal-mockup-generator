import React from 'react';
import SceneBuilderProduct from '../SceneBuilderProduct';
import type { Step3Values, ProductValues } from '@/types/step3Types';

export interface ProductStep3Props {
  onValuesChange?: (values: Step3Values | ProductValues) => void;
  onCanGenerateChange?: (canGenerate: boolean) => void;
}

const ProductStep3: React.FC<ProductStep3Props> = ({
  onValuesChange,
  onCanGenerateChange,
}) => (
  <SceneBuilderProduct
    onValuesChange={onValuesChange}
    onCanGenerateChange={onCanGenerateChange}
  />
);

export default ProductStep3;
