import React from 'react';

export type ModeTier = 'basic' | 'pro';

interface ModeTierToggleProps {
    modeTier: ModeTier;
    onToggle: (tier: ModeTier) => void;
}

const ModeTierToggle: React.FC<ModeTierToggleProps> = ({ modeTier, onToggle }) => {
    return (
        <div className="flex items-center justify-center gap-3 py-4 px-2 border-b border-gray-700 mb-4">
            <button
                type="button"
                onClick={() => onToggle('basic')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${modeTier === 'basic'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    }`}
            >
                BASIC
            </button>
            <button
                type="button"
                onClick={() => onToggle('pro')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${modeTier === 'pro'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    }`}
            >
                PRO
            </button>
        </div>
    );
};

export default ModeTierToggle;
