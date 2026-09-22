"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "@/app/lib/firebase";
import { pupilresult } from "@/app/lilresult/resultFetch";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "react-toastify";

// Predefined test arrays per scope option
const TERM_SCOPE_MAP = {
  ALL: ["Term 1 T1", "Term 1 T2", "Term 2 T1", "Term 2 T2", "Term 3 T1", "Term 3 T2"],
  "Term 1": ["Term 1 T1", "Term 1 T2"],
  "Term 2": ["Term 2 T1", "Term 2 T2"],
  "Term 3": ["Term 3 T1", "Term 3 T2"],
};

const ManageGradesPage = () => {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const schoolId = searchParams.get("schoolId") || user?.schoolId || "N/A";

  // --- STATE MANAGEMENT ---
  const [liveTeacherInfo, setLiveTeacherInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [pupils, setPupils] = useState([]);
  const [fetchedGrades, setFetchedGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  // Track selected rows for purging
  const [selectedDocIds, setSelectedDocIds] = useState([]);

  // Filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedPupilId, setSelectedPupilId] = useState("");
  const [pupilSearch, setPupilSearch] = useState(""); // Search filter for pupils
  const [selectedTestScope, setSelectedTestScope] = useState("ALL"); // Default to All Terms
  
  // Hardcoded Academic Year State (Defaults to 2025/2026)
  const [academicYear, setAcademicYear] = useState("2025/2026");

  const isFormTeacher = liveTeacherInfo?.isFormTeacher ?? user?.data?.isFormTeacher;
  const assignedClass = liveTeacherInfo?.assignClass ?? user?.data?.assignClass;

  const testScopeOptions = [
    { label: "All Terms (Full Year)", value: "ALL" },
    { label: "Term 1 (T1 & T2)", value: "Term 1" },
    { label: "Term 2 (T1 & T2)", value: "Term 2" },
    { label: "Term 3 (T1 & T2)", value: "Term 3" },
    { label: "Term 1 T1 Only", value: "Term 1 T1" },
    { label: "Term 1 T2 Only", value: "Term 1 T2" },
    { label: "Term 2 T1 Only", value: "Term 2 T1" },
    { label: "Term 2 T2 Only", value: "Term 2 T2" },
    { label: "Term 3 T1 Only", value: "Term 3 T1" },
    { label: "Term 3 T2 Only", value: "Term 3 T2" },
  ];

  // Clear selections whenever filters swap
  useEffect(() => {
    setSelectedDocIds([]);
  }, [selectedClass, selectedPupilId, selectedTestScope, academicYear]);

  // 1️⃣ Real-time Teacher Verification
  useEffect(() => {
    if (!user?.data?.teacherID || !schoolId || schoolId === "N/A") return;

    const q = query(
      collection(db, "Teachers"),
      where("teacherID", "==", user.data.teacherID),
      where("schoolId", "==", schoolId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLiveTeacherInfo({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });
    return () => unsubscribe();
  }, [user, schoolId]);

  // 2️⃣ Fetch Assignments
  useEffect(() => {
    if (!schoolId || schoolId === "N/A") return;
    const qAssignments = query(collection(db, "TeacherAssignments"), where("schoolId", "==", schoolId));

    const unsub = onSnapshot(qAssignments, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      let uniqueAssignments = data.reduce((acc, assignment) => {
        const existing = acc.find((a) => a.className === assignment.className);
        if (!existing) acc.push({ ...assignment });
        return acc;
      }, []);

      uniqueAssignments.sort((a, b) => a.className.localeCompare(b.className));

      if (isFormTeacher && assignedClass) {
        uniqueAssignments = uniqueAssignments.filter((a) => a.className === assignedClass);
        setSelectedClass(assignedClass);
      } else if (uniqueAssignments.length > 0 && !selectedClass) {
        setSelectedClass(uniqueAssignments[0].className);
      }

      setAssignments(uniqueAssignments);
    });
    return () => unsub();
  }, [schoolId, isFormTeacher, assignedClass, selectedClass]);

  // 3️⃣ Fetch Pupils (Filtered by Class, Academic Year, and School)
  useEffect(() => {
    if (!selectedClass || !academicYear || !schoolId || schoolId === "N/A") {
      setPupils([]);
      setSelectedPupilId("");
      return;
    }

    const pupilsQuery = query(
      collection(db, "PupilsReg"),
      where("class", "==", selectedClass),
      where("academicYear", "==", academicYear),
      where("schoolId", "==", schoolId)
    );

    const unsub = onSnapshot(pupilsQuery, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, studentID: doc.id, ...doc.data() }))
        .sort((a, b) => (a.studentName || "").localeCompare(b.studentName || ""));

      setPupils(data);
      if (data.length > 0) {
        setSelectedPupilId(data[0].studentID);
      } else {
        setSelectedPupilId("");
      }
    });

    return () => unsub();
  }, [selectedClass, academicYear, schoolId]);

  // Dynamic filter for pupils list based on search term
  const filteredPupils = useMemo(() => {
    if (!pupilSearch.trim()) return pupils;
    const term = pupilSearch.toLowerCase();
    return pupils.filter(
      (p) =>
        (p.studentName && p.studentName.toLowerCase().includes(term)) ||
        (p.studentID && p.studentID.toLowerCase().includes(term))
    );
  }, [pupils, pupilSearch]);

  // 4️⃣ Fetch Active Grades Handler (Dynamic single-test, term, or full year scope)
  const fetchStudentGrades = useCallback(async () => {
    if (!selectedClass || !selectedPupilId || !selectedTestScope || !academicYear || !schoolId) {
      setFetchedGrades([]);
      return;
    }

    setLoadingGrades(true);
    try {
      // Determine array of test values for Firestore query
      const targetTests = TERM_SCOPE_MAP[selectedTestScope] || [selectedTestScope];

      const gradeQuery = query(
        collection(pupilresult, "PupilGrades"),
        where("schoolId", "==", schoolId),
        where("className", "==", selectedClass),
        where("pupilID", "==", selectedPupilId),
        where("test", "in", targetTests),
        where("academicYear", "==", academicYear)
      );

      const snapshot = await getDocs(gradeQuery);
      const gradesList = snapshot.docs
        .map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          // Sort by test period first, then by subject name
          const testComparison = (a.test || "").localeCompare(b.test || "");
          if (testComparison !== 0) return testComparison;
          return (a.subject || "").localeCompare(b.subject || "");
        });

      setFetchedGrades(gradesList);
    } catch (err) {
      console.error("❌ Error running parameters fetch operation:", err);
      toast.error("Failed to load grade documents");
    } finally {
      setLoadingGrades(false);
    }
  }, [selectedClass, selectedPupilId, selectedTestScope, academicYear, schoolId]);

  useEffect(() => {
    fetchStudentGrades();
  }, [fetchStudentGrades]);

  // 5️⃣ Handle Row Selection Toggles
  const handleSelectRow = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedDocIds.length === fetchedGrades.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(fetchedGrades.map((g) => g.docId));
    }
  };

  // 6️⃣ Delete Selection Action (Single or Bulk)
  const handleDeleteSelectedGrades = async () => {
    if (selectedDocIds.length === 0) return;

    const count = selectedDocIds.length;
    if (
      !window.confirm(
        `Are you absolutely sure you want to permanently delete the ${count} selected grade document(s)?`
      )
    )
      return;

    setLoadingGrades(true);
    try {
      const batch = writeBatch(pupilresult);

      selectedDocIds.forEach((id) => {
        const docRef = doc(pupilresult, "PupilGrades", id);
        batch.delete(docRef);
      });

      await batch.commit();
      toast.success(`Successfully purged ${count} subject document entries.`);
      setSelectedDocIds([]);
      fetchStudentGrades();
    } catch (err) {
      console.error("Batch deletion query failed:", err);
      toast.error("Could not strip records from cloud target schema.");
    } finally {
      setLoadingGrades(false);
    }
  };

  const activeStudentName =
    pupils.find((p) => p.studentID === selectedPupilId)?.studentName || "Select Student";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-2xl relative border border-gray-100">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h2 className="text-3xl font-black text-indigo-900 uppercase tracking-tight">
            Grade Document Purger
          </h2>
          <p className="text-gray-500 font-medium mt-1">
            Reviewing Profile: <span className="text-indigo-600 font-bold">{activeStudentName}</span>{" "}
            {academicYear && (
              <span className="text-gray-400 font-normal">({academicYear})</span>
            )}
          </p>
        </div>

        {/* Bulk Action Context Button */}
        {selectedDocIds.length > 0 && (
          <button
            onClick={handleDeleteSelectedGrades}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-rose-200 transition-all uppercase tracking-wider inline-flex items-center gap-2 animate-fade-in"
          >
            🗑️ Delete Selected ({selectedDocIds.length})
          </button>
        )}
      </div>

      {/* Core Configuration Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        {/* Hardcoded Academic Year Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
            Academic Year
          </label>
          <select
            value={academicYear}
            onChange={(e) => {
              setAcademicYear(e.target.value);
              setSelectedPupilId("");
            }}
            className="w-full border-2 border-gray-200 bg-white font-semibold rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="2025/2026">2025/2026</option>
            <option value="2026/2027">2026/2027</option>
          </select>
        </div>

        {/* Target Class Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
            Target Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedPupilId("");
            }}
            disabled={isFormTeacher}
            className="w-full border-2 border-gray-200 bg-white font-semibold rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
          >
            <option value="">-- SELECT CLASS --</option>
            {assignments.map((a) => (
              <option key={a.className} value={a.className}>
                {a.className}
              </option>
            ))}
          </select>
        </div>

        {/* Pupil Selector with Search Filter */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-gray-400 uppercase">Pupil Name</label>
            {pupils.length > 0 && (
              <span className="text-[10px] font-bold text-indigo-500">
                {filteredPupils.length}/{pupils.length}
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="Filter pupil name..."
            value={pupilSearch}
            onChange={(e) => setPupilSearch(e.target.value)}
            disabled={pupils.length === 0}
            className="w-full border-2 border-gray-200 bg-white font-normal text-xs rounded-lg px-3 py-1 text-gray-700 focus:outline-none focus:border-indigo-500 mb-1.5 disabled:opacity-50"
          />
          <select
            value={selectedPupilId}
            onChange={(e) => setSelectedPupilId(e.target.value)}
            disabled={filteredPupils.length === 0}
            className="w-full border-2 border-gray-200 bg-white font-semibold rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-indigo-500 text-sm disabled:opacity-60"
          >
            <option value="">-- CHOOSE PUPIL --</option>
            {filteredPupils.map((p) => (
              <option key={p.studentID} value={p.studentID}>
                {p.studentName} ({p.studentID})
              </option>
            ))}
          </select>
        </div>

        {/* Scope / Assessment Period */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
            Scope / Assessment Period
          </label>
          <select
            value={selectedTestScope}
            onChange={(e) => setSelectedTestScope(e.target.value)}
            className="w-full border-2 border-gray-200 bg-white font-semibold rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            {testScopeOptions.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display Interactive Matrix Table */}
      <div className="overflow-x-auto shadow-sm rounded-2xl border border-gray-100">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-rose-50 text-rose-900 uppercase text-[11px] font-black">
            <tr>
              <th className="px-6 py-4 w-12 text-center">
                <input
                  type="checkbox"
                  className="accent-rose-600 rounded cursor-pointer w-4 h-4"
                  checked={
                    fetchedGrades.length > 0 && selectedDocIds.length === fetchedGrades.length
                  }
                  onChange={handleSelectAllToggle}
                  disabled={loadingGrades || fetchedGrades.length === 0}
                />
              </th>
              <th className="px-6 py-4">Subject Field</th>
              <th className="px-6 py-4 text-center w-36">Assessment Test</th>
              <th className="px-6 py-4 text-center w-28">Grade Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loadingGrades ? (
              <tr>
                <td colSpan="4" className="text-center py-8 font-medium text-gray-400 italic">
                  Querying live cloud documents...
                </td>
              </tr>
            ) : fetchedGrades.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 font-medium text-gray-400">
                  No active data documents registered under scope:{" "}
                  <span className="font-bold text-gray-600">{selectedTestScope}</span>
                </td>
              </tr>
            ) : (
              fetchedGrades.map((gradeDoc) => {
                const isChecked = selectedDocIds.includes(gradeDoc.docId);
                return (
                  <tr
                    key={gradeDoc.docId}
                    className={`transition-all duration-150 cursor-pointer ${
                      isChecked ? "bg-rose-50/50 hover:bg-rose-50" : "hover:bg-rose-50/20"
                    }`}
                    onClick={() => handleSelectRow(gradeDoc.docId)}
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="accent-rose-600 rounded cursor-pointer w-4 h-4"
                        checked={isChecked}
                        onChange={() => handleSelectRow(gradeDoc.docId)}
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 tracking-tight">
                      {gradeDoc.subject}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-indigo-100">
                        {gradeDoc.test}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-indigo-950">
                      {gradeDoc.grade}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageGradesPage;