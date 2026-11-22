"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  RefreshCw,
  AlertTriangle,
  IndianRupee,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDate, daysUntilExpiry } from "@/lib/utils/format";
import {
  getStoredCustomers,
  getStoredPayments,
  approvePaymentByAdmin,
  CustomerUser,
} from "@/lib/services/customer-store";
import { PaymentRecord } from "@/types";

export default function AdminDashboardPage() {
  const [customers, setCustomers] = React.useState<CustomerUser[]>([]);
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);

  const loadData = () => {
    setCustomers(getStoredCustomers());
    setPayments(getStoredPayments());
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const activeCustomers = customers.filter((c) => c.status === "active");
  const expiringCustomers = customers.filter((c) => {
    const days = daysUntilExpiry(c.expiry_date);
    return days <= 3 && days >= 0;
  });

  const pendingPayments = payments.filter((p) => p.status === "pending");

  const todayStr = new Date().toDateString();
  const todayIncome = payments
    .filter((p) => p.status === "approved" && new Date(p.created_at).toDateString() === todayStr)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const handleQuickApprove = (paymentId: string) => {
    approvePaymentByAdmin(paymentId, "Desk Manager (NOC)");
    loadData();
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              NOC Operational Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Live Saiha internet network status, active subscriptions, and real-time revenue.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/customers">
              <Button size="sm" className="gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> Add Customer
              </Button>
            </Link>
            <Link href="/payments">
              <Button size="sm" variant="outline" className="gap-1.5">
                Verify Payments ({pendingPayments.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Users</span>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{activeCustomers.length}</span>
                <span className="text-[11px] text-emerald-500 block font-medium mt-0.5">&bull; 100% online</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiring (3 Days)</span>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-amber-500">{expiringCustomers.length}</span>
                <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Needs renewal SMS</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Approval</span>
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <RefreshCw className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-indigo-400">{pendingPayments.length}</span>
                <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Awaiting NOC action</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expired Accounts</span>
                <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-red-500">
                  {customers.filter((c) => c.status === "expired").length}
                </span>
                <span className="text-[11px] text-red-400 block font-medium mt-0.5">Lines suspended</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Income</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-500">{formatINR(todayIncome)}</span>
                <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Verified today</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2 Real-Time Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pending Payments */}
          <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                  Incoming Payments Requiring Approval
                </h3>
                <Link href="/payments" className="text-xs text-blue-600 hover:underline font-semibold">
                  View All &rarr;
                </Link>
              </div>

              {pendingPayments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">All payments cleared!</div>
              ) : (
                <div className="space-y-2.5">
                  {pendingPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{p.customer_name}</span>
                          <span className="font-mono text-[10px] text-blue-500">({p.customer_id})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-bold text-emerald-600">{formatINR(p.amount)}</span>
                          <span>&bull;</span>
                          <span className="font-mono text-[11px] text-slate-400">{p.transaction_ref}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleQuickApprove(p.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscribers List */}
          <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  Registered Saiha Subscribers
                </h3>
                <Link href="/customers" className="text-xs text-blue-600 hover:underline font-semibold">
                  Manage Directory &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {customers.slice(0, 4).map((c) => {
                  const days = daysUntilExpiry(c.expiry_date);
                  const isExpired = days < 0;

                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({c.id})</span>
                        </div>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {c.veng} &bull; {c.plan_id.replace("fnf-", "")} Mbps
                        </span>
                      </div>

                      <div className="text-right">
                        <Badge variant={isExpired ? "danger" : days <= 3 ? "warning" : "success"}>
                          {isExpired ? "Expired" : `${days} Days Left`}
                        </Badge>
                        <span className="block text-[10px] text-slate-400 mt-1">{formatDate(c.expiry_date)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
