import { initializeApp, getApps } from "firebase/app";

// Support Vite client env (import.meta.env) and fallback to process.env for server contexts.
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : process.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? env.FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? env.FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? env.FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID ?? env.FIREBASE_APP_ID
};

// Debug: show which values loaded (but hide real keys)
try {
  const safeConfig = {
    apiKey: firebaseConfig.apiKey ? "***loaded***" : "MISSING",
    authDomain: firebaseConfig.authDomain || "MISSING",
    projectId: firebaseConfig.projectId || "MISSING",
    storageBucket: firebaseConfig.storageBucket || "MISSING",
    appId: firebaseConfig.appId ? "***loaded***" : "MISSING",
  };
  console.log("🔥 Firebase config loaded:", safeConfig);
} catch (e) {
  console.log("🔥 Firebase config error:", e);
}

export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];
