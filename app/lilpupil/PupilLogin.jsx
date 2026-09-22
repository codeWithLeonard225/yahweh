// app/lilothers/othersdb.jsx      export const othersdb = getFirestore(schoolapp);
// app/lib/firebase.js             export { db };
// app/lilpupil/pupilLogin.jsx     export const pupilLoginFetch = getFirestore(schoolapp);


"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyCktgDiFsomVU6gi1x324KksMUR18gVI2U",
  authDomain: "schoolslogin-5bff5.firebaseapp.com",
  projectId: "schoolslogin-5bff5",
  storageBucket: "schoolslogin-5bff5.firebasestorage.app",
  messagingSenderId: "899115561044",
  appId: "1:899115561044:web:ec9a9fd0912d08465ebdc1",
  measurementId: "G-Y71SKD2JWE"
};

// ✅ Prevent duplicate initialization (VERY IMPORTANT in Next.js)
const schoolapp =
  getApps().find(app => app.name === "pupilLogin") ||
  initializeApp(firebaseConfig, "pupilLogin");

// ✅ Firestore client
export const pupilLoginFetch = getFirestore(schoolapp);
