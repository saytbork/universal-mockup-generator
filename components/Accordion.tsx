import React, { useState } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  /** Optional subtitle shown below the title */
  subtitle?: string;
  /** Badge to show next to title (e.g., count) */
  badge?: string | number;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  isOpen,
  onToggle,
  subtitle,
  badge
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(prev => !prev);
    }
  };

  return (
    <div className="rounded-apple border border-borderSubtle bg-surface overflow-hidden transition-all">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex justify-between items-center p-4 text-left bg-surface hover:bg-surfaceElevated transition-colors focus:outline-none"
        aria-expanded={open}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-textPrimary tracking-wide">
              {title}
            </span>
              {badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent text-white border border-accent">
                  {badge}
                </span>
            )}
          </div>
          {subtitle && (
            <span className="text-xs text-textMuted">{subtitle}</span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-textMuted transition-transform duration-300 ease-out ${open ? 'rotate-180' : 'rotate-0'
            }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`grid transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-t border-borderSubtle bg-surfaceTint ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;
