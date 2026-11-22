"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { getLoggedInStaff, setLoggedInStaff, StaffAccount } from "@/lib/services/staff-auth";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<StaffAccount | null>(null);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const user = getLoggedInStaff();
    if (!user) {
      // Default to Super Admin if first time, or redirect to login
      const defaultUser = {
        id: "STF-001",
        name: "FNF Super Admin",
        username: "admin",
        phone: "9862001122",
        password: "admin123",
        role: "super_admin" as const,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setLoggedInStaff(defaultUser);
      setCurrentUser(defaultUser);
    } else {
      setCurrentUser(user);
    }
    setIsChecking(false);
  }, [router]);

  const handleLogout = () => {
    setLoggedInStaff(null);
    router.push("/login");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        Checking NOC security credentials...
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
