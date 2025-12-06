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
      const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 'boostugc-6d83f.firebasestorage.app';

      if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
      }

      if (!storageBucket) {
        throw new Error('FIREBASE_STORAGE_BUCKET environment variable is not set');
      }

      // Parse service account key JSON
      let credential;
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountKey);
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON');
        console.error('First 100 chars:', serviceAccountKey.substring(0, 100));
        throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError.message}. Make sure you copied the entire JSON file contents.`);
      }

      // Validate required fields
      if (!serviceAccount.private_key || !serviceAccount.client_email || !serviceAccount.project_id) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing required fields (private_key, client_email, or project_id)');
      }

      // Check if private key looks valid
      if (!serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY has malformed private_key field. Ensure newlines (\\n) are preserved.');
      }

      try {
        credential = admin.credential.cert(serviceAccount);
      } catch (certError) {
        console.error('Failed to create credential from service account');
        throw new Error(`Failed to create Firebase credential: ${certError.message}. The private_key may be corrupted. Try re-copying from Firebase Console.`);
      }

      // Initialize Admin SDK
      const initConfig = {
        credential,
        projectId: serviceAccount.project_id,
        storageBucket,
        // Explicitly set database URL to use default database
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      };

      admin.initializeApp(initConfig);

      console.log('✅ Firebase Admin SDK initialized successfully');
      console.log('   Project ID:', serviceAccount.project_id);
      console.log('   Storage Bucket:', storageBucket);
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
export const adminStorage = admin.storage().bucket('boostugc-6d83f.firebasestorage.app');

// Export FieldValue for timestamp operations
export const FieldValue = admin.firestore.FieldValue;

// Export admin instance for advanced usage
export default admin;
