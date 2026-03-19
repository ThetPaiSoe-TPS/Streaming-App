// @ts-nocheck
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration - Replace with your Firebase project config
// Get this from Firebase Console > Project Settings > Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyD9z-PH5syvgPkBR-V_InlOVFmTbNOXFOk",
  authDomain: "project1-d75be.firebaseapp.com",
  projectId: "project1-d75be",
  storageBucket: "project1-d75be.firebasestorage.app",
  messagingSenderId: "525179831254",
  appId: "1:525179831254:web:bde3d578797ec4cd0b1a77",
  measurementId: "G-QK1V9FTVB2",
};

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.log("Firebase initialization error:", error);
}

export { app, db };
export default db;
