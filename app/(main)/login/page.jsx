"use client";
//app/(main)/login/page.jsx
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { pupilLoginFetch } from "@/app/lilpupil/PupilLogin";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const normalizeName = (name) => {
  if (!name) return "";
  return name.trim().split(/\s+/).join(" ").toLowerCase();
};

const LoginPage = () => {
  const [userID, setUserID] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { user, setUser, loading: authLoading } = useAuth();

  // 🔍 Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.navigationRoute || "/");
    }
  }, [user, authLoading, router]);

  const collectionsToCheck = [
    { name: "PupilsReg", idField: "studentID", nameField: "studentName", role: "pupil" },
    { name: "Teachers", idField: "teacherID", nameField: "teacherName", role: "teacher" },
    { name: "Admins", idField: "adminID", nameField: "adminName", role: "admin" },
    { name: "CEOs", idField: "ceoID", nameField: "ceoName", role: "ceo", route: "/developer" },
    { name: "Classes", idField: "classId", nameField: "className", role: "class", route: "/PupilUpdate" },
  ];

  const getAdminRoute = (type) => {
    switch (type) {
      case "Gov": return "/gov";
      case "Private": return "/admin";
      case "Fees": return "/registra";
      case "Special": return "/special";
      case "PupilAttendance": return "/PupilAttendance";
      default: return "/admin";
    }
  };

  const getPupilRoute = (type) => {
    switch (type) {
      case "Gov": return "/GovPupilDashboard";
      case "Private": return "/portal/dashboard/Pupil/";
      case "GovSpecial": return "/GovPupilSpecial";
      case "PrivateSpecial": return "/PrivatePupilSpecial";
      case "StaffAttendanceSimple": return "/StaffAttendanceSimple";
      default: return "/contact-admin";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingLogin(true);

    const trimmedUserID = userID.trim();
    const trimmedUserName = userName.trim();
    const inputNameNormalized = normalizeName(trimmedUserName);

    if (!trimmedUserID || !inputNameNormalized) {
      setError("Please enter valid ID and Name.");
      setLoadingLogin(false);
      return;
    }

    try {
      let foundUser = null;
      let userRole = null;
      let schoolId = null;
      let navigationRoute = null;
      let schoolInfo = {};

      for (const { name, idField, nameField, role } of collectionsToCheck) {
        const q = query(collection(db, name), where(idField, "==", trimmedUserID));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const matchedDoc = snap.docs.find(doc => normalizeName(doc.data()[nameField]) === inputNameNormalized);
          if (matchedDoc) {
            foundUser = matchedDoc.data();
            userRole = role;
            schoolId = foundUser.schoolId;

            // Determine route
            if (name === "CEOs") navigationRoute = "/developer";
            else if (name === "Classes") navigationRoute = "/PupilUpdate";
            else if (name === "Admins") navigationRoute = getAdminRoute(foundUser.adminType);
            else if (name === "PupilsReg") navigationRoute = getPupilRoute(foundUser.pupilType);
            else if (name === "Teachers") navigationRoute = "/portal/dashboard/subjectTeacher";

            break;
          }
        }
      }

      if (!foundUser) {
        setError("Invalid credentials. Please check your ID and Name.");
        setLoadingLogin(false);
        return;
      }

      // Fetch school info
      if (schoolId) {
        const schoolSnap = await getDocs(query(collection(pupilLoginFetch, "Schools"), where("schoolID", "==", schoolId)));
        if (!schoolSnap.empty) {
          const schoolData = schoolSnap.docs[0].data();
          schoolInfo = {
            schoolName: schoolData.schoolName,
            schoolLogoUrl: schoolData.schoolLogoUrl || "/images/default.png",
            schoolAddress: schoolData.schoolAddress || "Address not found",
            schoolMotto: schoolData.schoolMotto || "No motto",
            schoolContact: schoolData.schoolContact || "No contact info",
            email: schoolData.email || "No email",
          };
        }
      }

      const userSession = {
        role: userRole,
        data: foundUser,
        schoolId,
        navigationRoute,
        ...schoolInfo,
      };

      // Save and set user
      localStorage.setItem("schoolUser", JSON.stringify(userSession));
      setUser(userSession);
      
      // Redirect reliably
      router.replace(userSession.navigationRoute);

    } catch (err) {
      console.error("Login error:", err);
      setError("A system error occurred. Please try again.");
    } finally {
      setLoadingLogin(false);
    }
  };

  if (authLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">School Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-1">ID</label>
            <input
              type={showPassword ? "text" : "password"}
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              className="w-full border p-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 pr-10"
              placeholder="Enter your ID"
              required
              disabled={loadingLogin}
            />
            <span
              className="absolute right-3 top-9 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full border p-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your name"
              required
              disabled={loadingLogin}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loadingLogin}
            className={`w-full p-2 rounded-lg font-semibold transition ${
              loadingLogin ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-700 text-white hover:bg-indigo-800"
            }`}
          >
            {loadingLogin ? "Logging In..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
