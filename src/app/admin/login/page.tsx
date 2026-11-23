"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { authenticateAdmin } from "@/lib/services/staff-auth";

export default function AdminLoginPage() {
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
      const res = authenticateAdmin(username, password);
      if (res.success) {
        window.location.href = "/admin";
      } else {
        setError(res.error || "Login failed.");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-red-950/60 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white flex items-center gap-2">
              FNF SAIHA <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">Executive Admin Portal</span>
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

      {/* Admin Login Card */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:py-16 flex flex-col justify-center">
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-red-950/20 border border-red-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          <div className="text-center space-y-1.5">
            <div className="h-14 w-14 rounded-2xl bg-red-600/10 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto mb-2">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black text-white">Super Administrator Sign In</h2>
            <p className="text-xs text-slate-400">
              Restricted central NOC operations &amp; root financial authority.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Admin Username or Phone
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Master Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter secret master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
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
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-sm text-white transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? "Authenticating Master Key..." : "Authorize Admin Dashboard"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-center">
            <Link href="/staff/login" className="text-xs text-slate-400 hover:text-blue-400 transition">
              Staff or Field Technician? Go to Staff Login &rarr;
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        FNF Saiha Optical Fiber Broadband &bull; Central NOC Master Authority
      </footer>
    </div>
  );
}
