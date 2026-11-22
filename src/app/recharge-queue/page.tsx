"use client";

import * as React from "react";
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  Search,
  Zap,
  CheckCheck,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDateTime } from "@/lib/utils/format";

interface QueueItem {
  id: string;
  customer_id: string;
  customer_name: string;
  veng: string;
  plan_name: string;
  amount: number;
  status: "pending_recharge" | "recharged" | "failed";
  recharged_by?: string;
  recharged_at?: string;
  created_at: string;
}

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: "RQ-301",
    customer_id: "003FNF001",
    customer_name: "Lalmuanpuia",
    veng: "College Veng",
    plan_name: "50 Mbps (FNF Standard)",
    amount: 699,
    status: "pending_recharge",
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "RQ-302",
    customer_id: "003FNF002",
    customer_name: "K. Beiratha",
    veng: "New Saiha West",
    plan_name: "100 Mbps (FNF Turbo)",
    amount: 999,
    status: "pending_recharge",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "RQ-303",
    customer_id: "003FNF004",
    customer_name: "David Hlychho",
    veng: "Siahatla I",
    plan_name: "100 Mbps (FNF Turbo)",
    amount: 999,
    status: "recharged",
    recharged_by: "NOC Operator",
    recharged_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
  },
  {
    id: "RQ-304",
    customer_id: "003FNF003",
    customer_name: "C. Zakhei",
    veng: "Meisatla",
    plan_name: "30 Mbps (FNF Starter)",
    amount: 499,
    status: "recharged",
    recharged_by: "NOC Operator",
    recharged_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
  },
];

export default function RechargeQueuePage() {
  const [queue, setQueue] = React.useState<QueueItem[]>(INITIAL_QUEUE);
  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const handleMarkRecharged = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "recharged",
              recharged_by: "NOC Operator (Saiha)",
              recharged_at: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const handleBulkRechargeAll = () => {
    if (!confirm("Are you sure you want to mark all pending items as Recharged?")) return;
    setQueue((prev) =>
      prev.map((item) =>
        item.status === "pending_recharge"
          ? {
              ...item,
              status: "recharged",
              recharged_by: "NOC Batch",
              recharged_at: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const pendingCount = queue.filter((i) => i.status === "pending_recharge").length;
  const completedToday = queue.filter((i) => i.status === "recharged").length;

  const filtered = queue.filter((i) => {
    const matchSearch =
      i.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      i.customer_id.toLowerCase().includes(search.toLowerCase()) ||
      i.veng.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === "all" || i.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              NOC Recharge Queue
            </h1>
            <p className="text-sm text-gray-500">
              Process upstream ISP fiber top-ups and customer speed profile renewals.
            </p>
          </div>
          {pendingCount > 0 && (
            <Button onClick={handleBulkRechargeAll} variant="primary" className="gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700">
              <CheckCheck className="h-4 w-4" /> Mark All Pending as Recharged
            </Button>
          )}
        </div>

        {/* Status KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
                Pending Recharge
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
              <p className="text-xs text-amber-600 font-medium mt-1">Awaiting ISP portal top-up</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
                Recharged Today
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{completedToday}</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">Successfully activated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
                Queue Total
              </CardTitle>
              <Zap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queue.length}</div>
              <p className="text-xs text-gray-400 mt-1">Total items tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customer, ID, or Vêng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Status:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200"
              >
                <option value="all">All Items</option>
                <option value="pending_recharge">Pending Only</option>
                <option value="recharged">Recharged</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Queue Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-900/60 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Customer &amp; ID</th>
                <th className="px-5 py-3.5">Vêng (Saiha)</th>
                <th className="px-5 py-3.5">Plan &amp; Amount</th>
                <th className="px-5 py-3.5">Added Time</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">NOC Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 transition">
                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white block">
                      {item.customer_name}
                    </span>
                    <span className="font-mono text-xs text-blue-600 block">
                      {item.customer_id} &bull; <span className="text-gray-400">{item.id}</span>
                    </span>
                  </td>

                  <td className="px-5 py-4 font-medium text-gray-700 dark:text-zinc-300">
                    {item.veng}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white block">
                      {item.plan_name}
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">
                      {formatINR(item.amount)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-500">
                    {formatDateTime(item.created_at)}
                  </td>

                  <td className="px-5 py-4">
                    {item.status === "pending_recharge" ? (
                      <Badge variant="warning" className="gap-1">
                        <Clock className="h-3 w-3 animate-spin" /> Pending Top-up
                      </Badge>
                    ) : (
                      <Badge variant="success">Recharged</Badge>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {item.status === "pending_recharge" ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleMarkRecharged(item.id)}
                        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 shadow-sm"
                      >
                        <Zap className="h-3.5 w-3.5 mr-1" /> Mark Recharged
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Recharged by {item.recharged_by}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              Recharge queue-ah item hmuh a ni lo.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
