import React from 'react';
import SectionHeader from '../../shared/SectionHeader';

const MoodBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="space-y-6">
    <SectionHeader title="MOOD" description="Define the emotional direction of the scene." />
    <div className="space-y-8">{children}</div>
  </section>
);

export default MoodBlock;
