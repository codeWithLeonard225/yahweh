// Database/SchoolResults.jsx
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyAcss-5kmMOsMrMj-I-qx7Yx50P0XrBayI",
  authDomain: "myschoolhublibarypastquestion.firebaseapp.com",
  projectId: "myschoolhublibarypastquestion",
  storageBucket: "myschoolhublibarypastquestion.firebasestorage.app",
  messagingSenderId: "29315692621",
  appId: "1:29315692621:web:4edd11bb0b684e54c6c404",
  measurementId: "G-Q5P8H81JW4",
};

// ✅ Prevent duplicate initialization (VERY IMPORTANT in Next.js)
const schoolapp =
  getApps().find(app => app.name === "schoolLibAndPastQuestionsApp") ||
  initializeApp(firebaseConfig, "schoolLibAndPastQuestionsApp");

// ✅ Firestore client
export const othersdb = getFirestore(schoolapp);
