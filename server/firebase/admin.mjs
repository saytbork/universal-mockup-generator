/**
 * Firebase Admin SDK initialization for Vercel serverless functions
 * Uses ESM syntax for compatibility with "type": "module" in package.json
 */

import admin from 'firebase-admin';

let initialized = false;

/**
 * Initialize Firebase Admin SDK
 * Uses singleton pattern to prevent multiple initializations in serverless environment
 */
function initializeFirebaseAdmin() {
  if (initialized) return;

  try {
    // Check if already initialized (serverless warm starts)
    if (!admin.apps.length) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

      if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
      }

      if (!storageBucket) {
        throw new Error('FIREBASE_STORAGE_BUCKET environment variable is not set');
      }

      // Parse service account key JSON
      let credential;
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        credential = admin.credential.cert(serviceAccount);
      } catch (parseError) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError.message}`);
      }

      // Initialize Admin SDK
      admin.initializeApp({
        credential,
        storageBucket
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    }

    initialized = true;
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
    throw error;
  }
}

// Initialize immediately when module is imported
initializeFirebaseAdmin();

// Export Firestore instance
export const adminDB = admin.firestore();

// Export Storage bucket instance
export const adminStorage = admin.storage().bucket();

// Export FieldValue for timestamp operations
export const FieldValue = admin.firestore.FieldValue;

// Export admin instance for advanced usage
export default admin;
