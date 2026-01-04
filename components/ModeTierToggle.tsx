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
        localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    };

    return (
        <div className="flex items-center gap-3">
            {showThemeToggle && (
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="h-9 w-9 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-indigo-600 dark:hover:border-indigo-500 transition-all duration-300 flex items-center justify-center"
                    aria-label="Toggle theme"
                    title="Toggle theme"
                >
                    <Moon className="theme-icon-light w-4 h-4" />
                    <Sun className="theme-icon-dark w-4 h-4" />
                </button>
            )}
            <div className="relative flex items-center rounded-full bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 p-1">
                <button
                    type="button"
                    onClick={() => onModeChange('lifestyle')}
                    className={`relative z-10 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ease-out ${mode === 'lifestyle'
                        ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    LIFESTYLE
                </button>
                <button
                    type="button"
                    onClick={() => onModeChange('studio')}
                    className={`relative z-10 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ease-out ${mode === 'studio'
                        ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    STUDIO
                </button>
            </div>
        </div>
    );
};

export default ModeTierToggle;
