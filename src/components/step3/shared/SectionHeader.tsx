import React from 'react';

export const SectionHeader: React.FC<{ title: string; description?: string; className?: string }> = ({
  title,
  description,
  className = '',
}) => (
  <header className={`space-y-1 ${className}`.trim()}>
    <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40">{title}</p>
    {description ? <p className="text-xs text-gray-500 dark:text-white/50">{description}</p> : null}
  </header>
);

export default SectionHeader;
