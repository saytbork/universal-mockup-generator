import React from 'react';
import Step3Legacy, { type LifestyleStep3Props } from './step3/Step3Legacy';

export type { Step3Values, ExpertRole, ExpertAttire } from './step3/Step3Legacy';

const StudioStep3: React.FC<LifestyleStep3Props> = (props) => {
  return <Step3Legacy {...props} isProductMode />;
};

export default StudioStep3;
