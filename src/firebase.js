// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfHkboU3avX2H0z9jjkKGHtT8Ur4XEj6E",
  authDomain: "classy-sales-c8888.firebaseapp.com",
  projectId: "classy-sales-c8888",
  storageBucket: "classy-sales-c8888.firebasestorage.app",
  messagingSenderId: "254083159923",
  appId: "1:254083159923:web:b5c63c5a8caf3d2bff9706",
  measurementId: "G-K3ZXQ05X0L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);