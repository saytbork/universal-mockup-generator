const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    ),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const adminDB = admin.firestore();
const adminStorage = admin.storage().bucket();
const FieldValue = admin.firestore.FieldValue;

module.exports = { adminDB, adminStorage, FieldValue };
