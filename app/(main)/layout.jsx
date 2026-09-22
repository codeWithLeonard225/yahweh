"use client";

import MainFooter from "../component/MainFooter";
import MainNavbar from "../component/MainNavbar";
import { AuthProvider } from "@/app/context/AuthContext";

export default function MainLayout({ children }) {
  return (
    <AuthProvider>
      <div className="min-h-screen overflow-x-hidden">
        <MainNavbar />

        {/* Page Content */}
        <main className="pt-20 overflow-x-hidden">
          {children}
        </main>

        <MainFooter />
      </div>
    </AuthProvider>
  );
}
