import React from 'react';

export const ControlGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`.trim()}>{children}</div>
);

export default ControlGroup;
