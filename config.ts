// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "solid-realtime.firebaseapp.com",
  databaseURL: "https://solid-realtime-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "solid-realtime",
  storageBucket: "solid-realtime.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
