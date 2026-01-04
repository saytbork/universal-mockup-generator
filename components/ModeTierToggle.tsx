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
                    className="h-9 w-9 rounded-full border border-borderSubtle bg-surface text-textSecondary text-textMuted hover:text-textPrimary  hover:border-accent  transition-all duration-300 flex items-center justify-center"
                    aria-label="Toggle theme"
                    title="Toggle theme"
                >
                    <Moon className="theme-icon-light w-4 h-4" />
                    <Sun className="theme-icon-dark w-4 h-4" />
                </button>
            )}
            <div className="relative flex items-center rounded-full bg-surfaceTint bg-surface border border-borderSubtle p-1">
                <button
                    type="button"
                    onClick={() => onModeChange('lifestyle')}
                    className={`relative z-10 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ease-out ${mode === 'lifestyle'
                        ? 'bg-surface text-textPrimary shadow-sm'
                        : 'text-textMuted hover:text-textPrimary '
                        }`}
                >
                    LIFESTYLE
                </button>
                <button
                    type="button"
                    onClick={() => onModeChange('studio')}
                    className={`relative z-10 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ease-out ${mode === 'studio'
                        ? 'bg-surface text-textPrimary shadow-sm'
                        : 'text-textMuted hover:text-textPrimary '
                        }`}
                >
                    STUDIO
                </button>
            </div>
        </div>
    );
};

export default ModeTierToggle;
