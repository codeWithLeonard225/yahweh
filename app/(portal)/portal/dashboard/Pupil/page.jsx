"use client";
// app/(portal)/portal/dashboard/page.jsx 

import React, { useState, useEffect } from "react";
import {
  MdDashboard, // Added MdDashboard for the main tab
  MdAttachMoney,
  MdAssignmentTurnedIn,
  MdKeyboardArrowDown,
  MdMenuBook,
  MdLibraryBooks,
  MdLogout,
} from "react-icons/md";

import { useAuth } from "@/app/context/AuthContext"; 
import { useRouter } from "next/navigation";
import IndividualReportCard from "../../reportCard/IndividualReportCard";
import PupilFeesPage from "../../fees/page";
import PupilAttendance from "../../attendance/page";
import PupilPastQuestionViewer from "../../pastquestions/page";


// NAV ITEMS
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: <MdDashboard /> }, // Added Dashboard tab
  {
    key: "fees",
    label: "Fees",
    icon: <MdAttachMoney />,
  },
  {
    key: "result",
    label: "Result",
    icon: <MdAssignmentTurnedIn />,
  },
  {
    key: "library",
    label: "Library",
    icon: <MdLibraryBooks />,
  },
  {
    key: "schoolPastQuestions",
    label: "School Past Questions",
    icon: <MdMenuBook />,
  },
  {
    key: "WaecPastQuestions",
    label: "SmartPikin Waec Past Ques.",
    icon: <MdMenuBook />,
    children: [
      { key: "npse", label: "NPSE" },
      { key: "bece", label: "BECE" },
      { key: "wassce", label: "WASSCE" },
      { key: "Quiz", label: "Test Yourself (Quiz)" },
      { key: "syllabus", label: "Study syllabus" },
    ],
  },
  {
    key: "assign",
    label: "Assignment",
    icon: <MdLibraryBooks />,
  },
];


// BUTTON COMPONENT
const Button = ({ variant = "default", onClick, className = "", children }) => {
  let baseStyles =
    "inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-950 disabled:pointer-events-none disabled:opacity-50";

  let variantStyles =
    variant === "default"
      ? "bg-indigo-600 text-white shadow hover:bg-indigo-700"
      : "hover:bg-indigo-100 hover:text-indigo-700 text-gray-700";

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variantStyles} ${className} h-9 px-4 py-2 justify-start`}
    >
      {children}
    </button>
  );
};


// MAIN COMPONENT
export default function PupilDashboard() {
  // ⭐ Use the loading state from the fixed AuthContext
  const { user, setUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🛡️ AUTH CHECK: Redirect if no pupil is logged in
  useEffect(() => {
    // Wait until authLoading is false
    if (!authLoading) {
      if (!user || user.role !== "pupil") {
        // Use router.replace for a clean redirect
        router.replace("/login"); 
      }
    }
  }, [user, authLoading, router]);


  // ⏳ Render Loading or Unauthorized screen early
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-indigo-700">
          {authLoading ? "Verifying Session..." : "Unauthorized Access"}
        </p>
      </div>
    );
  }

  const { data: pupilData, schoolName, schoolAddress, schoolMotto, schoolLogoUrl } = user;
  const pupilName = pupilData.studentName || "Pupil Name N/A";
  const pupilClass = pupilData.class || "N/A";
  const pupilInitials = pupilName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);


  // Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("schoolUser");
    // Redirect to the correct login path
    router.replace("/login"); 
  };


  // Render Side Navigation
  const renderNavItems = (items) =>
    items.map((item) => (
      <div key={item.key} className="mb-1">
        {item.children ? (
          <>
            <Button
              variant={openDropdown === item.key ? "default" : "ghost"}
              onClick={() => {
                setActiveTab(item.key); // Set parent key as active tab
                setOpenDropdown(openDropdown === item.key ? null : item.key);
              }}
              className="w-full flex items-center justify-between gap-2 text-base py-2"
            >
              <div className="flex items-center gap-2">
                {item.icon} {item.label}
              </div>
              <MdKeyboardArrowDown
                className={`transition-transform ${openDropdown === item.key ? "rotate-180" : ""}`}
              />
            </Button>

            {/* Submenu */}
            {openDropdown === item.key && (
              <div className="pl-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Button
                    key={child.key}
                    variant={activeTab === child.key ? "default" : "ghost"}
                    onClick={() => setActiveTab(child.key)}
                    className="w-full text-sm py-1"
                  >
                    {child.label}
                  </Button>
                ))}
              </div>
            )}
          </>
        ) : (
          <Button
            variant={activeTab === item.key ? "default" : "ghost"}
            onClick={() => {
              setActiveTab(item.key);
              setOpenDropdown(null);
            }}
            className="w-full flex items-center gap-2 text-base py-2"
          >
            {item.icon} {item.label}
          </Button>
        )}
      </div>
    ));




  // Render Main Content Area
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <PupilAttendance/>
      case "fees":
        return <PupilFeesPage />;
      case "result":
        return <IndividualReportCard />;
      // case "schoolPastQuestions":
      //   return <PupilPastQuestionViewer />;
      default:
        // Content for other tabs like 'fees', 'result', etc.
        return (
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-700">Content for: {activeTab.toUpperCase()}</h2>
            <p className="mt-2">This module is under development.</p>
          </div>
        );
    }
  };



  return (
    <div className="flex h-screen bg-gray-50 font-sans">

      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white p-4 border-r shadow-lg transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >


        {/* Logged-in pupil info */}
        <div className="flex items-center gap-3 mb-6 p-2 bg-indigo-100 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white">
            {pupilInitials}
          </div>
          <div>
            <p className="text-lg font-bold text-indigo-800">{pupilName}</p>
            <p className="text-sm text-gray-600">Class: {pupilClass}</p>
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-170px)] pb-4">{renderNavItems(NAV_ITEMS)}</div>

        {/* LOGOUT */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start flex items-center gap-2 text-base py-2 mt-2 text-red-600"
        >
          <MdLogout /> Logout
        </Button>
      </div>



      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}



      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
        {/* Mobile Header/Menu Button */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <Button variant="default" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "Close Menu" : "Open Menu"}
          </Button>
        </div>

        {renderContent()}
      </div>

    </div>
  );
}