import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    ),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "boostugc-6d83f.firebasestorage.app"
  });
}

export const adminDB = admin.firestore();
export const adminStorage = admin.storage().bucket("boostugc-6d83f.firebasestorage.app");
export const FieldValue = admin.firestore.FieldValue;
