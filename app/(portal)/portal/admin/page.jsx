"use client";
// app/(portal)/portal/dashboard/page.jsx

import { useAuth } from "@/app/context/AuthContext"; 
import { useRouter } from "next/navigation";
import { useEffect } from "react"; 

// The path in your LoginPage's getPupilRoute is: "/portal/dashboard/"
// This page should be ready to handle the pupil session.

export default function PupilDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // 🛡️ Client-Side Protection & Redirect Check
  useEffect(() => {
  if (!authLoading) {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "pupil") {
      router.replace("/login");
    }
  }
}, [user, authLoading, router]);

  
  // ⏳ Render a loading state while authentication is in progress
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-indigo-700">Loading Dashboard...</p>
      </div>
    );
  }
  
  // Destructure relevant data from the authenticated user object
  const { 
    data: pupilData, 
    schoolName, 
    schoolAddress, 
    schoolMotto, 
    schoolContact, 
    email, 
    schoolLogoUrl 
  } = user;

  const pupilName = pupilData.studentName || "Valued Pupil";
  const pupilId = pupilData.studentID;

  // ✅ Dashboard Content for the authenticated pupil
  return (
    <div className="p-8 bg-white min-h-screen">
      <header className="border-b pb-4 mb-6 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-indigo-700">
          Welcome, {pupilName}!
        </h1>
        {/* Placeholder for School Logo */}
        {schoolLogoUrl && (
          <img 
            src={schoolLogoUrl} 
            alt={`${schoolName} Logo`} 
            className="h-16 w-auto object-contain rounded-lg" 
          />
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pupil Identity Card */}
        <div className="bg-indigo-50 p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">Pupil Identity</h2>
          <p className="text-lg text-gray-700">
            **Name:** <span className="font-semibold">{pupilName}</span>
          </p>
          <p className="text-lg text-gray-700">
            **ID:** <span className="font-mono bg-indigo-200 px-2 py-0.5 rounded text-sm">{pupilId}</span>
          </p>
          <p className="text-lg text-gray-700">
            **Role:** <span className="capitalize">{user.role}</span>
          </p>
        </div>

        {/* School Details Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏫 School Details</h2>
          <p className="text-xl font-medium text-indigo-700">{schoolName}</p>
          <p className="text-gray-600">**Motto:** {schoolMotto}</p>
          <p className="text-gray-600">**Address:** {schoolAddress}</p>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📞 Contact</h2>
          <p className="text-gray-600">**Phone:** {schoolContact}</p>
          <p className="text-gray-600">**Email:** {email}</p>
        </div>
      </div>

      <footer className="mt-12 pt-4 border-t text-center text-gray-500">
        <p>Welcome to your personal school portal.</p>
      </footer>
    </div>
  );
}