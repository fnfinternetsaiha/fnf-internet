"use client";

import * as React from "react";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  CloudUpload,
  Download,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatINR, formatDateTime } from "@/lib/utils/format";
import { CashbookEntry } from "@/types";

const CASHBOOK_KEY = "fnf_saiha_cashbook_v2";

const DEFAULT_ENTRIES: CashbookEntry[] = [
  {
    id: "CB-001",
    type: "income",
    category: "Subscription",
    amount: 699,
    description: "Broadband recharge: Lalmuanpuia (College Veng)",
    created_by: "Desk Manager",
    created_at: new Date().toISOString(),
  },
  {
    id: "CB-002",
    type: "expense",
    category: "Fiber Maintenance",
    amount: 1500,
    description: "Fiber splicing joints & patch cord purchase (Bazar Veng)",
    created_by: "Super Admin",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function CashbookPage() {
  const [entries, setEntries] = React.useState<CashbookEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [backupNotice, setBackupNotice] = React.useState<string | null>(null);

  // Form State
  const [type, setType] = React.useState<"income" | "expense">("expense");
  const [category, setCategory] = React.useState("Fiber Maintenance");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CASHBOOK_KEY);
      if (saved) {
        try {
          setEntries(JSON.parse(saved));
        } catch {
          setEntries(DEFAULT_ENTRIES);
        }
      } else {
        localStorage.setItem(CASHBOOK_KEY, JSON.stringify(DEFAULT_ENTRIES));
        setEntries(DEFAULT_ENTRIES);
      }
    }
  }, []);

  const totalIncome = entries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const newEntry: CashbookEntry = {
      id: `CB-${Date.now().toString().slice(-4)}`,
      type,
      category,
      amount: parseFloat(amount),
      description,
      created_by: "Desk Manager",
      created_at: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem(CASHBOOK_KEY, JSON.stringify(updated));

    setAmount("");
    setDescription("");
    setIsModalOpen(false);
  };

  // Google Drive Monthly Backup Export (.csv/.xlsx format)
  const handleExportDriveBackup = () => {
    const month = new Date().toLocaleString("default", { month: "long" });
    const year = new Date().getFullYear();

    let csvContent = `FNF SAIHA INTERNET - MONTHLY ACCOUNTING STATEMENT\n`;
    csvContent += `Month: ${month} ${year}\n`;
    csvContent += `Total Revenue: ${totalIncome}\nTotal Expenses: ${totalExpense}\nNet Profit: ${netBalance}\n\n`;
    csvContent += `Date,ID,Type,Category,Amount,Description,Staff\n`;

    entries.forEach((e) => {
      csvContent += `"${e.created_at.split("T")[0]}","${e.id}","${e.type.toUpperCase()}","${e.category}","${e.amount}","${e.description}","${e.created_by}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FNF_SAIHA_Accounting_Backup_${month}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBackupNotice(`Thlatin Accounting Backup (${month} ${year}) download a ni e! Google Drive folder-ah upload/save nghal theih a ni.`);
    setTimeout(() => setBackupNotice(null), 6000);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Cashbook &amp; Financial Accounting
            </h1>
            <p className="text-sm text-gray-500">
              Track ISP cash inflow, operational expenses, and Google Drive monthly backups.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportDriveBackup}
              variant="outline"
              className="gap-1.5 shadow-sm border-blue-500/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50"
            >
              <CloudUpload className="h-4 w-4" /> Google Drive Monthly Backup
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Record Entry
            </Button>
          </div>
        </div>

        {backupNotice && (
          <div className="p-3.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{backupNotice}</span>
          </div>
        )}

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-gray-500 block">Total Income (Revenue)</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">{formatINR(totalIncome)}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-gray-500 block">Total Operational Expense</span>
                <span className="text-2xl font-black text-red-500 mt-1 block">{formatINR(totalExpense)}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <TrendingDown className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-gray-500 block">Net NOC Profit Balance</span>
                <span className="text-2xl font-black text-blue-600 mt-1 block">{formatINR(netBalance)}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <IndianRupee className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-900 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Date &amp; ID</th>
                <th className="px-5 py-3.5">Type &amp; Category</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Staff</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-bold text-gray-400 block">{entry.id}</span>
                    <span className="text-xs text-gray-600 dark:text-zinc-400">{formatDateTime(entry.created_at)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={entry.type === "income" ? "success" : "danger"}>
                      {entry.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500 block mt-1">{entry.category}</span>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-gray-900 dark:text-white max-w-xs">
                    {entry.description}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {entry.created_by}
                  </td>
                  <td className={`px-5 py-4 text-right font-bold text-sm ${entry.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                    {entry.type === "income" ? "+" : "-"}{formatINR(entry.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Record Entry Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Income or Expense Entry"
        >
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 text-xs font-bold rounded-xl border transition ${type === "income" ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-100 dark:bg-zinc-800 text-gray-500"}`}
              >
                + Income (Pawisa Lut)
              </button>
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 text-xs font-bold rounded-xl border transition ${type === "expense" ? "bg-red-600 text-white border-red-600" : "bg-gray-100 dark:bg-zinc-800 text-gray-500"}`}
              >
                - Expense (Hmanral)
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm"
              >
                {type === "income" ? (
                  <>
                    <option value="Subscription">Monthly Subscription</option>
                    <option value="New Installation">New Fiber Installation Fee</option>
                    <option value="Router Sale">ONU / Router Sale</option>
                    <option value="Other Income">Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="Fiber Maintenance">Fiber Line Repair &amp; Maintenance</option>
                    <option value="Power/Electricity">Electricity &amp; Generator Fuel</option>
                    <option value="Bandwidth Upstream">Upstream ISP Bandwidth Bill</option>
                    <option value="Staff Salary">Staff Allowance / Salary</option>
                    <option value="Office Expense">Office Tea &amp; Supplies</option>
                  </>
                )}
              </select>
            </div>

            <Input
              label="Amount ()"
              type="number"
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <Input
              label="Description / Purpose"
              placeholder="e.g. Purchased 2 rolls drop cable for Siahatla"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Cashbook Entry
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
