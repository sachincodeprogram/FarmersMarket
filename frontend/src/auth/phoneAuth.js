import { auth } from "../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";

// ✅ Recaptcha setup (OTP ke liye compulsory)
export const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "normal",
        callback: () => {
          console.log("reCAPTCHA verified ✅");
        },
      }
    );
  }
};

// ✅ OTP send
export const sendOtp = async (phoneNumber) => {
  try {
    setupRecaptcha();

    const appVerifier = window.recaptchaVerifier;

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );

    // store for verify step
    window.confirmationResult = confirmationResult;

    alert("OTP sent ✅");
  } catch (err) {
    console.log("OTP send error:", err);
    alert("OTP send failed ❌");
  }
};

// ✅ OTP verify
export const verifyOtp = async (otp) => {
  try {
    if (!window.confirmationResult) {
      alert("First send OTP");
      return;
    }

    const result = await window.confirmationResult.confirm(otp);

    const token = await result.user.getIdToken();
    console.log("Phone login token:", token);

    alert("Phone Login Success ✅");

    return token;
  } catch (err) {
    console.log("OTP verify error:", err);
    alert("OTP wrong ❌");
  }
};

// ✅ Logout
export const logoutPhoneUser = async () => {
  await signOut(auth);
  alert("Logout ✅");
};
