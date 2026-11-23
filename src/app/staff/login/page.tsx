"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wifi,
  Wrench,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
} from "lucide-react";
import { authenticateStaff } from "@/lib/services/staff-auth";

export default function StaffLoginPage() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const res = authenticateStaff(username, password);
      if (res.success) {
        window.location.href = "/admin";
      } else {
        setError(res.error || "Staff login failed.");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white flex items-center gap-2">
              FNF SAIHA <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">Staff Operational Portal</span>
            </h1>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white border border-slate-800 px-3 py-1.5 rounded-lg transition"
        >
          &larr; Public Website
        </Link>
      </header>

      {/* Staff Login Card */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:py-16 flex flex-col justify-center">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          <div className="text-center space-y-1.5">
            <div className="h-14 w-14 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-2">
              <Wrench className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black text-white">Staff Operational Sign In</h2>
            <p className="text-xs text-slate-400">
              Desk Managers, Field Technicians &amp; Accounts Workspace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Staff Username or Mobile
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. manager or tech"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Staff Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your assigned password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Open Staff Workspace"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-center">
            <Link href="/admin/login" className="text-xs text-slate-400 hover:text-red-400 transition">
              Super Admin Executive? Go to Admin Login &rarr;
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        FNF Saiha Optical Fiber Broadband &bull; Central NOC Field Operations
      </footer>
    </div>
  );
}
