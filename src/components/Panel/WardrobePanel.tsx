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
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
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
                                    ? 'border-indigo-500/50 bg-white/[0.08] text-white'
                                    : 'border-white/10 bg-white/[0.02] text-gray-300 hover:border-white/20 hover:bg-white/[0.04]'
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
