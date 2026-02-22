import React from 'react';
import { SwitchToggle } from '../../ui/SwitchToggle';

export const Toggle: React.FC<{
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  ariaLabel: string;
}> = ({ checked, onCheckedChange, ariaLabel }) => (
  <SwitchToggle checked={checked} onCheckedChange={onCheckedChange} aria-label={ariaLabel} />
);

export default Toggle;
