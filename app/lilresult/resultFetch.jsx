
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyD5qJ705TA9wXjvAjPj78amYZG4LVtbVOU",
    authDomain: "myschoolhubresults.firebaseapp.com",
    projectId: "myschoolhubresults",
    storageBucket: "myschoolhubresults.firebasestorage.app",
    messagingSenderId: "983553432441",
    appId: "1:983553432441:web:eb918a435e0367a652eda8",
    measurementId: "G-SDZPMHVJRN"
};

// ✅ Prevent duplicate initialization (VERY IMPORTANT in Next.js)
const schoolapp =
  getApps().find(app => app.name === "schoolResultsApp") ||
  initializeApp(firebaseConfig, "schoolResultsApp");

// ✅ Firestore client
export const pupilresult = getFirestore(schoolapp);
