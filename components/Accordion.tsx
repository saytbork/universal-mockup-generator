

import React, { useState } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, isOpen, onToggle }) => {
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
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={handleToggle}
        className="w-full flex justify-between items-center py-3 text-left text-md font-semibold text-gray-200 hover:bg-gray-700/50 px-2 rounded-t-md transition-colors"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 transform transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pt-2 pb-4 px-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
