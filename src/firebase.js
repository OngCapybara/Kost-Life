import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCGknSQhKlgn9O3MkLIljB9VE7VJ9qIpY",
  authDomain: "kost-life.firebaseapp.com",
  projectId: "kost-life",
  storageBucket: "kost-life.firebasestorage.app",
  messagingSenderId: "413875678174",
  appId: "1:413875678174:web:16ed13e8b192177cae4b4f",
  measurementId: "G-PRV25CV2RS"
};


const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
