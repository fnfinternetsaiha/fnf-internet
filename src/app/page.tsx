"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wifi,
  Gauge,
  Calendar,
  CheckCircle2,
  Phone,
  MapPin,
  Zap,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Lock,
} from "lucide-react";
import { SAIHA_VENGS } from "@/lib/constants/vêng";
import { INTERNET_PLANS } from "@/lib/constants/plans";
import { formatINR } from "@/lib/utils/format";

export default function PublicLandingPage() {
  // Booking Form State
  const [bookingName, setBookingName] = React.useState("");
  const [bookingPhone, setBookingPhone] = React.useState("");
  const [bookingVeng, setBookingVeng] = React.useState(SAIHA_VENGS[0]);
  const [bookingAddress, setBookingAddress] = React.useState("");
  const [bookingPlan, setBookingPlan] = React.useState(INTERNET_PLANS[1].id);
  const [isBooked, setIsBooked] = React.useState(false);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone) return;

    const bookings = JSON.parse(localStorage.getItem("fnf_saiha_bookings") || "[]");
    const newBooking = {
      id: `BOOK-${Date.now().toString().slice(-4)}`,
      name: bookingName,
      phone: bookingPhone,
      veng: bookingVeng,
      landmark: bookingAddress,
      plan: bookingPlan,
      status: "new_booking",
      created_at: new Date().toISOString(),
    };
    localStorage.setItem("fnf_saiha_bookings", JSON.stringify([newBooking, ...bookings]));

    setIsBooked(true);
    setTimeout(() => {
      setBookingName("");
      setBookingPhone("");
      setBookingAddress("");
      setIsBooked(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              FNF SAIHA <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">Fiber Internet</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/pay"
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <Smartphone className="h-3.5 w-3.5" /> Customer Bill Pay
          </Link>
          <Link
            href="/admin"
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5"
          >
            <Lock className="h-3 w-3" /> Admin / NOC
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:py-10 space-y-12">
        {/* HERO SECTION */}
        <section className="text-center space-y-4 pt-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Zap className="h-3.5 w-3.5 text-amber-400" /> Saiha Town High-Speed Optical Fiber
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Chak Lutuk, Rintlak Leh Thlamuanthlak Broadband.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Siaha khawpui chhung veng hrang hrangah optical fiber line thlun zawm vek a ni. Buffer awm lo, HD Streaming leh Gaming tan a tha ber.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#booking"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              Vuah Thar Dilna (Book Connection) <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#speedtest"
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm border border-slate-800 transition flex items-center gap-2"
            >
              <Gauge className="h-4 w-4 text-emerald-400" /> Ookla Speed Test
            </a>
          </div>
        </section>

        {/* OOKLA POWERED SPEED TEST SECTION */}
        <section id="speedtest" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gauge className="h-5 w-5 text-emerald-400" />
                Live Fiber Speedtest
              </h3>
              <p className="text-xs text-slate-400">Test your real-time latency, download &amp; upload speed</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Powered by Ookla Engine
              </span>
              <a
                href="https://www.speedtest.net"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                Speedtest.net <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Embedded Real Speed Test Widget */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex justify-center items-center min-h-[500px]">
            <iframe
              src="https://openspeedtest.com/Get-widget.php"
              title="FNF Saiha Ookla Speedtest"
              className="w-full h-[520px] border-0 rounded-2xl"
              allow="fullscreen"
            />
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            * Speed test dik tak teh nan router bul hnaiah emaw LAN Cable hmangin test a tha ber e.
          </p>
        </section>

        {/* BROADBAND PLANS */}
        <section className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-black text-white">Broadband Plans &amp; Rates</h3>
            <p className="text-xs text-slate-400">Unlimited data with symmetrical upload/download speed</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {INTERNET_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl p-5 border border-slate-800 bg-slate-900/60 flex flex-col justify-between hover:border-blue-500/60 transition"
              >
                <div>
                  <span className="text-xs text-blue-400 font-bold uppercase">{plan.name}</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{plan.speed_mbps}</span>
                    <span className="text-xs text-slate-400 uppercase font-bold">Mbps</span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-1">Unlimited Monthly Data</span>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <span className="text-2xl font-black text-emerald-400">{formatINR(plan.price)}</span>
                  <span className="text-[11px] text-slate-400 block">/ 30 Days</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* NEW CONNECTION BOOKING FORM */}
        <section id="booking" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur max-w-xl mx-auto space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Fiber Line Vuah Thar Dilna (New Booking)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              I chanchin chhu lut la, Siaha FNF Technician-in an rawn be nghal ang che.
            </p>
          </div>

          {isBooked ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Booking Thehluh a ni e!</h4>
              <p className="text-xs text-slate-300">
                FNF Saiha Desk Manager-in a hma thei ang berin phone hmangin an rawn be dawn che nia.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name (Hming Pum) *</label>
                <input
                  type="text"
                  placeholder="e.g. Lalmuanpuia"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone Number *</label>
                <input
                  type="text"
                  placeholder="10-digit mobile number"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Saiha Vêng (Locality) *</label>
                  <select
                    value={bookingVeng}
                    onChange={(e) => setBookingVeng(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    {SAIHA_VENGS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Plan *</label>
                  <select
                    value={bookingPlan}
                    onChange={(e) => setBookingPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    {INTERNET_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatINR(p.price)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">House No. / Landmark Detail</label>
                <input
                  type="text"
                  placeholder="e.g. Near ECM Church, Section A"
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Submit Booking Request
              </button>
            </form>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>FNF Saiha Optical Fiber Internet Service &bull; Central NOC Office, Saiha, Mizoram</p>
        <p className="text-[11px] text-slate-600">Helpline: 9862001122 &bull; Support: 9862001123</p>
      </footer>
    </div>
  );
}
