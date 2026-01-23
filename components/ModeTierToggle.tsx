import React from 'react';
import { Moon, Sun } from 'lucide-react';

export type AppMode = 'lifestyle' | 'studio';

interface ModeTierToggleProps {
    mode: AppMode;
    onModeChange: (mode: AppMode) => void;
    showThemeToggle?: boolean;
}

const ModeTierToggle: React.FC<ModeTierToggleProps> = ({
    mode,
    onModeChange,
    showThemeToggle = true,
}) => {
    const toggleTheme = () => {
        const root = document.documentElement;
        const nextIsDark = !root.classList.contains('dark');
        root.classList.toggle('dark', nextIsDark);
        document.body.classList.toggle('dark', nextIsDark);
        root.style.colorScheme = nextIsDark ? 'dark' : 'light';
        try {
            localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
        } catch {
            // ignore
        }
    };

    return (
        <div className="flex items-center gap-3">
            {showThemeToggle && (
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 text-gray-500 hover:text-gray-900  hover:border-indigo-600  transition-all duration-300 flex items-center justify-center"
                    aria-label="Toggle theme"
                    title="Toggle theme"
                >
                    <Moon className="theme-icon-light w-4 h-4" />
                    <Sun className="theme-icon-dark w-4 h-4" />
                </button>
            )}
            <div className="relative flex items-center rounded-full bg-whiteTint bg-white border border-gray-200 p-1">
                <button
                    type="button"
                    onClick={() => onModeChange('lifestyle')}
                    className={`relative z-10 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ease-out ${mode === 'lifestyle'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 '
                        }`}
                >
                    LIFESTYLE
                </button>
                <button
                    type="button"
                    onClick={() => onModeChange('studio')}
                    className={`relative z-10 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ease-out ${mode === 'studio'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 '
                        }`}
                >
                    STUDIO
                </button>
            </div>
        </div>
    );
};

export default ModeTierToggle;
