import { useEffect } from 'react';
import { auth } from '../firebase/client';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

export default function CompleteSignIn() {
  useEffect(() => {
    async function complete() {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Enter your email') || '';
        }
        if (!email) return;
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        window.location.href = '/dashboard';
      }
    }
    complete();
  }, []);

  return <div className="page">Signing in...</div>;
}
