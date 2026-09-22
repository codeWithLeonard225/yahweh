'use client';

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/app/lib/firebase"; // Update these paths to your actual Next.js aliases
import { pupilresult as schooldb } from "@/app/lilresult/resultFetch";
import { pupilLoginFetch } from "@/app/lilpupil/PupilLogin";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";



const ReportCard = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  // 🔹 Extracting metadata from URL params (Next.js way)
  const schoolId = searchParams.get("schoolId");
  const schoolName = searchParams.get("schoolName");
  const schoolLogoUrl = searchParams.get("schoolLogoUrl");
  const schoolAddress = searchParams.get("schoolAddress");
  const schoolMotto = searchParams.get("schoolMotto");
  const schoolContact = searchParams.get("schoolContact");
  const email = searchParams.get("email");

  const [liveTeacherInfo, setLiveTeacherInfo] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedPupil, setSelectedPupil] = useState("");
  const [pupils, setPupils] = useState([]);
  const [classGradesData, setClassGradesData] = useState([]);
  const [pupilGradesData, setPupilGradesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [totalPupilsInClass, setTotalPupilsInClass] = useState(0);
  const [classesCache, setClassesCache] = useState([]);

  const isFormTeacher = liveTeacherInfo?.isFormTeacher ?? user?.data?.isFormTeacher;
  const assignedClass = liveTeacherInfo?.assignClass ?? user?.data?.assignClass;

  const termTests = {
    "Term 1": ["Term 1 T1", "Term 1 T2"],
    "Term 2": ["Term 2 T1", "Term 2 T2"],
    "Term 3": ["Term 3 T1", "Term 3 T2"],
  };

  const tests = termTests[selectedTerm];

  // 1. Live Teacher Info
  useEffect(() => {
    if (!user?.data?.teacherID || !schoolId) return;
    const q = query(collection(db, "Teachers"), where("teacherID", "==", user.data.teacherID), where("schoolId", "==", schoolId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setLiveTeacherInfo({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    });
    return () => unsubscribe();
  }, [user, schoolId]);

  // 2. Fetch Classes Cache
  useEffect(() => {
    if (!schoolId) return;
    const fetchClasses = async () => {
      const snapshot = await getDocs(query(collection(db, "Classes"), where("schoolId", "==", schoolId)));
      setClassesCache(snapshot.docs.map(doc => doc.data()));
    };
    fetchClasses();
  }, [schoolId]);

  // 3. Metadata Listener
  useEffect(() => {
    if (!schoolId) return;
    const q = query(collection(schooldb, "PupilGrades"), where("schoolId", "==", schoolId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      const years = [...new Set(data.map((d) => d.academicYear))].sort().reverse();
      const classes = [...new Set(data.map((d) => d.className))].sort();
      setAcademicYears(years);
      if (years.length > 0 && !academicYear) setAcademicYear(years[0]);

      if (isFormTeacher && assignedClass) {
        setSelectedClass(assignedClass);
        setAvailableClasses([assignedClass]);
      } else {
        setAvailableClasses(classes);
        if (classes.length > 0 && !selectedClass) setSelectedClass(classes[0]);
      }
    });
    return () => unsubscribe();
  }, [schoolId, isFormTeacher, assignedClass, academicYear, selectedClass]);

  // 4. Fetch Pupils
  useEffect(() => {
    if (!academicYear || !selectedClass || !schoolId) return;
    const q = query(collection(pupilLoginFetch, "PupilsReg"), where("schoolId", "==", schoolId), where("academicYear", "==", academicYear), where("class", "==", selectedClass));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.studentName.localeCompare(b.studentName));
      setPupils(data);
      setTotalPupilsInClass(data.length);
      if (data.length > 0 && !selectedPupil) setSelectedPupil(data[0].studentID);
    });
    return () => unsubscribe();
  }, [academicYear, selectedClass, schoolId, selectedPupil]);

  // 5. Fetch Grades
  useEffect(() => {
    if (!academicYear || !selectedClass || !schoolId) return;
    const q = query(collection(schooldb, "PupilGrades"), where("academicYear", "==", academicYear), where("schoolId", "==", schoolId), where("className", "==", selectedClass));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClassGradesData(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsubscribe();
  }, [academicYear, selectedClass, schoolId]);

  useEffect(() => {
    if (!academicYear || !selectedClass || !selectedPupil || !schoolId) return;
    setLoading(true);
    const q = query(collection(schooldb, "PupilGrades"), where("academicYear", "==", academicYear), where("schoolId", "==", schoolId), where("className", "==", selectedClass), where("pupilID", "==", selectedPupil));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPupilGradesData(snapshot.docs.map((doc) => doc.data()));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [academicYear, selectedClass, selectedPupil, schoolId]);

  // 6. Calculations (useMemo)
  const { reportRows, totalMarks, overallPercentage, overallRank } = useMemo(() => {
    if (pupilGradesData.length === 0) return { reportRows: [], totalMarks: 0, overallPercentage: 0, overallRank: "—" };

    const pupilIDs = [...new Set(classGradesData.map((d) => d.pupilID))];
    const uniqueSubjects = [...new Set(pupilGradesData.map((d) => d.subject))].sort();
    const classInfo = classesCache.find(c => c.schoolId === schoolId && c.className === selectedClass);
    const totalSubjectPercentage = classInfo?.subjectPercentage || (uniqueSubjects.length * 100);

    const classMeansBySubject = {};
    uniqueSubjects.forEach(subject => {
      const subjectScores = pupilIDs.map(id => {
        const g = classGradesData.filter(x => x.pupilID === id && x.subject === subject);
        const t1 = g.find(x => x.test === tests[0])?.grade || 0;
        const t2 = g.find(x => x.test === tests[1])?.grade || 0;
        return { id, mean: (Number(t1) + Number(t2)) / 2 };
      }).sort((a, b) => b.mean - a.mean);
      
      subjectScores.forEach((x, i) => {
        x.rank = (i > 0 && x.mean === subjectScores[i-1].mean) ? subjectScores[i-1].rank : i + 1;
      });
      classMeansBySubject[subject] = subjectScores;
    });

    let totalSum = 0;
    const subjectData = uniqueSubjects.map(subject => {
      const t1 = pupilGradesData.find(g => g.subject === subject && g.test === tests[0])?.grade || 0;
      const t2 = pupilGradesData.find(g => g.subject === subject && g.test === tests[1])?.grade || 0;
      const rawMean = (Number(t1) + Number(t2)) / 2;
      totalSum += rawMean;
      return { subject, test1: t1, test2: t2, mean: Math.round(rawMean), rank: classMeansBySubject[subject]?.find(s => s.id === selectedPupil)?.rank || "—" };
    });

    const overallScores = pupilIDs.map(id => {
      const pData = classGradesData.filter(x => x.pupilID === id);
      const totalMean = [...new Set(pData.map(d => d.subject))].reduce((acc, sub) => {
        const t1 = pData.find(x => x.subject === sub && x.test === tests[0])?.grade || 0;
        const t2 = pData.find(x => x.subject === sub && x.test === tests[1])?.grade || 0;
        return acc + (Number(t1) + Number(t2)) / 2;
      }, 0);
      return { id, totalMean };
    }).sort((a, b) => b.totalMean - a.totalMean);

    overallScores.forEach((x, i) => {
      x.rank = (i > 0 && x.totalMean === overallScores[i-1].totalMean) ? overallScores[i-1].rank : i + 1;
    });

    return { 
      reportRows: subjectData, 
      totalMarks: Math.round(totalSum), 
      overallPercentage: totalSubjectPercentage > 0 ? ((totalSum / totalSubjectPercentage) * 100).toFixed(1) : 0,
      overallRank: overallScores.find(x => x.id === selectedPupil)?.rank || "—"
    };
  }, [pupilGradesData, classGradesData, selectedPupil, tests, classesCache, schoolId, selectedClass]);

  const pupilInfo = useMemo(() => pupils.find((p) => p.studentID === selectedPupil) || null, [pupils, selectedPupil]);

  // PDF Helper
  const handlePrintPDF = async () => {
    if (!pupilInfo) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
    
    const loadImage = (url) => new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });

    const [logo, pupilPhoto] = await Promise.all([
      loadImage(schoolLogoUrl || "/placeholder-logo.png"), 
      loadImage(pupilInfo.userPhotoUrl || "https://via.placeholder.com/96")
    ]);

    let y = 40;
    doc.setFontSize(18).setFont("helvetica", "bold");
    doc.text(schoolName || "Academic Report", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
    
    y += 10;
    doc.setDrawColor(63, 81, 181).line(40, y, doc.internal.pageSize.getWidth() - 40, y);
    
    y += 20;
    if (logo) doc.addImage(logo, "PNG", 40, y, 50, 50);
    
    doc.setFontSize(10).setFont("helvetica", "normal");
    doc.text(schoolAddress || "", doc.internal.pageSize.getWidth() / 2, y + 10, { align: "center" });
    doc.text(schoolMotto || "", doc.internal.pageSize.getWidth() / 2, y + 25, { align: "center" });
    
    if (pupilPhoto) doc.addImage(pupilPhoto, "JPEG", doc.internal.pageSize.getWidth() - 90, y, 50, 50);

    y += 80;
    doc.setFontSize(11).setFont("helvetica", "bold");
    doc.text(`Pupil: ${pupilInfo.studentName}`, 40, y);
    doc.text(`Class: ${selectedClass} (${totalPupilsInClass} Pupils)`, doc.internal.pageSize.getWidth() - 180, y);
    
    y += 20;
    doc.text(`Term: ${selectedTerm}`, 40, y);
    doc.text(`Year: ${academicYear}`, doc.internal.pageSize.getWidth() - 180, y);

    autoTable(doc, {
      startY: y + 15,
      head: [["Subject", "T1", "T2", "Mean", "Rank"]],
      body: reportRows.map(r => [r.subject, r.test1, r.test2, r.mean, r.rank]),
      theme: "striped",
      headStyles: { fillColor: [63, 81, 181] },
      didParseCell: (data) => {
        if ([1, 2, 3].includes(data.column.index) && Number(data.cell.text) < 50) {
          data.cell.styles.textColor = [255, 0, 0];
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 30;
    doc.text(`Total Marks: ${totalMarks}`, 40, finalY);
    doc.text(`Percentage: ${overallPercentage}%`, 40, finalY + 20);
    doc.text(`Position: ${overallRank} / ${totalPupilsInClass}`, 40, finalY + 40);

    doc.save(`${pupilInfo.studentName}_Report.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-white min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-indigo-900">{schoolName}</h1>
        <p className="text-gray-500 italic">{schoolMotto}</p>
      </header>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-indigo-50 p-6 rounded-xl">
         <div>
          <label className="block text-xs font-bold uppercase text-indigo-600 mb-1">Term</label>
          <select className="w-full p-2 rounded border" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
            {Object.keys(termTests).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-indigo-600 mb-1">Year</label>
          <select className="w-full p-2 rounded border" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
            {academicYears.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-indigo-600 mb-1">Class</label>
          <select className="w-full p-2 rounded border" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {availableClasses.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-indigo-600 mb-1">Pupil</label>
          <select className="w-full p-2 rounded border" value={selectedPupil} onChange={(e) => setSelectedPupil(e.target.value)}>
            {pupils.map(p => <option key={p.studentID} value={p.studentID}>{p.studentName}</option>)}
          </select>
        </div>
      </div>

      {/* Pupil Header */}
      {pupilInfo && (
        <div className="flex items-center justify-between mb-6 p-4 border-l-4 border-indigo-600 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-4">
             <img src={pupilInfo.userPhotoUrl || "/avatar.png"} alt="Pupil" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"/>
             <div>
                <h3 className="text-xl font-bold">{pupilInfo.studentName}</h3>
                <p className="text-sm text-gray-500">ID: {pupilInfo.studentID} | {selectedClass}</p>
             </div>
          </div>
          <button 
            onClick={handlePrintPDF} 
            disabled={loading || reportRows.length === 0}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
          >
            {loading ? "Loading..." : "Download PDF"}
          </button>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-600 text-white text-sm">
              <th className="p-4">Subject</th>
              <th className="p-4 text-center">T1</th>
              <th className="p-4 text-center">T2</th>
              <th className="p-4 text-center">Mean</th>
              <th className="p-4 text-center">Rank</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((row, i) => (
              <tr key={i} className="border-b hover:bg-indigo-50/30 transition-colors">
                <td className="p-4 font-medium">{row.subject}</td>
                <td className={`p-4 text-center font-bold ${row.test1 < 50 ? 'text-red-500' : 'text-blue-600'}`}>{row.test1}</td>
                <td className={`p-4 text-center font-bold ${row.test2 < 50 ? 'text-red-500' : 'text-blue-600'}`}>{row.test2}</td>
                <td className="p-4 text-center font-black bg-gray-50">{row.mean}</td>
                <td className="p-4 text-center text-red-600 font-bold">{row.rank}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold text-indigo-900">
              <td className="p-4" colSpan="3">Totals & Performance</td>
              <td className="p-4 text-center text-lg">{totalMarks}</td>
              <td className="p-4 text-center text-lg">{overallRank} / {totalPupilsInClass}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ReportCard;