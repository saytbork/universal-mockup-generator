import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "../firebase";

export async function handleMagicLinkLogin() {
  if (typeof window === "undefined") return;

  const href = window.location.href;
  if (!isSignInWithEmailLink(auth, href)) return;

  let email = window.localStorage.getItem("emailForSignIn") || "";
  if (!email) {
    email = window.prompt("Enter your email to complete sign-in") || "";
  }
  if (!email) return;

  await signInWithEmailLink(auth, email, href);
  window.localStorage.removeItem("emailForSignIn");

  // Clear query params to avoid re-processing the link
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);

  window.location.replace("/dashboard");
}
