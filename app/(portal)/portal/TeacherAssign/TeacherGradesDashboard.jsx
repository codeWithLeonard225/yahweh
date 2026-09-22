"use client";

import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { pupilresult } from "@/app/lilresult/resultFetch";
import { useAuth } from "@/app/context/AuthContext";

const AdvancedTeacherDashboard = () => {
  const { user } = useAuth();
  const schoolId = user?.schoolId;
  const teacherName = user?.data?.teacherName;

  const [rawGrades, setRawGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedTest, setSelectedTest] = useState("All");

  const PASS_MARK = 50;

  useEffect(() => {
    if (!teacherName || !schoolId) return;

    const q = query(
      collection(pupilresult, "PupilGrades"),
      where("teacher", "==", teacherName),
      where("schoolId", "==", schoolId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRawGrades(data);
      setLoading(false);
    });

    return () => unsub();
  }, [teacherName, schoolId]);

  // --- DYNAMIC FILTER OPTIONS ---
  const classOptions = useMemo(() => 
    ["All", ...new Set(rawGrades.map(g => g.className))], [rawGrades]);

  const subjectOptions = useMemo(() => {
    const filteredByClass = selectedClass === "All" 
      ? rawGrades 
      : rawGrades.filter(g => g.className === selectedClass);
    return ["All", ...new Set(filteredByClass.map(g => g.subject))];
  }, [rawGrades, selectedClass]);

  const testOptions = useMemo(() => 
    ["All", ...new Set(rawGrades.map(g => g.test))], [rawGrades]);

  // --- ANALYTICS ENGINE ---
  const analytics = useMemo(() => {
    let data = rawGrades;
    if (selectedClass !== "All") data = data.filter(g => g.className === selectedClass);
    if (selectedSubject !== "All") data = data.filter(g => g.subject === selectedSubject);
    if (selectedTest !== "All") data = data.filter(g => g.test === selectedTest);

    if (data.length === 0) return null;

    const total = data.length;
    const passing = data.filter(g => g.grade >= PASS_MARK).length;
    const topPerformers = [...data].sort((a, b) => b.grade - a.grade).slice(0, 10);
    const average = (data.reduce((sum, g) => sum + g.grade, 0) / total).toFixed(1);

    // Subject Breakdown (Useful for teachers with many subjects)
    const subjectStats = [...new Set(data.map(g => g.subject))].map(sub => {
      const subData = data.filter(g => g.subject === sub);
      const subAvg = (subData.reduce((sum, g) => sum + g.grade, 0) / subData.length).toFixed(1);
      return { name: sub, avg: subAvg, count: subData.length };
    });

    return { total, passing, failing: total - passing, average, topPerformers, subjectStats };
  }, [rawGrades, selectedClass, selectedSubject, selectedTest]);

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-teal-600">LOADING ANALYTICS...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* MULTI-FILTER BAR */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Class</label>
          <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSubject("All"); }}
            className="w-full bg-gray-50 border-none rounded-2xl p-3 text-xs font-bold ring-1 ring-gray-200">
            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Subject</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl p-3 text-xs font-bold ring-1 ring-gray-200">
            {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Assessment</label>
          <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl p-3 text-xs font-bold ring-1 ring-gray-200">
            {testOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <button onClick={() => { setSelectedClass("All"); setSelectedSubject("All"); setSelectedTest("All"); }}
          className="bg-gray-800 text-white text-[10px] font-black uppercase p-3 rounded-2xl hover:bg-black transition-all">
          Reset Filters
        </button>
      </div>

      {!analytics ? (
        <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold italic uppercase text-xs tracking-widest">No matching records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT COL: OVERVIEW & TOP PUPILS */}
          <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-[9px] font-black text-teal-600 uppercase">Average</p>
                <h4 className="text-2xl font-black">{analytics.average}%</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-[9px] font-black text-orange-600 uppercase">Failed</p>
                <h4 className="text-2xl font-black">{analytics.failing}</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase">Submissions</p>
                <h4 className="text-2xl font-black">{analytics.total}</h4>
              </div>
              <div className="bg-teal-600 p-6 rounded-3xl shadow-lg text-white">
                <p className="text-[9px] font-black uppercase opacity-80">Pass Rate</p>
                <h4 className="text-2xl font-black">{((analytics.passing/analytics.total)*100).toFixed(0)}%</h4>
              </div>
            </div>

            {/* TOP 10 TABLE */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b pb-4">Star Performers (Top 10)</h3>
              <div className="overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase">
                      <th className="pb-3">Rank</th>
                      <th className="pb-3">Pupil ID</th>
                      <th className="pb-3">Class</th>
                      <th className="pb-3 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {analytics.topPerformers.map((p, i) => (
                      <tr key={i} className="group">
                        <td className="py-4 font-black text-xs text-gray-300">#0{i+1}</td>
                        <td className="py-4 font-bold text-xs uppercase">{p.pupilID}</td>
                        <td className="py-4 font-bold text-[10px] text-teal-600 uppercase">{p.className}</td>
                        <td className="py-4 text-right">
                          <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1 rounded-full">{p.grade}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COL: SUBJECT BREAKDOWN */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b pb-4">Subject Averages</h3>
              <div className="space-y-6">
                {analytics.subjectStats.map((sub, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-xs font-black uppercase text-gray-800">{sub.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">{sub.count} Pupils Graded</p>
                      </div>
                      <p className="text-sm font-black text-teal-600">{sub.avg}%</p>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${sub.avg}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK LEGEND */}
            <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
              <h4 className="text-[10px] font-black text-orange-800 uppercase mb-2">Critical Attention</h4>
              <p className="text-[11px] font-medium text-orange-700 leading-relaxed italic">
                Any subject or class appearing with an average below {PASS_MARK}% will automatically highlight your need for intervention strategies.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdvancedTeacherDashboard;