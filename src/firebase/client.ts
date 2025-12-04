import { app } from "./firebase";
import { getFirestore } from "firebase/firestore";

// Firestore para el cliente
export const db = getFirestore(app);
