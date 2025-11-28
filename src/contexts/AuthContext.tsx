
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signInWithPopup,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isGuest: boolean;
    signInWithGoogle: () => Promise<void>;
    sendMagicLink: (email: string) => Promise<void>;
    finishMagicLinkSignIn: (email: string, href: string) => Promise<void>;
    logout: () => Promise<void>;
    loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const sendMagicLink = async (email: string) => {
        const actionCodeSettings = {
            url: window.location.origin + '/app', // Redirect to main app after login
            handleCodeInApp: true,
        };
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
        } catch (error) {
            console.error("Error sending magic link", error);
            throw error;
        }
    };

    const finishMagicLinkSignIn = async (email: string, href: string) => {
        if (isSignInWithEmailLink(auth, href)) {
            try {
                await signInWithEmailLink(auth, email, href);
                window.localStorage.removeItem('emailForSignIn');
            } catch (error) {
                console.error("Error finishing magic link sign in", error);
                throw error;
            }
        }
    };

    const logout = async () => {
        await signOut(auth);
        setIsGuest(false);
    };

    const loginAsGuest = () => {
        setIsGuest(true);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isGuest, signInWithGoogle, sendMagicLink, finishMagicLinkSignIn, logout, loginAsGuest }}>
            {children}
        </AuthContext.Provider>
    );
};
