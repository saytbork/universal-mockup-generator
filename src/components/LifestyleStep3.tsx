import React from 'react';
import Step3Router from './step3/Step3Router';
import type { LifestyleStep3Props } from './step3/Step3Legacy';

export type { Step3Values, ExpertRole, ExpertAttire } from './step3/Step3Legacy';

const LifestyleStep3: React.FC<LifestyleStep3Props> = (props) => {
  const isEcommerceMode = Boolean(props.isProductMode);
  const mode = isEcommerceMode ? 'studio' : 'lifestyle';

  return <Step3Router mode={mode} {...props} />;
};

export default LifestyleStep3;
