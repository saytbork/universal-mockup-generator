import React from 'react';
import SectionHeader from '../../shared/SectionHeader';

const HumanContextBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="space-y-6 border-t border-gray-200/60 pt-12 dark:border-white/10">
    <SectionHeader title="HUMAN CONTEXT" description="Optional interaction and narrative." />
    <div className="space-y-8">{children}</div>
  </section>
);

export default HumanContextBlock;
