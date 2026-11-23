"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import {
  getLoggedInStaff,
  logoutStaff,
  StaffAccount,
} from "@/lib/services/staff-auth";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<StaffAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleLogout = () => {
    logoutStaff();
    window.location.href = "/admin/login";
  };

  React.useEffect(() => {
    const user = getLoggedInStaff();
    if (!user) {
      // Not logged in or tab was closed -> Redirect to admin login!
      window.location.href = "/admin/login";
      return;
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white text-xs gap-3">
        <div className="h-7 w-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-slate-300">Checking NOC session...</span>
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
