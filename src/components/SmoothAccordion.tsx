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
  className = ''
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

  const headerTextClass = open ? 'text-indigo-400' : 'text-gray-200';

  return (
    <div className={`rounded-xl border border-gray-700 bg-gray-800/30 overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-700/20 transition focus:outline-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-400" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold ${headerTextClass}`}>{title}</p>
              {isRequired && !isTouched && (
                <span className="text-xs text-amber-400">*Required</span>
              )}
              {isTouched && isActive && (
                <Check className="w-4 h-4 text-green-400" />
              )}
            </div>
            <p className="text-xs text-gray-400">{tooltip}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-300 ${
            open ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>
      <div
        className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-t border-gray-700 overflow-hidden ${open ? 'max-h-[1200px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}`}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SmoothAccordion;
