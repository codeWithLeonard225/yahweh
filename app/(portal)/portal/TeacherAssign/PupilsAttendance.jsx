'use client';

import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase"; 
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const PupilAttendanceLogs = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // URL query fallback or auth context
  const schoolId = searchParams.get("schoolId") || user?.schoolId || "";

  // 🔹 Live Teacher state & Role scoping
  const [liveTeacherInfo, setLiveTeacherInfo] = useState(null);

  const [logs, setLogs] = useState([]);
  const [classPupils, setClassPupils] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  const [availableAcademicYears, setAvailableAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [filterClass, setFilterClass] = useState("");

  // ==========================================================
  // EDIT STATUS STATE
  // ==========================================================
  const [editingLogId, setEditingLogId] = useState(null);
  const [editStatus, setEditStatus] = useState("Present");
  const [editNote, setEditNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ==========================================================
  // SCHOOL CLOSING TIME
  // ==========================================================
  const SCHOOL_CLOSING_HOUR = 14;
  const SCHOOL_CLOSING_MINUTE = 0;

  const CLOSING_TIME_MINUTES =
    SCHOOL_CLOSING_HOUR * 60 +
    SCHOOL_CLOSING_MINUTE;

  // Check if current user is a teacher
  const userRole = (user?.role || "").toLowerCase();
  const isTeacher = userRole === "teacher";

  // Form teacher parameters derived from live info or user context
  const isFormTeacher = liveTeacherInfo?.isFormTeacher ?? user?.data?.isFormTeacher;
  const assignedClass = liveTeacherInfo?.assignClass ?? user?.data?.assignClass;

  // ==========================================================
  // 0. FETCH LIVE TEACHER INFO (IF LOGGED IN AS TEACHER)
  // ==========================================================
  useEffect(() => {
    const teacherId = user?.data?.teacherID || user?.id;

    if (!schoolId || !isTeacher || !teacherId) return;

    const teacherQuery = query(
      collection(db, "Teachers"),
      where("schoolId", "==", schoolId),
      where("teacherID", "==", teacherId)
    );

    const unsubscribe = onSnapshot(
      teacherQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const teacherDocData = snapshot.docs[0].data();
          setLiveTeacherInfo(teacherDocData);

          // If assigned a specific class, lock filterClass to assignedClass automatically
          if (teacherDocData.assignClass) {
            setFilterClass(teacherDocData.assignClass);
          }
        }
      },
      (error) => {
        console.error("Error fetching live teacher info:", error);
      }
    );

    return () => unsubscribe();
  }, [schoolId, isTeacher, user]);

  // Sync assigned class initially if user data exists
  useEffect(() => {
    if (isTeacher && assignedClass) {
      setFilterClass(assignedClass);
    }
  }, [isTeacher, assignedClass]);

  // ==========================================================
  // GET LOGGED-IN USER UTILITY
  // ==========================================================
  const getLoggedInUser = () => {
    try {
      if (typeof window === "undefined") {
        return { id: "", name: "Unknown User", role: "Unknown" };
      }

      const savedUser = JSON.parse(
        localStorage.getItem("schoolUser") || "null"
      );

      if (!savedUser) {
        return {
          id: user?.id || user?.userID || "",
          name: user?.name || user?.data?.adminName || user?.data?.teacherName || "Unknown User",
          role: user?.role || "Unknown",
        };
      }

      const userData = savedUser.data || {};

      return {
        id:
          userData.adminID ||
          userData.teacherID ||
          userData.ceoID ||
          userData.classId ||
          savedUser.userID ||
          "",

        name:
          userData.adminName ||
          userData.teacherName ||
          userData.ceoName ||
          userData.className ||
          "Unknown User",

        role: savedUser.role || "Unknown",
      };
    } catch (error) {
      console.error("Failed to read logged-in user:", error);
      return { id: "", name: "Unknown User", role: "Unknown" };
    }
  };

  // ==========================================================
  // 1. LOAD CLASS NAMES AND ACADEMIC YEARS (SCOPED FOR TEACHERS)
  // ==========================================================
  useEffect(() => {
    if (!schoolId) return;

    const pupilsQuery = query(
      collection(db, "PupilsReg"),
      where("schoolId", "==", schoolId)
    );

    const unsubscribe = onSnapshot(
      pupilsQuery,
      (snapshot) => {
        let classes = Array.from(
          new Set(
            snapshot.docs
              .map((doc) => {
                const data = doc.data();
                return data.class || data.className || "";
              })
              .filter(Boolean)
          )
        ).sort();

        // 🔒 SCOPE FOR TEACHER: Only show assigned class if locked to one
        if (isTeacher && assignedClass) {
          classes = classes.filter((cls) => cls === assignedClass);
        }

        const academicYears = Array.from(
          new Set(
            snapshot.docs
              .map((doc) => {
                const data = doc.data();
                return data.academicYear || data.academic_year || "";
              })
              .filter(Boolean)
          )
        ).sort();

        setAvailableClasses(classes);
        setAvailableAcademicYears(academicYears);

        // Clear class if non-existent or restricted
        setFilterClass((currentClass) => {
          if (isTeacher && assignedClass) return assignedClass;
          if (currentClass && !classes.includes(currentClass)) return "";
          return currentClass;
        });

        setSelectedAcademicYear((currentYear) => {
          if (currentYear && !academicYears.includes(currentYear)) return "";
          return currentYear;
        });
      },
      (error) => {
        console.error("Error fetching classes and academic years:", error);
      }
    );

    return () => unsubscribe();
  }, [schoolId, isTeacher, assignedClass]);

  // ==========================================================
  // 2. FETCH PUPILS FOR SELECTED CLASS & ACADEMIC YEAR
  // ==========================================================
  useEffect(() => {
    setClassPupils([]);

    if (!schoolId || !filterClass || !selectedAcademicYear) return;

    const pupilsQuery = query(
      collection(db, "PupilsReg"),
      where("schoolId", "==", schoolId),
      where("class", "==", filterClass),
      where("academicYear", "==", selectedAcademicYear)
    );

    const unsubscribe = onSnapshot(
      pupilsQuery,
      (snapshot) => {
        const pupils = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setClassPupils(pupils);
      },
      (error) => {
        console.error("Error fetching pupils:", error);
      }
    );

    return () => unsubscribe();
  }, [schoolId, filterClass, selectedAcademicYear]);

  // ==========================================================
  // 3. FETCH ATTENDANCE LOGS
  // ==========================================================
  useEffect(() => {
    setLogs([]);

    if (!schoolId || !filterClass || !selectedDate) return;

    const q = query(
      collection(db, "AttendanceLogs"),
      where("schoolId", "==", schoolId),
      where("date", "==", selectedDate),
      where("class", "==", filterClass)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLogs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLogs(fetchedLogs);
      },
      (error) => {
        console.error("Error fetching attendance logs:", error);
      }
    );

    return () => unsubscribe();
  }, [schoolId, selectedDate, filterClass]);

  // ==========================================================
  // 4. CHECK EARLY DEPARTURE
  // ==========================================================
  const checkEarlyDepartureNotice = (clockOutTimeString) => {
    if (!clockOutTimeString) return null;

    const match = clockOutTimeString.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3];

    if (period) {
      if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
    }

    const clockOutInMinutes = hours * 60 + minutes;
    const windowStartMinutes = CLOSING_TIME_MINUTES - 30;

    if (
      clockOutInMinutes >= windowStartMinutes &&
      clockOutInMinutes < CLOSING_TIME_MINUTES
    ) {
      return "Closing Window (Within 30m of Close)";
    }

    if (clockOutInMinutes < windowStartMinutes) {
      return "Early Departure";
    }

    return "Normal Departure";
  };

  // ==========================================================
  // 5. QUICK CLOCK IN / OUT
  // ==========================================================
  const handleQuickClockAction = async (log) => {
    if (log.isAutomaticallyAbsent) return;

    const now = new Date();
    const nowTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const logRef = doc(db, "AttendanceLogs", log.id);
    const loggedInUser = getLoggedInUser();

    setActionLoading(true);

    try {
      if (!log.clockInTime) {
        await updateDoc(logRef, {
          clockInTime: nowTime,
          status: "Present",
          loggedById: loggedInUser.id,
          loggedByName: loggedInUser.name,
          loggedByRole: loggedInUser.role,
          updatedAt: serverTimestamp(),
        });

        alert(`${log.studentName} clocked in at ${nowTime}`);
      } else if (!log.clockOutTime) {
        await updateDoc(logRef, {
          clockOutTime: nowTime,
          clockOutById: loggedInUser.id,
          clockOutByName: loggedInUser.name,
          clockOutByRole: loggedInUser.role,
          updatedAt: serverTimestamp(),
        });

        alert(`${log.studentName} clocked out at ${nowTime}`);
      }
    } catch (err) {
      console.error("Action error:", err);
      alert("Failed to update clock time.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // 6. SAVE STATUS OVERRIDE
  // ==========================================================
  const handleSaveStatusOverride = async (logId) => {
    const logRef = doc(db, "AttendanceLogs", logId);
    setActionLoading(true);

    const loggedInUser = getLoggedInUser();

    try {
      await updateDoc(logRef, {
        status: editStatus,
        note: editNote.trim() || `Status updated to ${editStatus} by ${loggedInUser.name}`,
        loggedById: loggedInUser.id,
        loggedByName: loggedInUser.name,
        loggedByRole: loggedInUser.role,
        updatedAt: serverTimestamp(),
      });

      setEditingLogId(null);
      setEditNote("");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update attendance record.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // 7. DELETE ATTENDANCE LOG
  // ==========================================================
  const handleDeleteLog = async (logId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete attendance for ${studentName}?`)) {
      return;
    }

    setActionLoading(true);

    try {
      await deleteDoc(doc(db, "AttendanceLogs", logId));
    } catch (err) {
      console.error("Error deleting log:", err);
      alert("Failed to delete record.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // MAP DISPLAY ATTENDANCE
  // ==========================================================
  const displayAttendance = useMemo(() => {
    if (!filterClass || !selectedAcademicYear) return [];

    const attendanceMap = new Map();
    logs.forEach((log) => {
      const studentId = log.studentID || log.pupilID || log.studentId;
      if (studentId) attendanceMap.set(String(studentId), log);
    });

    if (logs.length === 0) return [];

    return classPupils.map((pupil) => {
      const studentID = pupil.studentID || pupil.pupilID || pupil.studentId || pupil.id || "";
      const existingRecord = attendanceMap.get(String(studentID));

      if (existingRecord) {
        return { ...existingRecord, isAutomaticallyAbsent: false };
      }

      return {
        id: `absent-${pupil.id}`,
        studentID: pupil.studentID || pupil.pupilID || pupil.studentId || pupil.id || "---",
        studentName: pupil.studentName || pupil.pupilName || pupil.name || "Unnamed Pupil",
        class: pupil.class || pupil.className || filterClass,
        academicYear: pupil.academicYear || selectedAcademicYear,
        userPhotoUrl: pupil.userPhotoUrl || pupil.photoUrl || pupil.photo || "",
        date: selectedDate,
        clockInTime: null,
        clockOutTime: null,
        status: "Absent",
        note: "",
        isAutomaticallyAbsent: true,
        isManual: false,
      };
    });
  }, [filterClass, selectedAcademicYear, logs, classPupils, selectedDate]);

  // ==========================================================
  // SUMMARY CALCULATIONS
  // ==========================================================
  const totalPupils = classPupils.length;
  const totalPresent = displayAttendance.filter((l) => String(l.status || "").toLowerCase() === "present").length;
  const totalLate = displayAttendance.filter((l) => String(l.status || "").toLowerCase() === "late").length;
  const totalAbsent = displayAttendance.filter((l) => String(l.status || "").toLowerCase() === "absent").length;

  const getStatusStyle = (status) => {
    switch (String(status || "").trim().toLowerCase()) {
      case "present":
        return { backgroundColor: "#d1fae5", color: "#065f46" };
      case "late":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "absent":
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case "excuse":
      case "excused":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "leave":
      case "on leave":
        return { backgroundColor: "#ede9fe", color: "#6d28d9" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pupil Attendance Logs</h1>
          {isTeacher && assignedClass && (
            <p className="text-xs text-indigo-600 font-medium">
              Assigned Class: <span className="font-bold">{assignedClass}</span>
              {isFormTeacher ? " (Form Teacher)" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-xl bg-gray-50 shadow-sm">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Academic Year</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
          >
            <option value="">Select Academic Year</option>
            {availableAcademicYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Class</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
            value={filterClass}
            disabled={isTeacher && Boolean(assignedClass)}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Date</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      {filterClass && selectedAcademicYear && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg bg-blue-50 text-blue-900">
            <span className="text-sm font-medium">Total Pupils</span>
            <p className="text-2xl font-bold">{totalPupils}</p>
          </div>
          <div className="p-4 border rounded-lg bg-emerald-50 text-emerald-900">
            <span className="text-sm font-medium">Present</span>
            <p className="text-2xl font-bold">{totalPresent}</p>
          </div>
          <div className="p-4 border rounded-lg bg-amber-50 text-amber-900">
            <span className="text-sm font-medium">Late</span>
            <p className="text-2xl font-bold">{totalLate}</p>
          </div>
          <div className="p-4 border rounded-lg bg-rose-50 text-rose-900">
            <span className="text-sm font-medium">Absent</span>
            <p className="text-2xl font-bold">{totalAbsent}</p>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {!filterClass || !selectedAcademicYear ? (
        <div className="p-8 text-center text-gray-500 border rounded-lg">
          Please select both an Academic Year and Class to view attendance logs.
        </div>
      ) : displayAttendance.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border rounded-lg">
          No attendance records or pupils found for the selected class and date.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                <th className="p-3">Pupil</th>
                <th className="p-3">ID</th>
                <th className="p-3">Clock In</th>
                <th className="p-3">Clock Out</th>
                <th className="p-3">Notice</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayAttendance.map((log) => {
                const earlyNotice = checkEarlyDepartureNotice(log.clockOutTime);
                const isEditing = editingLogId === log.id;

                return (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={log.userPhotoUrl || "https://via.placeholder.com/40"}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <span className="font-semibold text-gray-800">{log.studentName}</span>
                    </td>
                    <td className="p-3 text-gray-600">{log.studentID}</td>
                    <td className="p-3">{log.clockInTime || "—"}</td>
                    <td className="p-3">{log.clockOutTime || "—"}</td>
                    <td className="p-3 text-xs text-gray-500">{earlyNotice || "—"}</td>
                    <td className="p-3">
                      {isEditing ? (
                        <select
                          className="border rounded px-2 py-1 text-sm bg-white"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Absent">Absent</option>
                          <option value="Excused">Excused</option>
                          <option value="Leave">Leave</option>
                        </select>
                      ) : (
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold inline-block"
                          style={getStatusStyle(log.status)}
                        >
                          {log.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleSaveStatusOverride(log.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-semibold disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingLogId(null)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {!log.isAutomaticallyAbsent && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleQuickClockAction(log)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              {!log.clockInTime ? "Clock In" : !log.clockOutTime ? "Clock Out" : "Updated"}
                            </button>
                          )}
                          {!log.isAutomaticallyAbsent && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingLogId(log.id);
                                  setEditStatus(log.status || "Present");
                                  setEditNote(log.note || "");
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                disabled={actionLoading}
                                onClick={() => handleDeleteLog(log.id, log.studentName)}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PupilAttendanceLogs;