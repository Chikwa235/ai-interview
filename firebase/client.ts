import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQHR0FEEyLVDqU87ifeIwGn6K4D9aBMSk",
  authDomain: "prepwise-9183a.firebaseapp.com",
  projectId: "prepwise-9183a",
  storageBucket: "prepwise-9183a.firebasestorage.app",
  messagingSenderId: "690080565656",
  appId: "1:690080565656:web:b1fcbf4899fb3294f5c3ed",
  measurementId: "G-2PJCCSTP48"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);