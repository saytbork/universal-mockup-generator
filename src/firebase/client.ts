import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

const hasRequiredConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId
);

let firestoreInstance: Firestore | null = null;

export const getClientFirestore = (): Firestore | null => {
  if (!hasRequiredConfig) {
    return null;
  }
  if (firestoreInstance) {
    return firestoreInstance;
  }
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  firestoreInstance = getFirestore(app);
  return firestoreInstance;
};
