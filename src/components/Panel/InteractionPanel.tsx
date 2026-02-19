import React from 'react';

interface PillOption {
    label: string;
    value: string;
    description?: string;
}

interface InteractionPanelProps {
    options: PillOption[];
    selectedValue: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

/**
 * Stripe-style Interaction Panel with pill buttons
 * Features: 2-column grid, subtle dark background, smooth hover
 */
const InteractionPanel: React.FC<InteractionPanelProps> = ({
    options,
    selectedValue,
    onChange,
    disabled = false,
}) => {
    return (
        <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-gray-600 mb-2">
                Interaction Style
            </p>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const isActive = selectedValue === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => !disabled && onChange(option.value)}
                            disabled={disabled}
                            className={`
                px-3 py-2.5 rounded-lg text-left transition-all duration-150
                border text-sm font-medium
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isActive
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-md shadow-indigo-500/20 scale-105 duration-500'
                                    : 'border-gray-200 bg-whiteTint text-gray-600 hover:border-indigo-600 hover:text-gray-900'
                                }
              `}
                        >
                            <span className="block">{option.label}</span>
                            {option.description && (
                                <span className="block text-[11px] text-gray-500 mt-0.5">
                                    {option.description}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default InteractionPanel;
