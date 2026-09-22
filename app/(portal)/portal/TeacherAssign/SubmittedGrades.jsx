"use client";

import localforage from "localforage";
import React, { useState, useEffect, useMemo, useCallback } from "react";

// Updated Imports per your project structure
import { pupilLoginFetch } from "@/app/lilpupil/PupilLogin"; 
import { pupilresult } from "@/app/lilresult/resultFetch";
import { db } from "@/app/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

import {
    collection,
    onSnapshot,
    query,
    where,
    getDocs,
} from "firebase/firestore";

// Next.js Navigation
import { useSearchParams } from "next/navigation";

// IndexedDB Caching
const pupilStore = localforage.createInstance({ name: "TeacherDataCache", storeName: "teacher_pupils" });

const SubmittedGrades = () => {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    
    // Attempt to get schoolId from URL params or Auth Context
    const schoolId = searchParams.get("schoolId") || user?.schoolId || "N/A";

    const [liveTeacherInfo, setLiveTeacherInfo] = useState(null);
    
    // Real-time access logic
    const isFormTeacher = liveTeacherInfo?.isFormTeacher ?? user?.data?.isFormTeacher;
    const assignedClass = liveTeacherInfo?.assignClass ?? user?.data?.assignClass;

    const [academicYear, setAcademicYear] = useState("");
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedTest, setSelectedTest] = useState("Term 1 T1");
    const [availableClasses, setAvailableClasses] = useState([]);
    const [pupils, setPupils] = useState([]);
    const [gradesData, setGradesData] = useState([]);
    const [loading, setLoading] = useState(false);

    const tests = ["Term 1 T1", "Term 1 T2", "Term 2 T1", "Term 2 T2", "Term 3 T1", "Term 3 T2"];

    // 1. Fetch Teacher Real-time Status
    useEffect(() => {
        if (!user?.data?.teacherID || !schoolId || schoolId === "N/A") return;

        const q = query(
            collection(db, "Teachers"),
            where("teacherID", "==", user.data.teacherID),
            where("schoolId", "==", schoolId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLiveTeacherInfo({
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data(),
                });
            }
        });
        return () => unsubscribe();
    }, [user, schoolId]);

    // 2. Fetch Academic Years and Classes
    useEffect(() => {
        if (!schoolId || schoolId === "N/A") return;

        const q = query(collection(pupilresult, "PupilGrades"), where("schoolId", "==", schoolId));

        const unsub = onSnapshot(q, (snapshot) => {
            const years = [...new Set(snapshot.docs.map(doc => doc.data().academicYear).filter(Boolean))];
            const classes = [...new Set(snapshot.docs.map(doc => doc.data().className).filter(Boolean))];

            setAcademicYears(years.sort().reverse());
            if (years.length > 0 && !academicYear) setAcademicYear(years[0]);

            if (isFormTeacher && assignedClass) {
                setSelectedClass(assignedClass);
                setAvailableClasses([assignedClass]);
            } else {
                setAvailableClasses(classes.sort());
                if (classes.length > 0 && !selectedClass) setSelectedClass(classes[0]);
            }
        });

        return () => unsub();
    }, [schoolId, isFormTeacher, assignedClass, academicYear, selectedClass]);

    // 3. Fetch Pupils (with Cache)
    useEffect(() => {
        if (!selectedClass || !academicYear || !schoolId || schoolId === "N/A") return;
        const cacheKey = `${schoolId}-${academicYear}-${selectedClass}-pupils`;

        const loadPupils = async () => {
            const cached = await pupilStore.getItem(cacheKey);
            if (cached) setPupils(cached);

            const q = query(
                collection(pupilLoginFetch, "PupilsReg"),
                where("schoolId", "==", schoolId),
                where("class", "==", selectedClass),
                where("academicYear", "==", academicYear)
            );

            return onSnapshot(q, async (snap) => {
                const data = snap.docs.map(d => ({ 
                    id: d.id, 
                    ...d.data(),
                    studentID: d.data().studentID
                })).sort((a, b) => (a.studentName || "").localeCompare(b.studentName || ""));
                
                setPupils(data);
                await pupilStore.setItem(cacheKey, data);
            });
        };
        loadPupils();
    }, [selectedClass, academicYear, schoolId]);

    // 4. Fetch Grades
    const fetchGrades = useCallback(async () => {
        if (!selectedClass || !selectedTest || !academicYear || !schoolId || schoolId === "N/A") return;
        setLoading(true);
        const q = query(
            collection(pupilresult, "PupilGrades"),
            where("schoolId", "==", schoolId),
            where("academicYear", "==", academicYear),
            where("className", "==", selectedClass),
            where("test", "==", selectedTest)
        );

        try {
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ gradeDocId: d.id, ...d.data() }));
            setGradesData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [selectedClass, selectedTest, academicYear, schoolId]);

    useEffect(() => { fetchGrades(); }, [fetchGrades]);

    // 5. Memoized Data Mapping
    const { subjects, pupilGradesMap } = useMemo(() => {
        const uniqueSubjects = [...new Set(gradesData.map(g => g.subject))].sort();
        const gMap = {};

        gradesData.forEach(g => {
            if (!gMap[g.subject]) gMap[g.subject] = {};
            gMap[g.subject][g.pupilID] = g.grade;
        });

        return { subjects: uniqueSubjects, pupilGradesMap: gMap };
    }, [gradesData]);

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-indigo-900">Submitted Academic Ledger</h2>
                    <p className="text-gray-500 text-sm">Reviewing Records for: <span className="font-bold text-indigo-600">{selectedClass}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold border border-amber-200 uppercase tracking-wider">
                        👁️ View Only Mode
                    </span>
                    {isFormTeacher && (
                        <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold border border-green-200">
                            🔒 LOCKED TO: {assignedClass}
                        </span>
                    )}
                </div>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div>
                    <label className="block text-xs font-bold text-indigo-700 mb-2 uppercase">Academic Year</label>
                    <select className="w-full p-2.5 rounded-xl border-gray-200 bg-white shadow-sm" value={academicYear} onChange={e => setAcademicYear(e.target.value)}>
                        {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-indigo-700 mb-2 uppercase">Class</label>
                    <select className="w-full p-2.5 rounded-xl border-gray-200 bg-white shadow-sm disabled:bg-gray-100 text-gray-900" value={selectedClass} disabled={isFormTeacher} onChange={e => setSelectedClass(e.target.value)}>
                        {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-indigo-700 mb-2 uppercase">Assessment</label>
                    <select className="w-full p-2.5 rounded-xl border-gray-200 bg-white shadow-sm" value={selectedTest} onChange={e => setSelectedTest(e.target.value)}>
                        {tests.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center p-20 animate-pulse text-indigo-600 font-bold">Syncing Ledger View...</div>
            ) : subjects.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left sticky left-0 bg-indigo-700 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">Subject</th>
                                {pupils.map(p => (
                                    <th key={p.studentID} className="px-4 py-4 text-center min-w-[150px] border-l border-indigo-500/30">
                                        <p className="text-[10px] opacity-70 tracking-wide font-mono">{p.studentID}</p>
                                        <p className="text-sm font-semibold truncate">{p.studentName}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {subjects.map(sub => (
                                <tr key={sub} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-800 border-r bg-gray-50 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{sub}</td>
                                    {pupils.map(p => {
                                        const finalGrade = pupilGradesMap[sub]?.[p.studentID];
                                        const isMissing = finalGrade === undefined || finalGrade === null || finalGrade === "";
                                        
                                        return (
                                            <td key={p.studentID} className="px-3 py-4 text-center border-r">
                                                <div className="flex flex-col items-center justify-center">
                                                    {isMissing ? (
                                                        <span className="text-xs text-gray-400 italic font-medium px-2.5 py-1 bg-gray-50 border border-gray-200/60 rounded-md">
                                                            N/A
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm font-black text-slate-800 bg-slate-100/80 px-3 py-1 rounded-md min-w-[3.5rem] inline-block border border-slate-200/40 shadow-sm font-mono">
                                                            {finalGrade}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-20 bg-gray-50 border-2 border-dashed rounded-2xl text-gray-400 font-medium">
                    No confirmed grade sheets discovered matching this context.
                </div>
            )}
        </div>
    );
};

export default SubmittedGrades;