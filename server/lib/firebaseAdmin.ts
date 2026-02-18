/**
 * Firebase Admin SDK - Server-side only
 * Used for server-to-server Firebase Storage operations
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT as string
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`,
  });

  console.log('✅ Firebase Admin SDK initialized successfully');
}

// Export bucket directly for easy access
export const bucket = admin.storage().bucket();
