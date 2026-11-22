"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { getLoggedInStaff, setLoggedInStaff, StaffAccount } from "@/lib/services/staff-auth";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<StaffAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // STRICT SECURITY CHECK
    const user = getLoggedInStaff();
    if (!user) {
      // Login a awm loh chuan /login ah theh phei nghal rawh
      window.location.href = "/login";
    } else {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    setLoggedInStaff(null);
    window.location.href = "/login";
  };

  // Login a la nih loh chuan engmah lantir suh
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white text-xs gap-3">
        <div className="h-7 w-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-slate-300">NOC Security: Verifying credentials...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header user={currentUser} onLogout={handleLogout} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
