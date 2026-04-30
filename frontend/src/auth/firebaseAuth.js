import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const API_URL = import.meta.env.VITE_API; // ✅ cloud backend

const sendLoginToBackend = async (firebaseUser) => {
  const token = await firebaseUser.getIdToken();

  await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  await sendLoginToBackend(result.user); // ✅ tracking
  return result.user;
};

export const loginWithFacebook = async () => {
  const result = await signInWithPopup(auth, facebookProvider);
  await sendLoginToBackend(result.user); // ✅ tracking
  return result.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};
