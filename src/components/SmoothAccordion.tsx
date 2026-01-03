import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface SmoothAccordionProps {
  title: string;
  tooltip: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  defaultOpen?: boolean;
  isRequired?: boolean;
  isTouched?: boolean;
  isActive?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'expert';
}

const SmoothAccordion: React.FC<SmoothAccordionProps> = ({
  title,
  tooltip,
  icon: Icon,
  children,
  isOpen,
  onToggle,
  defaultOpen = false,
  isRequired = false,
  isTouched = false,
  isActive = true,
  className = '',
  variant = 'primary',
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = typeof isOpen === 'boolean';
  const open = controlled ? isOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(prev => !prev);
    }
  };

  const headerTextClass = open ? 'text-accent' : 'text-textPrimary';
  const containerVariantClass = (() => {
    switch (variant) {
      case 'secondary':
      case 'expert':
      case 'primary':
      default:
        return '';
    }
  })();

  return (
    <div className={`rounded-apple border border-borderSubtle bg-surface overflow-hidden transition-all ${containerVariantClass} ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surfaceElevated transition-colors focus:outline-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-accent" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold ${headerTextClass}`}>{title}</p>
              {isRequired && !isTouched && (
                <span className="text-xs text-textMuted">*Required</span>
              )}
              {isTouched && isActive && (
                <Check className="w-4 h-4 text-accent" />
              )}
            </div>
            <p className="text-xs text-textMuted opacity-80">{tooltip}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-textMuted transform transition-transform duration-300 ${open ? 'rotate-180 text-accent' : ''}`}
        />
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

export default SmoothAccordion;
