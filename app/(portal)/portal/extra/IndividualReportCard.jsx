"use client";
//app/(portal)/portal/reportCard/page.jsx
import React, { useEffect, useMemo, useState } from "react";
import localforage from "localforage";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { pupilresult } from "@/app/lilresult/resultFetch";
import { useAuth } from "@/app/context/AuthContext";

// -------------------------------
// Configuration & helpers
// -------------------------------
const gradesStore = localforage.createInstance({
  name: "GradesCache",
  storeName: "pupil_grades",
});

const classesStore = localforage.createInstance({
  name: "ClassesCache",
  storeName: "school_classes",
});

const termTests = {
  "Term 1": ["Term 1 T1", "Term 1 T2"],
  "Term 2": ["Term 2 T1", "Term 2 T2"],
  "Term 3": ["Term 3 T1", "Term 3 T2"],
};

const getGradeColor = (val) => {
  const grade = Number(val);
  if (Number.isNaN(grade)) return "text-gray-900";
  if (grade >= 50) return "text-blue-600 font-bold";
  return "text-red-600 font-bold";
};

const normalize = (v) => (v == null ? "" : String(v).trim());

// -------------------------------
// Component
// -------------------------------
export default function IndividualReportCard() {
  const { user, loading: authLoading } = useAuth();

  // Get pupil data from auth (preferred)
  const pupilData = user?.data ?? null;
  const schoolIdFromUser = user?.schoolId ?? null;
  const schoolNameFromUser = user?.schoolName ?? "Unknown School";

  // Local UI state
  const [latestInfo, setLatestInfo] = useState({ class: "", academicYear: "" });
  const [totalPupilsInClass, setTotalPupilsInClass] = useState(0);
  const [loadingReg, setLoadingReg] = useState(true);

  const [pupilGradesData, setPupilGradesData] = useState([]); // grades for the pupil (filtered)
  const [classGradesData, setClassGradesData] = useState([]); // all grades for class
  const [classesCache, setClassesCache] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const [selectedTerm, setSelectedTerm] = useState("Term 1");

  // derived
  const academicYear = latestInfo.academicYear;
  const selectedClass = latestInfo.class;
  const selectedPupil = pupilData?.studentID;
  const schoolId = schoolIdFromUser;

  const tests = termTests[selectedTerm];

  // -------------------------------
  // 1) Listen for pupil registration (latest class + academic year)
  // -------------------------------
  useEffect(() => {
    if (!selectedPupil || !schoolId) {
      setLoadingReg(false);
      return;
    }

    setLoadingReg(true);
    const pupilsRef = query(
      collection(db, "PupilsReg"),
      where("studentID", "==", selectedPupil),
      where("schoolId", "==", schoolId)
    );

    const unsubscribe = onSnapshot(
      pupilsRef,
      (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0].data();
          setLatestInfo({ class: d.class || d.className || "", academicYear: d.academicYear || "" });
        }
        setLoadingReg(false);
      },
      (err) => {
        console.error("Pupil reg snapshot error:", err);
        setLoadingReg(false);
      }
    );

    return () => unsubscribe();
  }, [selectedPupil, schoolId]);

  // -------------------------------
  // 2) Count pupils in class
  // -------------------------------
  useEffect(() => {
    if (!academicYear || !selectedClass || !schoolId) return;

    const q = query(
      collection(db, "PupilsReg"),
      where("academicYear", "==", academicYear),
      where("class", "==", selectedClass),
      where("schoolId", "==", schoolId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setTotalPupilsInClass(snap.size);
    }, (err) => {
      console.error("Pupils count snapshot error:", err);
    });

    return () => unsubscribe();
  }, [academicYear, selectedClass, schoolId]);

  // -------------------------------
  // 3) Load Classes (cache-first) and listen
  // -------------------------------
  useEffect(() => {
    if (!schoolId) return;
    const CACHE_KEY = `classes_${schoolId}`;

    let unsubscribe = null;

    const init = async () => {
      // load cache
      try {
        const cached = await classesStore.getItem(CACHE_KEY);
        if (cached?.data) setClassesCache(cached.data);
      } catch (e) {
        console.error("Failed read classes cache:", e);
      }

      // realtime listener
      const q = query(collection(db, "Classes"), where("schoolId", "==", schoolId));
      unsubscribe = onSnapshot(q, (snap) => {
        const data = snap.docs.map(d => d.data());
        setClassesCache(data);
        classesStore.setItem(CACHE_KEY, { timestamp: Date.now(), data }).catch(e => console.error(e));
      }, err => {
        console.error("Classes snapshot error:", err);
      });
    };

    init();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [schoolId]);

  // -------------------------------
  // 4) Load grades (cache-first) and listen
  // -------------------------------
  useEffect(() => {
    if (!academicYear || !selectedClass || !schoolId || !selectedPupil) return;

    setLoadingGrades(true);
    const GRADES_CACHE_KEY = `grades_${schoolId}_${academicYear}_${selectedClass}`;

    let unsubscribe = null;
    let cachedLoaded = false;

    const init = async () => {
      try {
        const cached = await gradesStore.getItem(GRADES_CACHE_KEY);
        if (cached?.data) {
          cachedLoaded = true;
          setClassGradesData(cached.data);
          setPupilGradesData(cached.data.filter(g => g.pupilID === selectedPupil));
          setLoadingGrades(false);
        }
      } catch (e) {
        console.error("Failed read grades cache:", e);
      }

      // Firestore realtime listener
      const q = query(
        collection(pupilresult, "PupilGrades"),
        where("academicYear", "==", academicYear),
        where("schoolId", "==", schoolId),
        where("className", "==", selectedClass)
      );

      unsubscribe = onSnapshot(q, (snap) => {
        const fresh = snap.docs.map(d => d.data());
        setClassGradesData(fresh);
        setPupilGradesData(fresh.filter(g => g.pupilID === selectedPupil));
        gradesStore.setItem(GRADES_CACHE_KEY, { timestamp: Date.now(), data: fresh }).catch(e => console.error(e));
        setLoadingGrades(false);
      }, (err) => {
        console.error("Grades snapshot error:", err);
        if (!cachedLoaded) setLoadingGrades(false);
      });
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [academicYear, selectedClass, selectedPupil, schoolId]);

  // -------------------------------
  // 5) Compute subjects, ranks, totals using useMemo
  // -------------------------------
  const { subjects, reportRows, totalMarks, overallPercentage, overallRank } = useMemo(() => {
    if (!tests || tests.length < 2) return { subjects: [], reportRows: [], totalMarks: 0, overallPercentage: 0, overallRank: "—" };
    if (!pupilGradesData || pupilGradesData.length === 0) return { subjects: [], reportRows: [], totalMarks: 0, overallPercentage: 0, overallRank: "—" };

    const pupilIDs = Array.from(new Set(classGradesData.map(d => d.pupilID)));
    const uniqueSubjects = Array.from(new Set(pupilGradesData.map(d => d.subject))).sort();

    const classInfo = classesCache.find(c => (c.schoolId === schoolId || c.schoolId === c.schoolId) && (c.className === selectedClass || c.class === selectedClass));
    const totalSubjectPercentage = classInfo?.subjectPercentage || (uniqueSubjects.length * 100);

    // Per subject class means and ranks
    const classMeansBySubject = {};
    for (const subject of uniqueSubjects) {
      const subjectScores = pupilIDs.map(id => {
        const g = classGradesData.filter(x => x.pupilID === id && x.subject === subject);
        const t1 = g.find(x => x.test === tests[0])?.grade || 0;
        const t2 = g.find(x => x.test === tests[1])?.grade || 0;
        return { id, mean: (Number(t1) + Number(t2)) / 2 };
      });

      subjectScores.sort((a, b) => b.mean - a.mean);
      subjectScores.forEach((x, i) => {
        if (i > 0 && x.mean === subjectScores[i - 1].mean) x.rank = subjectScores[i - 1].rank;
        else x.rank = i + 1;
      });
      classMeansBySubject[subject] = subjectScores;
    }

    // Pupil rows
    let totalSum = 0;
    const rows = uniqueSubjects.map(subject => {
      const t1 = pupilGradesData.find(g => g.subject === subject && g.test === tests[0])?.grade || 0;
      const t2 = pupilGradesData.find(g => g.subject === subject && g.test === tests[1])?.grade || 0;
      const rawMean = (Number(t1) + Number(t2)) / 2;
      totalSum += rawMean;
      const mean = Math.round(rawMean);
      const rank = classMeansBySubject[subject]?.find(s => s.id === selectedPupil)?.rank || "—";
      return { subject, test1: t1, test2: t2, mean, rank };
    });

    // overall ranking
    const overallScores = pupilIDs.map(id => {
      const pupilDataInClass = classGradesData.filter(x => x.pupilID === id);
      const totalMean = Array.from(new Set(pupilDataInClass.map(d => d.subject))).reduce((acc, subject) => {
        const t1 = pupilDataInClass.find(x => x.subject === subject && x.test === tests[0])?.grade || 0;
        const t2 = pupilDataInClass.find(x => x.subject === subject && x.test === tests[1])?.grade || 0;
        return acc + (Number(t1) + Number(t2)) / 2;
      }, 0);
      return { id, totalMean };
    });

    overallScores.sort((a, b) => b.totalMean - a.totalMean);
    overallScores.forEach((x, i) => {
      if (i > 0 && x.totalMean === overallScores[i - 1].totalMean) x.rank = overallScores[i - 1].rank;
      else x.rank = i + 1;
    });

    const overallRank = overallScores.find(x => x.id === selectedPupil)?.rank || "—";
    const totalMarks = Math.round(totalSum);
    const overallPercentage = totalSubjectPercentage > 0 ? ((totalSum / totalSubjectPercentage) * 100).toFixed(1) : 0;

    return { subjects: uniqueSubjects, reportRows: rows, totalMarks, overallPercentage, overallRank };
  }, [pupilGradesData, classGradesData, selectedPupil, selectedTerm, selectedClass, classesCache, schoolId, tests]);

  // -------------------------------
  // 6) Render
  // -------------------------------
  if (authLoading || loadingReg) {
    return (
      <div className="text-center p-8">
        <p className="text-indigo-600 font-medium">Loading pupil registration...</p>
      </div>
    );
  }

  if (!pupilData?.studentID) {
    return (
      <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-3xl mx-auto">
        <h2 className="text-xl text-red-600 font-bold">Error</h2>
        <p className="text-gray-600 mt-2">Pupil ID not found. Please ensure you are logged in or navigated correctly.</p>
      </div>
    );
  }

  const isLoading = loadingGrades || loadingReg;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
        {schoolNameFromUser}
      </h2>

      {/* Term selector */}
      <div className="flex justify-center gap-4 mb-6">
        {Object.keys(termTests).map((term) => (
          <button
            key={term}
            onClick={() => setSelectedTerm(term)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${selectedTerm === term ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-indigo-100"}`}
          >
            {term}
          </button>
        ))}
      </div>

      {/* Pupil Info */}
      <div className="flex items-center gap-4 mb-6 border p-4 rounded-lg bg-gray-50 shadow-sm">
        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold">
          <img
            src={pupilData.userPhotoUrl || ""}
            alt="Pupil"
            className="w-24 h-24 object-cover rounded-full border-2 border-indigo-500"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://via.placeholder.com/96"; }}
          />
        </div>
        <div>
          <p className="text-lg font-semibold text-indigo-800">{pupilData.studentName || "Name N/A"}</p>
          <p className="text-gray-600"><span className="font-medium">Class:</span> {selectedClass || "N/A"}</p>
          <p className="text-gray-600"><span className="font-medium">Academic Year:</span> {academicYear || "N/A"}</p>
          <p className="text-gray-600"><span className="font-medium">Student ID:</span> {selectedPupil || "N/A"}</p>
        </div>
      </div>

      {/* Report Table */}
      {isLoading ? (
        <div className="text-center text-indigo-600 font-medium p-8 border rounded-lg">Loading {selectedTerm} report...</div>
      ) : (subjects && subjects.length > 0) ? (
        <div className="overflow-x-auto border rounded-lg shadow-md">
          <table className="min-w-full text-sm text-center border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Subject</th>
                {tests.map((t) => <th key={t} className="px-4 py-2">{t.split(' ').pop()}</th>)}
                <th className="px-4 py-2">Mn</th>
                <th className="px-4 py-2">Rnk</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="text-left px-4 py-2 font-semibold">{row.subject}</td>
                  <td className={`px-4 py-2 ${getGradeColor(row.test1)}`}>{row.test1}</td>
                  <td className={`px-4 py-2 ${getGradeColor(row.test2)}`}>{row.test2}</td>
                  <td className={`px-4 py-2 font-bold ${getGradeColor(row.mean)}`}>{row.mean}</td>
                  <td className="px-4 py-2 font-bold text-red-600">{row.rank}</td>
                </tr>
              ))}

              <tr className="bg-indigo-100 font-bold text-indigo-800 border-t-2 border-indigo-600">
                <td className="text-left px-4 py-2 text-base">Combined Scores</td>
                <td colSpan="2"></td>
                <td className="px-4 py-2 text-base">{totalMarks}</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-6 text-gray-500 border rounded-lg">
          No grades found for {pupilData.studentName} in {selectedTerm} ({academicYear || "N/A"}).
        </div>
      )}
    </div>
  );
}
