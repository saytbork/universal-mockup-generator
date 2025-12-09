import React, { useState, useRef, useEffect } from 'react';

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

/**
 * Stripe-style Accordion with smooth height animation
 * Features:
 * - Dark mode (#0B0F19 compatible)
 * - Smooth max-height transition
 * - Chevron rotation on open/close
 * - Subtle borders and modern spacing
 */
const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  isOpen,
  onToggle,
  subtitle,
  badge
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen;

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [open, children]);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(prev => !prev);
    }
  };

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex justify-between items-center py-4 px-3 text-left transition-colors duration-150 hover:bg-white/[0.02] rounded-lg group"
        aria-expanded={open}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-100 tracking-wide">
              {title}
            </span>
            {badge !== undefined && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-xs text-gray-500">{subtitle}</span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ease-out ${open ? 'rotate-180' : 'rotate-0'
            }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Animated content container */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: open ? contentHeight + 32 : 0,
          opacity: open ? 1 : 0
        }}
      >
        <div ref={contentRef} className="px-3 pb-4 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
