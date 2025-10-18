// ✅ Clean Firebase setup file
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// --- Replace with your Firebase project credentials ---
const firebaseConfig = {
    apiKey: "AIzaSyAfHkboU3avX2H0z9jjkKGHtT8Ur4XEj6E",
  authDomain: "classy-sales-c8888.firebaseapp.com",
  projectId: "classy-sales-c8888",
  storageBucket: "classy-sales-c8888.firebasestorage.app",
  messagingSenderId: "254083159923",
  appId: "1:254083159923:web:b5c63c5a8caf3d2bff9706",
  measurementId: "G-K3ZXQ05X0L"
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);

// Initialize Firestore + Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Export both for App.js
export { db, storage };

