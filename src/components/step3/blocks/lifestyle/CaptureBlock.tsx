import React from 'react';
import SectionHeader from '../../shared/SectionHeader';

const CaptureBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="space-y-6 border-t border-gray-200/60 pt-12 dark:border-white/10">
    <SectionHeader title="CAPTURE" description="How the moment is filmed." />
    <div className="space-y-8">{children}</div>
  </section>
);

export default CaptureBlock;
