import React from 'react';
import SceneBuilderLifestyle from '../SceneBuilderLifestyle';
import type { Step3Values } from '@/types/step3Types';

export interface LifestyleStep3Props {
  onValuesChange?: (values: Step3Values) => void;
  onCanGenerateChange?: (canGenerate: boolean) => void;
  hasModelReference?: boolean;
}

const LifestyleStep3: React.FC<LifestyleStep3Props> = ({
  onValuesChange,
  onCanGenerateChange,
  hasModelReference,
}) => (
  <SceneBuilderLifestyle
    onValuesChange={onValuesChange}
    onCanGenerateChange={onCanGenerateChange}
    hasModelReference={hasModelReference}
  />
);

export default LifestyleStep3;
