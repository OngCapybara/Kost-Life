import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config dari project kamu
const firebaseConfig = {
  apiKey: "AIzaSyCCGknSQhKlgn9O3MkLIljB9VE7VJ9qIpY",
  authDomain: "kost-life.firebaseapp.com",
  projectId: "kost-life",
  storageBucket: "kost-life.firebasestorage.app",
  messagingSenderId: "413875678174",
  appId: "1:413875678174:web:16ed13e8b192177cae4b4f",
  measurementId: "G-PRV25CV2RS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// ini buat login, register, logout
export const auth = getAuth(app);

// ini buat database Firestore
export const db = getFirestore(app);
