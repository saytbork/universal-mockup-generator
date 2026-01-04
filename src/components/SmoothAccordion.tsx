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
  titleClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;
  tooltipClassName?: string;
  chevronClassName?: string;
  contentClassName?: string;
  ui?: 'legacy' | 'tokens';
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
  titleClassName = '',
  buttonClassName = '',
  iconClassName = '',
  tooltipClassName = '',
  chevronClassName = '',
  contentClassName = '',
  ui = 'legacy',
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

  const containerVariantClass = (() => {
    switch (variant) {
      case 'secondary':
        return 'opacity-90';
      case 'expert':
        return 'opacity-80';
      case 'primary':
      default:
        return '';
    }
  })();

  if (ui === 'tokens') {
    return (
      <div
        className={`rounded-apple border border-borderSubtle bg-surface overflow-hidden transition-all rounded-md bg-white ${containerVariantClass} ${className}`}
      >
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full flex items-center justify-between p-4 bg-surface hover:bg-surfaceElevated transition-colors focus:outline-none rounded-md ${buttonClassName}`}
          aria-expanded={open}
        >
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 text-accent ${iconClassName}`} />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold text-accent ${titleClassName}`}>{title}</p>
                {isRequired && !isTouched && (
                  <span className="text-xs text-textMuted">*Required</span>
                )}
                {isTouched && isActive && (
                  <Check className="w-4 h-4 text-accent" />
                )}
              </div>
              <p className={`text-xs text-textMuted opacity-80 ${tooltipClassName}`}>{tooltip}</p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-textMuted transform transition-transform duration-300 ${open ? 'rotate-180 text-accent' : ''} ${chevronClassName}`}
          />
        </button>
        <div
          className={`grid transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-t border-borderSubtle bg-surfaceTint ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="overflow-hidden">
            <div className={`p-4 ${contentClassName}`}>{children}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white overflow-hidden mb-4 transition-all duration-300 ${containerVariantClass} ${className} dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]`}
    >
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors focus:outline-none dark:bg-transparent dark:hover:bg-white/5 ${buttonClassName}`}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${iconClassName || 'text-indigo-600 dark:text-indigo-300'}`} />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold text-gray-900 dark:text-white ${titleClassName}`}>{title}</p>
              {isRequired && !isTouched && (
                <span className="text-xs text-gray-500 dark:text-white/50">*Required</span>
              )}
              {isTouched && isActive && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className={`text-[10px] text-gray-500 font-medium dark:text-white/40 ${tooltipClassName}`}>{tooltip}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transform transition-transform duration-300 dark:text-white/50 ${open ? 'rotate-180 text-indigo-600 dark:text-indigo-300' : ''} ${chevronClassName}`}
        />
      </button>
      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-t border-gray-200 overflow-hidden ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className={`p-4 bg-gray-50 dark:bg-white/5 ${contentClassName}`}>{children}</div>
      </div>
    </div>
  );
};

export default SmoothAccordion;
