import React from 'react';
import { Chip } from '../ui/Chip';
import { SwitchToggle } from '../ui/SwitchToggle';

export const STEP3_SECTION_TITLE_CLASS = 'text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40';
export const STEP3_SECTION_DESCRIPTION_CLASS = 'text-xs text-gray-500 dark:text-white/50';
export const STEP3_CONTROL_GROUP_CLASS = 'space-y-4';

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="space-y-1">
      <p className={STEP3_SECTION_TITLE_CLASS}>{title}</p>
      {description ? <p className={STEP3_SECTION_DESCRIPTION_CLASS}>{description}</p> : null}
    </header>
  );
}

export function ControlGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${STEP3_CONTROL_GROUP_CLASS} ${className}`.trim()}>{children}</div>;
}

export function ChipGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-wrap gap-2 ${className}`.trim()}>{children}</div>;
}

export function Toggle({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return <SwitchToggle checked={checked} onCheckedChange={onCheckedChange} aria-label={ariaLabel} />;
}

export { Chip };
