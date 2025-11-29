import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Loader2, LogOut } from 'lucide-react';

export const FirebaseAuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading, isGuest, signInWithGoogle, sendMagicLink, finishMagicLinkSignIn, loginAsGuest, logout } = useAuth();
    const [email, setEmail] = useState(() => {
        if (typeof window === 'undefined') return '';
        return window.localStorage.getItem('emailForSignIn') || '';
    });
    const [linkSent, setLinkSent] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const isLoggedIn = Boolean(user || isGuest);

    useEffect(() => {
        if (typeof window === 'undefined' || user) return;
        try {
            finishMagicLinkSignIn(null, window.location.href).catch(console.error);
        } catch (err) {
            console.warn('Magic link parse error', err);
        }
    }, [user, finishMagicLinkSignIn]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-gray-900/70 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-indigo-300 mb-2">Welcome to BoostUGC</p>
                        <h1 className="text-3xl font-bold">Sign in to continue</h1>
                        <p className="mt-3 text-sm text-gray-400">
                            Create professional product mockups in seconds.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => signInWithGoogle().catch((e: any) => setAuthError(e.message))}
                            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Sign in with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-900/70 text-gray-500">Or continue with email code</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {!linkSent ? (
                                <>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                    <button
                                        onClick={async () => {
                                            setAuthError(null);
                                            try {
                                                await sendMagicLink(email);
                                                setLinkSent(true);
                                            } catch (e: any) {
                                                setAuthError(e.message || 'No se pudo enviar el enlace.');
                                            }
                                        }}
                                        className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Send magic link
                                    </button>
                                </>
                            ) : (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Mail className="w-6 h-6 text-green-400" />
                                    </div>
                                    <h3 className="text-white font-medium mb-1">Check your email</h3>
                                    <p className="text-sm text-gray-400 mb-3">
                                        We sent a login link to <span className="text-white">{email}</span>
                                    </p>
                                    <button
                                        onClick={() => setLinkSent(false)}
                                        className="text-xs text-gray-500 hover:text-white underline"
                                    >
                                        Use a different email
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-900/70 text-gray-500">Or try it out</span>
                            </div>
                        </div>

                        <button
                            onClick={() => loginAsGuest()}
                            className="w-full bg-transparent border border-gray-700 text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-800 hover:text-white transition-all"
                        >
                            Continue as Guest (2 Free Credits)
                        </button>

                        {authError && (
                            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                                {authError}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // User is logged in, render children with logout button in header
    return (
        <div className="relative">
            {/* Logout button overlay */}
            <div className="fixed top-4 right-4 z-[60]">
                <button
                    onClick={() => logout().catch((e: any) => console.warn('Logout warning', e))}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-xl px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white shadow-lg"
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </button>
            </div>
            {children}
        </div>
    );
};
