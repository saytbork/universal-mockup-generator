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
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                Interaction Style
            </p>
            <div className="grid grid-cols-2 gap-2">
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
                                    ? 'border-indigo-500/50 bg-white/[0.08] text-white'
                                    : 'border-white/10 bg-white/[0.02] text-gray-300 hover:border-white/20 hover:bg-white/[0.04]'
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
