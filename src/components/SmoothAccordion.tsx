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

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white overflow-hidden mb-4 transition-all duration-300 ${containerVariantClass} ${className} dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]`}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors focus:outline-none dark:bg-transparent dark:hover:bg-white/5"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
              {isRequired && !isTouched && (
                <span className="text-xs text-gray-500 dark:text-white/50">*Required</span>
              )}
              {isTouched && isActive && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-medium dark:text-white/40">{tooltip}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transform transition-transform duration-300 dark:text-white/50 ${open ? 'rotate-180 text-indigo-600 dark:text-indigo-300' : ''}`}
        />
      </button>
      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-t border-gray-200 overflow-hidden ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-4 bg-gray-50 dark:bg-white/5">{children}</div>
      </div>
    </div>
  );
};

export default SmoothAccordion;
