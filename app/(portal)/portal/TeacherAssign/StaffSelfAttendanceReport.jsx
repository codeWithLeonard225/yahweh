"use client";

import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase"; // Using standard firebase export reference
import { useAuth } from "@/app/context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TeacherPayrollReport = () => {
  const { user } = useAuth();

  const schoolId = user?.schoolId || user?.data?.schoolId || "N/A";
  const teacherID = user?.data?.teacherID || user?.teacherID || user?.id;
  const teacherName = user?.data?.teacherName || user?.teacherName || "Teacher";

  const [teacherProfile, setTeacherProfile] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // ---------------- 1. FETCH TEACHER PROFILE & ATTENDANCE ----------------
  useEffect(() => {
    const fetchData = async () => {
      if (!teacherID || schoolId === "N/A") return;

      setLoading(true);
      try {
        // Fetch Teacher Details (Salary rates & Academic Start Date)
        const teacherQuery = query(
          collection(db, "Teachers"),
          where("schoolId", "==", schoolId),
          where("teacherID", "==", teacherID)
        );
        const teacherSnapshot = await getDocs(teacherQuery);
        if (!teacherSnapshot.empty) {
          setTeacherProfile(teacherSnapshot.docs[0].data());
        }

        // Fetch Attendance Records
        const attendanceQuery = query(
          collection(db, "StaffAttendance"),
          where("schoolId", "==", schoolId),
          where("teacherID", "==", teacherID)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const records = attendanceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendanceHistory(records);
      } catch (error) {
        console.error("Error fetching payroll data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, teacherID]);

  // ---------------- 2. PAYROLL & ATTENDANCE CALCULATIONS ----------------
  const monthlyData = useMemo(() => {
    const academicStartDate = teacherProfile?.academicStartDate || null;

    // Filter attendance by selected month & academic start date
    const monthlyAttendance = attendanceHistory.filter((record) => {
      if (!record.date || !record.date.startsWith(selectedMonth)) return false;
      if (academicStartDate && record.date < academicStartDate) return false;
      return true;
    });

    const lateDays = monthlyAttendance.filter(
      (r) => r.status?.trim().toLowerCase() === "late"
    ).length;

    const absentDays = monthlyAttendance.filter(
      (r) => r.status?.trim().toLowerCase() === "absent"
    ).length;

    const presentDays = monthlyAttendance.filter(
      (r) => r.status?.trim().toLowerCase() === "present"
    ).length;

    const salary = Number(teacherProfile?.salary) || 0;
    const lateCostPerDay = Number(teacherProfile?.lateCostPerDay) || 0;
    const absentCostPerDay = Number(teacherProfile?.absentCostPerDay) || 0;

    const lateDeduction = lateDays * lateCostPerDay;
    const absentDeduction = absentDays * absentCostPerDay;
    const totalDeduction = lateDeduction + absentDeduction;
    const netSalary = Math.max(0, salary - totalDeduction);

    return {
      records: monthlyAttendance,
      presentDays,
      lateDays,
      absentDays,
      salary,
      lateCostPerDay,
      absentCostPerDay,
      lateDeduction,
      absentDeduction,
      totalDeduction,
      netSalary,
    };
  }, [attendanceHistory, teacherProfile, selectedMonth]);

  // ---------------- 3. FORMAT CURRENCY ----------------
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-SL", {
      style: "currency",
      currency: "SLE",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // ---------------- 4. EXPORT PDF PAYSLIP ----------------
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("STAFF PAYSLIP REPORT", 14, 15);

    doc.setFontSize(10);
    doc.text(`Staff Name: ${teacherName}`, 14, 23);
    doc.text(`Staff ID: ${teacherID}`, 14, 29);
    doc.text(`Period: ${selectedMonth}`, 14, 35);

    // Summary Table
    autoTable(doc, {
      startY: 42,
      head: [["Description", "Amount / Count"]],
      body: [
        ["Base Salary", formatMoney(monthlyData.salary)],
        [`Late Days (${monthlyData.lateDays} d @ ${formatMoney(monthlyData.lateCostPerDay)}/d)`, `-${formatMoney(monthlyData.lateDeduction)}`],
        [`Absent Days (${monthlyData.absentDays} d @ ${formatMoney(monthlyData.absentCostPerDay)}/d)`, `-${formatMoney(monthlyData.absentDeduction)}`],
        ["Total Deductions", `-${formatMoney(monthlyData.totalDeduction)}`],
        ["Net Salary Payable", formatMoney(monthlyData.netSalary)],
      ],
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Detailed Log
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Date", "Status", "Time"]],
      body: monthlyData.records.map((r) => [
        r.date,
        r.status,
        r.time?.toDate ? r.time.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A",
      ]),
      styles: { fontSize: 9 },
    });

    doc.save(`Payslip_${teacherName}_${selectedMonth}.pdf`);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center font-bold text-gray-500 animate-pulse uppercase">
          Calculating Payroll...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* HEADER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-800 uppercase tracking-tight">
              My Payroll & Attendance
            </h1>
            <p className="text-indigo-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
              Staff Self-Service Breakdown
            </p>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 text-center">
            <p className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase">
              Staff Name
            </p>
            <p className="text-xs sm:text-sm font-bold text-indigo-900">
              {teacherName}
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm font-bold bg-white shadow-sm w-full sm:w-auto outline-indigo-600"
          />
          <button
            onClick={exportPDF}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow hover:bg-indigo-700 transition-colors w-full sm:w-auto"
          >
            📄 Download Payslip PDF
          </button>
        </div>

        {/* FINANCIAL OVERVIEW STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase">Gross Salary</p>
            <p className="text-xl font-black text-gray-800 mt-1">
              {formatMoney(monthlyData.salary)}
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase">Total Deductions</p>
            <p className="text-xl font-black text-red-600 mt-1">
              -{formatMoney(monthlyData.totalDeduction)}
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-sm text-center bg-indigo-50/50">
            <p className="text-[10px] font-black text-indigo-500 uppercase">Net Payable</p>
            <p className="text-xl font-black text-indigo-700 mt-1">
              {formatMoney(monthlyData.netSalary)}
            </p>
          </div>
        </div>

        {/* ATTENDANCE COUNTS & DEDUCTIONS BREAKDOWN */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-green-500 uppercase">Present Days</p>
            <p className="text-lg font-black text-gray-800">{monthlyData.presentDays}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-amber-500 uppercase">Late Days ({formatMoney(monthlyData.lateCostPerDay)}/d)</p>
            <p className="text-lg font-black text-amber-600">{monthlyData.lateDays}</p>
            <p className="text-[10px] text-gray-400">-{formatMoney(monthlyData.lateDeduction)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-red-500 uppercase">Absent Days ({formatMoney(monthlyData.absentCostPerDay)}/d)</p>
            <p className="text-lg font-black text-red-600">{monthlyData.absentDays}</p>
            <p className="text-[10px] text-gray-400">-{formatMoney(monthlyData.absentDeduction)}</p>
          </div>
        </div>

        {/* DETAILED ATTENDANCE LOG */}
        <div className="space-y-3">
          <h3 className="font-black text-gray-700 uppercase text-xs tracking-wider">
            Monthly Attendance Records
          </h3>
          {monthlyData.records.length > 0 ? (
            monthlyData.records.map((record) => {
              const isPresent = record.status?.toLowerCase() === "present";
              const isLate = record.status?.toLowerCase() === "late";

              return (
                <div
                  key={record.id}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 h-10 w-10 rounded-xl flex flex-col items-center justify-center text-gray-500">
                      <span className="text-[7px] font-black uppercase">Date</span>
                      <span className="text-xs font-bold">{record.date.split("-")[2]}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">{record.date}</p>
                      <h4 className="text-xs font-bold text-gray-800">
                        Recorded at: {record.time?.toDate ? record.time.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                      </h4>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      isPresent
                        ? "bg-green-100 text-green-700 border-green-200"
                        : isLate
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-200 text-center">
              <p className="text-gray-400 font-bold uppercase text-sm">
                No attendance records for this month, kindly contact the school admin.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherPayrollReport;