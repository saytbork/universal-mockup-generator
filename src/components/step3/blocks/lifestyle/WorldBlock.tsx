import React from 'react';
import SectionHeader from '../../shared/SectionHeader';

const WorldBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="space-y-6 border-t border-gray-200/60 pt-12 dark:border-white/10">
    <SectionHeader title="WORLD" description="Place the product in context." />
    <div className="space-y-8">{children}</div>
  </section>
);

export default WorldBlock;
