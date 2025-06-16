// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwXwnbrlKNO8w4yR0keCQ-F3EJ57rJExI",
  authDomain: "crypto4college-2a8d5.firebaseapp.com",
  projectId: "crypto4college-2a8d5",
  storageBucket: "crypto4college-2a8d5.firebasestorage.app",
  messagingSenderId: "464244677932",
  appId: "1:464244677932:web:2b01b068c48f5edfbca089",
  measurementId: "G-D4Z8R2HSZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection dialog
});
const auth = getAuth(app);
const db = getFirestore(app);
export {app, auth, googleProvider, db ,analytics};