// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMdA3oEz7CMEFcjz3FbT3cKypogSlDYeM",
  authDomain: "dwts-voting-3a145.firebaseapp.com",
  projectId: "dwts-voting-3a145",
  storageBucket: "dwts-voting-3a145.firebasestorage.app",
  messagingSenderId: "646244411613",
  appId: "1:646244411613:web:2ff4d23b9a523fab44d334",
  measurementId: "G-YECRXBRHDB",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Competition ID constant
export const COMPETITION_ID = "dwts-feb-2026";
