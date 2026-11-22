"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wifi,
  Lock,
  Phone,
  LogOut,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Zap,
  Check,
  ShieldAlert,
  Headphones,
  Eye,
  EyeOff,
  Receipt,
} from "lucide-react";
import { formatINR, formatDate, daysUntilExpiry } from "@/lib/utils/format";
import { INTERNET_PLANS } from "@/lib/constants/plans";
import {
  authenticateCustomer,
  getStoredCustomers,
  submitCustomerPayment,
  getStoredPayments,
  CustomerUser,
} from "@/lib/services/customer-store";
import { PaymentRecord } from "@/types";

const SESSION_KEY = "fnf_logged_in_customer";

export default function CustomerBillingHub() {
  const [customer, setCustomer] = React.useState<CustomerUser | null>(null);

  // Login form
  const [phone, setPhone] = React.useState("9862551234");
  const [password, setPassword] = React.useState("password123");
  const [showPass, setShowPass] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");

  // Payment Selection
  const [selectedPlanId, setSelectedPlanId] = React.useState("fnf-50");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedPayment, setSubmittedPayment] = React.useState<PaymentRecord | null>(null);

  // Restore session & sync customer data
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Sync with latest customer store in case Admin approved
          const latest = getStoredCustomers().find((c) => c.id === parsed.id) || parsed;
          setCustomer(latest);
          setSelectedPlanId(latest.plan_id || "fnf-50");

          // Check if user has an existing pending payment
          const pending = getStoredPayments().find(
            (p) => p.customer_id === latest.id && p.status === "pending"
          );
          if (pending) setSubmittedPayment(pending);
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const user = authenticateCustomer(phone, password);
    if (user) {
      setCustomer(user);
      setSelectedPlanId(user.plan_id);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));

      // Check pending payments
      const pending = getStoredPayments().find((p) => p.customer_id === user.id && p.status === "pending");
      if (pending) setSubmittedPayment(pending);
    } else {
      setLoginError("Mobile number emaw password a dik lo. Admin be rawh.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCustomer(null);
    setSubmittedPayment(null);
  };

  const selectedPlan = INTERNET_PLANS.find((p) => p.id === selectedPlanId) || INTERNET_PLANS[0];

  // Pay & Submit for STRICT Admin Verification
  const handlePayAndSubmit = () => {
    if (!customer) return;

    const randomTrx = `FNF${Math.floor(10000000 + Math.random() * 90000000)}`;
    const upiUri = `upi://pay?pa=fnfsaiha@okaxis&pn=FNF%20SAIHA%20INTERNET&am=${selectedPlan.price}&cu=INR&tr=${randomTrx}&tn=Recharge%20${customer.id}`;

    // Open GPay app
    window.location.href = upiUri;

    setIsSubmitting(true);
    setTimeout(() => {
      // Submits as PENDING to Admin Queue
      const payment = submitCustomerPayment(
        customer,
        selectedPlan.id,
        selectedPlan.price,
        randomTrx
      );
      setSubmittedPayment(payment);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white antialiased">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              FNF SAIHA <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">Self-Care Hub</span>
            </h1>
          </div>
        </div>

        <div>
          {customer ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 hover:bg-red-900/40 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          ) : (
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 px-3.5 py-1.5 rounded-lg transition"
            >
              Staff Portal &rarr;
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:py-8 space-y-6">
        {!customer ? (
          /* LOGIN SCREEN */
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-2">
                <Lock className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Sign In to Your Account</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Customer login with registered mobile number &amp; password.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Customer Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white transition shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Sign In to Self-Care Hub
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <Headphones className="h-3.5 w-3.5 text-blue-400" />
                Password theihnghilh chuan Saiha NOC (9862001122) be rawh le.
              </p>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Account Status Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {customer.id}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Optical Fiber Online
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white">{customer.name}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" /> {customer.veng}, Saiha &bull; {customer.phone}
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-3 sm:text-right min-w-[140px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Validity Status
                  </span>
                  <span className={`text-xl font-black ${daysUntilExpiry(customer.expiry_date) <= 3 ? "text-amber-400" : "text-white"}`}>
                    {daysUntilExpiry(customer.expiry_date) > 0 ? `${daysUntilExpiry(customer.expiry_date)} Days Left` : "Plan Expired"}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Exp: {formatDate(customer.expiry_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* PENDING APPROVAL NOTIFICATION BANNER (When customer has submitted payment) */}
            {submittedPayment && submittedPayment.status === "pending" && (
              <div className="bg-amber-950/40 border border-amber-800/80 rounded-3xl p-5 shadow-xl space-y-2 animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                    <Clock className="h-5 w-5 animate-spin" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      Status: Under Verification by Admin
                    </span>
                    <h4 className="text-base font-bold text-white">Payment Thehluh a ni e! (Pending Approval)</h4>
                  </div>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-900/50 text-xs text-slate-300 space-y-1">
                  <p><strong>UTR Ref:</strong> <span className="font-mono text-amber-400">{submittedPayment.transaction_ref}</span> &bull; <strong>Amount:</strong> {formatINR(submittedPayment.amount)}</p>
                  <p className="text-slate-400">Desk Manager-in Bank account a check hnuah validity hi a extend nghal ang.</p>
                </div>
              </div>
            )}

            {/* SELECT PLAN & PAY NOW */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  Select Broadband Plan to Renew / Upgrade
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Plan thlang la, Google Pay atanga i pek hnuah Admin-in a lo verify ang.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INTERNET_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isCurrent = customer.plan_id === plan.id;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-base">{plan.speed_mbps} Mbps</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-semibold">
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">{plan.name}</span>
                        </div>
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-slate-700"
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-slate-800/60">
                        <span className="text-2xl font-black text-emerald-400">{formatINR(plan.price)}</span>
                        <span className="text-xs text-slate-400">30 Days</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePayAndSubmit}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-sm sm:text-base text-white shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition active:scale-[0.98] cursor-pointer"
                >
                  <Smartphone className="h-5 w-5" />
                  {isSubmitting ? (
                    <span>Submitting to Admin Queue...</span>
                  ) : (
                    <span>Pay {formatINR(selectedPlan.price)} via Google Pay &amp; Submit for Verification</span>
                  )}
                </button>
              </div>
            </div>

            {/* 2026 STATEMENT */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-400" />
                2026 Monthly Billing Statement (Jan - Dec)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {customer.monthlyRecords?.map((r) => (
                  <div
                    key={r.month}
                    className={`p-2.5 rounded-xl border text-center ${
                      r.status === "paid"
                        ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                        : r.status === "due"
                        ? "bg-red-950/20 border-red-800/40 text-red-300"
                        : "bg-slate-950 border-slate-800 text-slate-500"
                    }`}
                  >
                    <span className="font-bold text-xs block text-white">{r.month} 2026</span>
                    <span className="text-[10px] uppercase font-bold">
                      {r.status === "paid" ? "Paid" : r.status === "due" ? "Due" : "Upcoming"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        FNF Saiha Optical Fiber Broadband &bull; Saiha, Mizoram
      </footer>
    </div>
  );
}
