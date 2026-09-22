"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/app/lib/firebase";
import { pupilresult } from "@/app/lilresult/resultFetch";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "react-toastify";

// Terms to tests map definition
const TERM_TEST_MAP = {
  "Term 1": ["Term 1 T1", "Term 1 T2"],
  "Term 2": ["Term 2 T1", "Term 2 T2"],
  "Term 3": ["Term 3 T1", "Term 3 T2"],
};

const JSONBulkGradePage = () => {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const schoolId = searchParams.get("schoolId") || user?.schoolId || "N/A";

  // --- STATE MANAGEMENT ---
  const [liveTeacherInfo, setLiveTeacherInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [pupils, setPupils] = useState([]);

  // Filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedPupilId, setSelectedPupilId] = useState("");
  const [pupilSearch, setPupilSearch] = useState(""); // Filter pupil name/ID search term
  const [selectedTerm, setSelectedTerm] = useState("ALL"); // "ALL" or specific term
  
  // Hardcoded Academic Year State (Defaults to 2025/2026)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025/2026");

  // JSON Input State
  const [jsonInput, setJsonInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isFormTeacher = liveTeacherInfo?.isFormTeacher ?? user?.data?.isFormTeacher;
  const assignedClass = liveTeacherInfo?.assignClass ?? user?.data?.assignClass;

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

  // 3️⃣ Fetch Pupils (Filtered by Selected Class & Selected Academic Year)
  useEffect(() => {
    if (!selectedClass || !selectedAcademicYear || !schoolId || schoolId === "N/A") {
      setPupils([]);
      setSelectedPupilId("");
      return;
    }

    const pupilsQuery = query(
      collection(db, "PupilsReg"),
      where("class", "==", selectedClass),
      where("academicYear", "==", selectedAcademicYear),
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
  }, [selectedClass, selectedAcademicYear, schoolId]);

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

  // Helper to extract non-null numeric grades for a term
  const extractTermGrades = (itemRow, termKey) => {
    const targetTests = TERM_TEST_MAP[termKey] || [];
    const results = [];

    targetTests.forEach((testName) => {
      if (itemRow.hasOwnProperty(testName)) {
        const rawVal = itemRow[testName];
        if (rawVal !== null && rawVal !== undefined) {
          const numVal = parseFloat(rawVal);
          if (!isNaN(numVal)) {
            results.push({ test: testName, grade: numVal });
          }
        }
      }
    });

    return results;
  };

  // 4️⃣ Live Reactive Parser for Multi-Term or Single-Term JSON
  const parsedDataByTerm = useMemo(() => {
    if (!jsonInput.trim()) return {};
    try {
      const parsed = JSON.parse(jsonInput);

      // Multi-term object: { "Term 1": [...], "Term 2": [...] }
      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        if (selectedTerm === "ALL") {
          return parsed;
        } else if (parsed[selectedTerm] && Array.isArray(parsed[selectedTerm])) {
          return { [selectedTerm]: parsed[selectedTerm] };
        }
      }

      // Single term array fallback: [...]
      if (Array.isArray(parsed)) {
        const fallbackTerm = selectedTerm === "ALL" ? "Term 1" : selectedTerm;
        return { [fallbackTerm]: parsed };
      }
    } catch (e) {
      // Quietly handle JSON parsing during typing
    }
    return {};
  }, [jsonInput, selectedTerm]);

  // Calculate total non-null grades queued for upload
  const totalQueuedGrades = useMemo(() => {
    let count = 0;
    Object.entries(parsedDataByTerm).forEach(([termKey, rows]) => {
      if (Array.isArray(rows)) {
        rows.forEach((row) => {
          count += extractTermGrades(row, termKey).length;
        });
      }
    });
    return count;
  }, [parsedDataByTerm]);

  // 5️⃣ Run Bulk Upload Processing Across All Selected Terms
  const handleJsonSubmit = async () => {
    if (!selectedClass || !selectedPupilId || !selectedAcademicYear) {
      return toast.error("Please select a class, pupil, and academic year!");
    }

    if (totalQueuedGrades === 0) {
      return toast.warning("No valid non-null grades found in the pasted JSON!");
    }

    const termNames = Object.keys(parsedDataByTerm).join(", ");
    if (
      !window.confirm(
        `Commit ${totalQueuedGrades} grades for ${selectedAcademicYear} across terms (${termNames}) for ${activeStudentName}?`
      )
    )
      return;

    setSubmitting(true);
    const batch = writeBatch(pupilresult);

    try {
      Object.entries(parsedDataByTerm).forEach(([termKey, rows]) => {
        if (!Array.isArray(rows)) return;

        rows.forEach((row) => {
          const subjectName = row.subject;
          if (!subjectName) return;

          const gradeEntries = extractTermGrades(row, termKey);

          gradeEntries.forEach(({ test, grade }) => {
            const newDocRef = doc(collection(pupilresult, "PupilGrades"));
            batch.set(newDocRef, {
              pupilID: selectedPupilId,
              className: selectedClass,
              subject: subjectName.trim(),
              teacher: "Admin JSON Bulk Override",
              grade,
              test,
              academicYear: selectedAcademicYear,
              schoolId,
              timestamp: serverTimestamp(),
              lastModifiedByAdmin: serverTimestamp(),
            });
          });
        });
      });

      await batch.commit();
      setJsonInput("");
      toast.success("Successfully pushed all term records to Firestore!");
    } catch (err) {
      console.error("Batch commit error:", err);
      toast.error("Failed to commit grades batch.");
    } finally {
      setSubmitting(false);
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
            JSON Bulk Injector
          </h2>
          <p className="text-gray-500 font-medium mt-1">
            Targeting Pupil: <span className="text-indigo-600 font-bold">{activeStudentName}</span>{" "}
            {selectedAcademicYear && (
              <span className="text-gray-400 font-normal">({selectedAcademicYear})</span>
            )}
          </p>
        </div>
      </div>

      {/* Core Configuration Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        {/* Academic Year Selector (Hardcoded options) */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
            Academic Year
          </label>
          <select
            value={selectedAcademicYear}
            onChange={(e) => {
              setSelectedAcademicYear(e.target.value);
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

        {/* Scope / Term Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
            Scope / Term
          </label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full border-2 border-gray-200 bg-white font-semibold rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Terms (Full Year)</option>
            <option value="Term 1">Term 1 Only</option>
            <option value="Term 2">Term 2 Only</option>
            <option value="Term 3">Term 3 Only</option>
          </select>
        </div>
      </div>

      {/* Raw JSON Data Entry Box */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-bold text-indigo-950">
            Paste JSON Payload Below:
          </label>
          <button
            onClick={handleJsonSubmit}
            disabled={submitting || !selectedPupilId || totalQueuedGrades === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold px-8 py-2.5 rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider"
          >
            {submitting ? "Processing..." : `Commit ${totalQueuedGrades} Grades`}
          </button>
        </div>

        <textarea
          rows={10}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`{\n  "Term 1": [...],\n  "Term 2": [...],\n  "Term 3": [...]\n}`}
          className="w-full p-4 font-mono text-xs bg-slate-900 text-emerald-400 border border-slate-950 rounded-2xl shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      {/* Live Reactive Preview Container */}
      {Object.keys(parsedDataByTerm).length > 0 && (
        <div className="mb-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
          <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-3">
            📋 Detected Payload Summary ({totalQueuedGrades} total score entries found)
          </h4>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(parsedDataByTerm).map(([termKey, rows]) => {
              if (!Array.isArray(rows)) return null;
              return (
                <div key={termKey} className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                  <span className="text-xs font-black text-indigo-700 uppercase tracking-wider block mb-2">
                    {termKey}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rows.map((item, idx) => {
                      const gradeEntries = extractTermGrades(item, termKey);
                      if (gradeEntries.length === 0) return null;

                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg"
                        >
                          <span className="font-semibold text-gray-700 truncate mr-2">
                            {item.subject}
                          </span>
                          <div className="flex gap-1">
                            {gradeEntries.map((g, gIdx) => (
                              <span
                                key={gIdx}
                                className="font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px]"
                              >
                                {g.test.replace(termKey, "").trim()}: {g.grade}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default JSONBulkGradePage;