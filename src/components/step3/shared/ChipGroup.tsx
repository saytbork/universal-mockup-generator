import React from 'react';

export const ChipGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-wrap gap-2 ${className}`.trim()}>{children}</div>
);

export default ChipGroup;
