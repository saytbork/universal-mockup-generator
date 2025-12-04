import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    ),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

export const adminDB = admin.firestore();
export const adminStorage = admin.storage().bucket();

// ESTA ES LA PARTE QUE TE FALTABA
export const FieldValue = admin.firestore.FieldValue;
