// app/lib/firebase.js     export { db };
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiM6FPhCh7m0C0RVkFxD0DVCNJl04RI3E",
  authDomain: "myschoolhubadmission.firebaseapp.com",
  projectId: "myschoolhubadmission",
  storageBucket: "myschoolhubadmission.firebasestorage.app",
  messagingSenderId: "23728177178",
  appId: "1:23728177178:web:331178c4bbe3e0652811a3",
  measurementId: "G-4P3MSXWV7B"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore (SSR-safe)
const db = getFirestore(app);

export { db };
