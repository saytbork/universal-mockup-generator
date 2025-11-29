import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

export const getAdminApp = () => {
  if (app) return app;

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (!serviceAccount) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT is not set. Provide the service account JSON string to enable server-side Firebase Admin.'
    );
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  return app;
};

export const getFirestore = () => getAdminApp().firestore();
