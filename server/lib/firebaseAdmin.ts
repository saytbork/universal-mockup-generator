/**
 * Firebase Admin SDK - Server-side only
 * Used for server-to-server Firebase Storage operations
 */

import admin from 'firebase-admin';

let firebaseApp: admin.app.App | undefined;

/**
 * Initialize Firebase Admin SDK with service account credentials
 * Credentials are loaded from FIREBASE_SERVICE_ACCOUNT environment variable
 */
export function getFirebaseAdmin(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if service account credentials are provided
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountJson) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT environment variable is not set. ' +
        'Please configure it in Vercel Dashboard → Settings → Environment Variables.'
      );
    }

    // Parse service account JSON
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize Firebase Admin
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Get Firebase Storage bucket for server-side uploads
 */
export function getStorageBucket(): admin.storage.Storage {
  const app = getFirebaseAdmin();
  return app.storage();
}

/**
 * Upload image buffer to Firebase Storage (server-side)
 * @param buffer - Image buffer
 * @param userId - User ID for organizing files
 * @param metadata - Optional metadata
 * @returns Public download URL
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  userId: string,
  metadata?: Record<string, string>
): Promise<{ url: string; path: string }> {
  try {
    const storage = getStorageBucket();
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const filename = `${userId}_${timestamp}_${randomSuffix}.png`;
    const path = `generated/${filename}`;

    const file = storage.bucket().file(path);

    // Upload buffer to Storage
    await file.save(buffer, {
      metadata: {
        contentType: 'image/png',
        metadata: {
          userId,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${storage.bucket().name}/${path}`;

    console.log('✅ Image uploaded to Firebase Storage (server-side):', path);

    return {
      url: publicUrl,
      path,
    };
  } catch (error) {
    console.error('❌ Firebase Storage upload failed (server-side):', error);
    throw new Error(
      `Failed to upload image to Firebase Storage: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
