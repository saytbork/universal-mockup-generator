
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAjq7po3vV7nF4FoSDpnSlQZMI_gq-OUDE",
    authDomain: "boostugc-6d83f.firebaseapp.com",
    projectId: "boostugc-6d83f",
    storageBucket: "boostugc-6d83f.firebasestorage.app",
    messagingSenderId: "597924705642",
    appId: "1:597924705642:web:a9447d9f1b02c9ca3f6113",
    measurementId: "G-8ETK9WG8J6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
