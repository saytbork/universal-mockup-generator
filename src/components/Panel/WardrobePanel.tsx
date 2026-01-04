import React from 'react';

interface PillOption {
    label: string;
    value: string;
    description?: string;
}

interface WardrobePanelProps {
    options: PillOption[];
    selectedValue: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

/**
 * Stripe-style Wardrobe Panel with pill buttons
 * Features: 3-column grid, subtle dark background, smooth hover
 */
const WardrobePanel: React.FC<WardrobePanelProps> = ({
    options,
    selectedValue,
    onChange,
    disabled = false,
}) => {
    return (
        <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-gray-600 mb-2">
                Wardrobe Style
            </p>
            <div className="grid grid-cols-3 gap-2">
                {options.map((option) => {
                    const isActive = selectedValue === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => !disabled && onChange(option.value)}
                            disabled={disabled}
                            className={`
                px-2.5 py-2 rounded-lg text-center transition-all duration-150
                border text-xs font-medium
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isActive
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-105 duration-500'
                                    : 'border-gray-200 bg-gray-100 text-gray-600 hover:border-indigo-600 hover:text-gray-900'
                                }
              `}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default WardrobePanel;
