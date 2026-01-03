import React from 'react';

export type ModeTier = 'basic' | 'pro';

interface ModeTierToggleProps {
    modeTier: ModeTier;
    onToggle: (tier: ModeTier) => void;
}

const ModeTierToggle: React.FC<ModeTierToggleProps> = ({ modeTier, onToggle }) => {
    return (
        <div className="flex items-center justify-center gap-3 py-4 px-2 border-b border-borderSubtle mb-4">
            <button
                type="button"
                onClick={() => onToggle('basic')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${modeTier === 'basic'
                        ? 'bg-accent/10 text-accent border border-accent shadow-accent-glow scale-105 duration-500'
                        : 'bg-surfaceElevated text-textSecondary border border-borderSubtle hover:border-accent hover:text-textPrimary'
                    }`}
            >
                BASIC
            </button>
            <button
                type="button"
                onClick={() => onToggle('pro')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${modeTier === 'pro'
                        ? 'bg-accent/10 text-accent border border-accent shadow-accent-glow scale-105 duration-500'
                        : 'bg-surfaceElevated text-textSecondary border border-borderSubtle hover:border-accent hover:text-textPrimary'
                    }`}
            >
                PRO
            </button>
        </div>
    );
};

export default ModeTierToggle;
