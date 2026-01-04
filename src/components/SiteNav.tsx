import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Moon, Sun } from 'lucide-react';

const SiteNav: React.FC = () => {
  const [showResources, setShowResources] = useState(false);
  const [isSticky, setIsSticky] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, emailUser, isGuest } = useAuth();
  const isAuthed = Boolean(user || emailUser || isGuest);

  useEffect(() => {
    setIsSticky(true);
  }, []);

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

  const allLinks = (
    <>
      <Link to="/" className="hover:text-textPrimary transition" onClick={() => setMobileMenuOpen(false)}>
        Home
      </Link>
      <Link to="/use-cases" className="hover:text-textPrimary transition" onClick={() => setMobileMenuOpen(false)}>
        Use Cases
      </Link>
      <Link to="/comparisons" className="hover:text-textPrimary transition" onClick={() => setMobileMenuOpen(false)}>
        Comparisons
      </Link>
      <a href="/#pricing" className="hover:text-textPrimary transition" onClick={() => setMobileMenuOpen(false)}>
        Pricing
      </a>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowResources(prev => !prev)}
          className="hover:text-textPrimary transition flex items-center gap-1"
        >
          Resources <span className="text-xs">▾</span>
        </button>
        {showResources && (
          <div className="absolute right-0 mt-2 bg-surface text-textPrimary shadow-md shadow-accent-glow rounded-2xl border border-borderSubtle p-4 flex-col gap-2 min-w-[180px]">
            <Link to="/blog" className="block hover:text-accent" onClick={() => { setShowResources(false); setMobileMenuOpen(false); }}>
              Blog
            </Link>
            <Link to="/guides" className="block hover:text-accent" onClick={() => { setShowResources(false); setMobileMenuOpen(false); }}>
              Guides
            </Link>
            <Link to="/faq" className="block hover:text-accent" onClick={() => { setShowResources(false); setMobileMenuOpen(false); }}>
              FAQ
            </Link>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className={`w-full ${isSticky ? 'sticky top-0 z-40' : ''} bg-bg border-b border-borderSubtle`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-textSecondary">
        <Link to="/" className="flex items-center gap-2 text-textPrimary font-semibold">
          <span className="px-3 py-1 rounded-full bg-accent text-xs text-white">BoostUGC</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {allLinks}
          <button
            type="button"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full border border-borderSubtle bg-surface text-textSecondary hover:text-textPrimary hover:border-accent transition flex items-center justify-center"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <Moon className="theme-icon-light" size={16} />
            <Sun className="theme-icon-dark" size={16} />
          </button>
          {isAuthed ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-full bg-accent px-4 py-2 font-semibold text-white hover:bg-accent transition"
              >
                Dashboard
              </Link>
              <Link
                to="/app"
                className="rounded-full border border-borderSubtle px-4 py-2 font-semibold text-textPrimary hover:border-accent transition"
              >
                Go to App
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full bg-accent px-4 py-2 font-semibold text-white hover:bg-accent transition"
              >
                Login
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-borderSubtle px-4 py-2 font-semibold text-textPrimary hover:border-accent transition"
              >
                Start Now
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden flex flex-col gap-1.5 focus:outline-none"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileMenuOpen(prev => !prev)}
        >
          <span className={`block h-0.5 w-6 bg-surface transition ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block h-0.5 w-6 bg-surface transition ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-surface transition ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[999] bg-bg">
          <div className="relative max-w-sm w-full h-full mx-auto bg-bg border border-borderSubtle p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-textPrimary font-semibold text-lg">Menu</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="h-9 w-9 rounded-full border border-borderSubtle bg-surface text-textSecondary hover:text-textPrimary hover:border-accent transition flex items-center justify-center"
                  aria-label="Toggle theme"
                  title="Toggle theme"
                >
                  <Moon className="theme-icon-light" size={16} />
                  <Sun className="theme-icon-dark" size={16} />
                </button>
                <button
                  type="button"
                  className="text-textSecondary hover:text-textPrimary transition"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
            </div>
            <nav className="flex flex-col gap-3 text-lg text-textPrimary">
              {allLinks}
            </nav>
            <div className="flex flex-col gap-3">
              {isAuthed ? (
                <>
                  <Link
                    to="/dashboard"
                    className="rounded-full bg-accent px-4 py-2 font-semibold text-white text-center hover:bg-accent transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/app"
                    className="rounded-full border border-borderSubtle px-4 py-2 font-semibold text-textPrimary text-center hover:border-accent transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to App
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full bg-accent px-4 py-2 font-semibold text-white text-center hover:bg-accent transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-full border border-borderSubtle px-4 py-2 font-semibold text-textPrimary text-center hover:border-accent transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Start Now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteNav;
