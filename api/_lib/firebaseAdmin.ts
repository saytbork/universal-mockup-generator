import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

export const getAdminApp = () => {
  if (app) return app;

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountRaw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing');
  }

  const serviceAccount = JSON.parse(serviceAccountRaw);

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  return app;
};

export const getFirestore = () => getAdminApp().firestore();
