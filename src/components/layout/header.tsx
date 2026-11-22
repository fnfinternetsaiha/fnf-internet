"use client";

import * as React from "react";
import Link from "next/link";
import { Wifi, LogOut, ShieldCheck, User } from "lucide-react";
import { StaffAccount } from "@/lib/services/staff-auth";

interface HeaderProps {
  user?: StaffAccount | null;
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-4 md:px-8 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-sm md:text-base text-gray-900 dark:text-white flex items-center gap-2">
          Saiha ISP Portal
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Server Online
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* User Role Card */}
        <div className="flex items-center gap-2.5 pl-3 pr-2 py-1 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
          <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0] || "A"}
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-bold text-gray-900 dark:text-white leading-tight">
              {user?.name || "Admin"}
            </span>
            <span className="block text-[10px] uppercase font-semibold text-blue-500">
              {user?.role?.replace("_", " ") || "Super Admin"}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out of NOC"
              className="ml-2 p-1.5 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
