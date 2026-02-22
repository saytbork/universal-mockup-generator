import React from 'react';
import StudioEngine from './engines/StudioEngine';
import LifestyleEngine from './engines/LifestyleEngine';
import type { LifestyleStep3Props } from './Step3Legacy';

type Step3RouterProps = LifestyleStep3Props & {
  mode: 'studio' | 'lifestyle';
};

const Step3Router: React.FC<Step3RouterProps> = ({ mode, ...props }) => {
  if (mode === 'studio') return <StudioEngine {...props} />;
  return <LifestyleEngine {...props} />;
};

export default Step3Router;
