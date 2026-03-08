// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwQ-sQJrjDoBMTGKxkrkCQXa6JWuu58bA",
  authDomain: "biteoro-fa6db.firebaseapp.com",
  projectId: "biteoro-fa6db",
  storageBucket: "biteoro-fa6db.appspot.com",
  messagingSenderId: "247650692479",
  appId: "1:247650692479:web:b1c17430ca3dbb78027e4a",
  measurementId: "G-JX978W89X0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, analytics };
