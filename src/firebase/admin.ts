import { getFirestore } from "firebase/firestore";
import { app } from "./firebase";

// Firestore para API routes
export const db = getFirestore(app);
