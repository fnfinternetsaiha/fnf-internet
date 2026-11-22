"use client";

import Link from "next/link";
import {
  Users,
  AlertTriangle,
  RefreshCw,
  Clock,
  IndianRupee,
  Plus,
  ArrowRight,
  WifiOff,
  CheckCircle2,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils/format";

export default function DashboardOverviewPage() {
  // Metric counts (Dynamic state placeholder)
  const metrics = {
    totalActive: 482,
    expiringSoon: 19,
    pendingRecharges: 7,
    openComplaints: 4,
    todayCollection: 18490,
  };

  const urgentComplaints = [
    { id: "FNF-TICK-1021", customer: "Lalmuanpuia", veng: "College Veng", issue: "LOS Red Blinking", time: "25m ago" },
    { id: "FNF-TICK-1020", customer: "K. Beiratha", veng: "New Saiha West", issue: "Main Fiber Cut", time: "1h ago" },
    { id: "FNF-TICK-1019", customer: "C. Zakhei", veng: "Meisatla", issue: "ONU No Power", time: "2h ago" },
  ];

  const pendingRecharges = [
    { id: "REC-901", customer: "David Hlychho", veng: "Siahatla I", plan: "50 Mbps (₹699)", method: "GPay" },
    { id: "REC-902", customer: "Vanlalruati", veng: "Bazar Veng", plan: "100 Mbps (₹999)", method: "PhonePe" },
    { id: "REC-903", customer: "Beino Chozah", veng: "Council Veng", plan: "30 Mbps (₹499)", method: "Cash" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Welcome & Quick Action Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              NOC Operational Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Saiha Internet Subscriber &amp; Network Status
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/customers">
              <Button size="sm" variant="primary" className="gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> Add Customer
              </Button>
            </Link>
            <Link href="/payments">
              <Button size="sm" variant="secondary" className="gap-1.5">
                Verify Payment
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="hover:border-blue-500/50 transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalActive}</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">98.2% online rate</p>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-500/50 transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Expiring (3 Days)
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{metrics.expiringSoon}</div>
              <p className="text-xs text-gray-400 mt-1">Needs reminder SMS</p>
            </CardContent>
          </Card>

          <Card className="hover:border-blue-500/50 transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recharge Queue
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.pendingRecharges}</div>
              <p className="text-xs text-gray-400 mt-1">Ready to activate</p>
            </CardContent>
          </Card>

          <Card className="hover:border-red-500/50 transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active LOS/Faults
              </CardTitle>
              <WifiOff className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.openComplaints}</div>
              <p className="text-xs text-red-500 font-medium mt-1">Technicians dispatched</p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/50 transition sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Today's Income
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatINR(metrics.todayCollection)}
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">UPI &amp; Cash verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Grids: Pending Recharges & Urgent Complaints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Recharge Queue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-semibold">Immediate Recharge Queue</CardTitle>
                <p className="text-xs text-gray-500">Payments approved, awaiting ISP top-up</p>
              </div>
              <Link href="/recharge-queue" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {pendingRecharges.map((rec) => (
                  <div key={rec.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{rec.customer}</p>
                      <p className="text-xs text-gray-500">{rec.veng} &bull; <span className="font-semibold text-gray-700 dark:text-zinc-300">{rec.plan}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{rec.method}</Badge>
                      <Button size="sm" variant="primary" className="h-7 text-xs px-2.5">
                        Done
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Urgent Complaints / LOS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-semibold">Field Tech &amp; LOS Tickets</CardTitle>
                <p className="text-xs text-gray-500">Saiha town optical fiber faults</p>
              </div>
              <Link href="/complaints" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {urgentComplaints.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-gray-400">{item.id}</span>
                        <Badge variant="danger">{item.issue}</Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.customer} <span className="text-xs text-gray-400 font-normal">({item.veng})</span>
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
