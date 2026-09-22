"use client"; // CRITICAL: Tells Next.js this is a client-side component

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // Next.js version of location/params
import { db } from "@/app/lib/firebase";
import { schooldb } from "@/app/lilresult/resultFetch";
import { pupilLoginFetch } from "@/app/lilpupil/PupilLogin";
import {
  collection,
  onSnapshot,
  query,
  where,
  setDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
// import localforage from "localforage"; // We will load this inside useEffect

const TeacherGradesPage = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  // Next.js handles URL params differently: e.g., /grades?schoolId=123
  const schoolId = searchParams.get("schoolId") || "N/A";

  const [assignments, setAssignments] = useState([]);
  const [pupils, setPupils] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [grades, setGrades] = useState({});
  const [selectedTest, setSelectedTest] = useState("Term 1 T1");
  const [academicYear, setAcademicYear] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [gradeSummary, setGradeSummary] = useState({ filled: 0, empty: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [gradesToDownload, setGradesToDownload] = useState(null);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);

  const tests = ["Term 1 T1", "Term 1 T2", "Term 2 T1", "Term 2 T2", "Term 3 T1", "Term 3 T2"];
  const teacherName = user?.data?.teacherName;

  // 1. Fetch Academic Year
  useEffect(() => {
    const q = query(collection(pupilLoginFetch, "PupilsReg"), orderBy("academicYear", "desc"), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setAcademicYear(snapshot.docs[0].data().academicYear);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Teacher Assignments (LocalStorage is safe in useEffect)
  useEffect(() => {
    if (!teacherName) return;
    const fetchAssignments = async () => {
      const assignmentsKey = `assignments_${teacherName}_${schoolId}`;
      const cached = localStorage.getItem(assignmentsKey);
      
      let data = [];
      if (cached) {
        data = JSON.parse(cached);
      } else {
        const q = query(
          collection(db, "TeacherAssignments"),
          where("teacher", "==", teacherName),
          where("schoolId", "==", schoolId)
        );
        const snap = await getDocs(q);
        data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        localStorage.setItem(assignmentsKey, JSON.stringify(data));
      }

      setAssignments(data);
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0].className);
        setSelectedSubject(data[0].subjects[0]);
      }
    };
    fetchAssignments();
  }, [teacherName, schoolId, selectedClass]);

  // 3. Load Pupils (Using dynamic import for localforage to avoid SSR errors)
  useEffect(() => {
    if (!selectedClass || !academicYear) return;

    const loadPupils = async () => {
      const localforage = (await import("localforage")).default; // Dynamic import
      const pupilCacheKey = `pupils_${schoolId}_${academicYear}`;
      const allPupils = await localforage.getItem(pupilCacheKey);

      if (allPupils) {
        const sorted = allPupils
          .filter(p => p.class === selectedClass)
          .sort((a, b) => a.studentName?.localeCompare(b.studentName));
        
        setPupils(sorted);
        const initialGrades = {};
        sorted.forEach(p => initialGrades[p.studentID] = "");
        setGrades(initialGrades);
      }
    };
    loadPupils();
  }, [selectedClass, academicYear, schoolId]);

  // --- PDF GENERATION (Next.js Friendly) ---
  const handleDownloadPDF = async (gradesMap) => {
    // Dynamically import libraries to keep the initial bundle small
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
    // ... rest of your PDF logic remains the same ...
    doc.text(`Teacher: ${teacherName}`, 40, 50);
    // ... add table data ...
    doc.save(`${selectedClass}_Grades.pdf`);
    setShowDownloadPopup(false);
  };

  // --- UI RENDER (Same as React, but using Tailwind) ---
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-md">
       <h2 className="text-2xl font-semibold mb-6 text-center">
         Submit Grades ({academicYear || "Loading..."})
       </h2>
       
       {/* Use regular <button> and <div> tags as you did before */}
       {/* Next.js works perfectly with your existing Tailwind classes */}
       <div className="mb-4">
          <p>Teacher: <b>{teacherName}</b></p>
          <p>School ID: <b>{schoolId}</b></p>
       </div>

       {/* MAP THROUGH ASSIGNMENTS AS TABS */}
       <div className="flex gap-2 mb-6">
         {assignments.map((a) => (
           <button 
             key={a.id}
             onClick={() => setSelectedClass(a.className)}
             className={`px-4 py-2 rounded ${selectedClass === a.className ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
           >
             {a.className}
           </button>
         ))}
       </div>

       {/* ... Remaining Table and Popup Logic ... */}
       <button 
         onClick={() => setShowPopup(true)}
         className="w-full bg-green-600 text-white py-3 rounded-lg font-bold"
       >
         Submit Grades
       </button>
    </div>
  );
};

export default TeacherGradesPage;