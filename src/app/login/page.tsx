"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wifi,
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { authenticateStaff, setLoggedInStaff } from "@/lib/services/staff-auth";

export default function StaffLoginPage() {
  const router = useRouter();
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
      const user = authenticateStaff(username, password);
      if (user) {
        setLoggedInStaff(user);
        router.push("/");
      } else {
        setError("Username emaw password a dik lo. Admin be rawh.");
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white flex items-center gap-2">
              FNF SAIHA <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">NOC Admin Portal</span>
            </h1>
          </div>
        </div>

        <Link
          href="/pay"
          className="text-xs text-blue-400 hover:text-white border border-blue-900/60 px-3 py-1.5 rounded-lg transition"
        >
          Customer Self-Care &rarr;
        </Link>
      </header>

      {/* Main Login Card (Clean & Secure - No leaks) */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:py-16 flex flex-col justify-center">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          <div className="text-center space-y-1.5">
            <div className="h-12 w-12 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Staff &amp; NOC Sign In</h2>
            <p className="text-xs text-slate-400">
              Enter your registered username and secret password.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Username or Phone Number
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter secret password"
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
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? "Verifying..." : "Sign In to NOC Dashboard"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        FNF Saiha Optical Fiber Broadband &bull; Central NOC Office, Saiha, Mizoram
      </footer>
    </div>
  );
}
