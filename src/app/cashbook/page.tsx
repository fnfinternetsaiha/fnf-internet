"use client";

import * as React from "react";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Receipt,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatINR, formatDateTime } from "@/lib/utils/format";
import { CashbookEntry } from "@/types";

const INITIAL_ENTRIES: CashbookEntry[] = [
  {
    id: "CB-501",
    type: "income",
    category: "Customer Subscription",
    amount: 999,
    description: "K. Beiratha 100Mbps renewal (003FNF002)",
    reference_id: "PAY-1080",
    created_by: "Desk Manager",
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "CB-502",
    type: "income",
    category: "New Installation",
    amount: 2500,
    description: "New fiber line & Dual-band ONU installation (College Veng)",
    created_by: "Desk Manager",
    created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  },
  {
    id: "CB-503",
    type: "expense",
    category: "Generator Diesel Fuel",
    amount: 1450,
    description: "15 Litres diesel for Saiha NOC backup generator",
    created_by: "Accountant",
    created_at: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
  },
  {
    id: "CB-504",
    type: "expense",
    category: "Technician Field Allowance",
    amount: 600,
    description: "Bike petrol allowance for 2 technicians (Siahatla & New Saiha field work)",
    created_by: "Accountant",
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: "CB-505",
    type: "income",
    category: "Customer Subscription",
    amount: 699,
    description: "Lalmuanpuia 50Mbps renewal (003FNF001)",
    reference_id: "PAY-1081",
    created_by: "Desk Manager",
    created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
  },
];

const INCOME_CATEGORIES = [
  "Customer Subscription",
  "New Installation Fee",
  "ONU / Router Sale",
  "Fiber Repair / Splicing Charge",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Upstream Bandwidth Bill",
  "Generator Diesel Fuel",
  "Technician Field Allowance",
  "Fiber Cable & Splicing Materials",
  "Office Rent & Utilities",
  "Tea & Refreshments",
  "Other Expense",
];

export default function CashbookPage() {
  const [entries, setEntries] = React.useState<CashbookEntry[]>(INITIAL_ENTRIES);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  // New Entry Form state
  const [entryType, setEntryType] = React.useState<"income" | "expense">("income");
  const [category, setCategory] = React.useState(INCOME_CATEGORIES[0]);
  const [amount, setAmount] = React.useState("");
  const [desc, setDesc] = React.useState("");

  const totalIncome = entries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const newRecord: CashbookEntry = {
      id: `CB-${501 + entries.length}`,
      type: entryType,
      category,
      amount: Number(amount),
      description: desc,
      created_by: "Desk Manager",
      created_at: new Date().toISOString(),
    };

    setEntries([newRecord, ...entries]);
    setAmount("");
    setDesc("");
    setIsAddModalOpen(false);
  };

  const filtered = entries.filter((e) => {
    const matchSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === "all" || e.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Daily Cashbook &amp; Financials
            </h1>
            <p className="text-sm text-gray-500">
              Track daily branch cash inflows, expenses, fuel, and upstream costs.
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Cashbook Entry
          </Button>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
                Total Inflow (Income)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatINR(totalIncome)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Subscriptions &amp; installations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
                Total Outflow (Expenses)
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatINR(totalExpense)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Diesel, fuel, parts, upstream</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
                Net Cash In Hand
              </CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {formatINR(netBalance)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Current branch net balance</p>
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
                placeholder="Search description, category, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Filter:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-900/60 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Entry ID &amp; Type</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Date &amp; Recorded By</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 transition">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-bold text-gray-400 block">{item.id}</span>
                    <div className="mt-1">
                      {item.type === "income" ? (
                        <Badge variant="success" className="gap-1">
                          <ArrowDownRight className="h-3 w-3" /> Income
                        </Badge>
                      ) : (
                        <Badge variant="danger" className="gap-1">
                          <ArrowUpRight className="h-3 w-3" /> Expense
                        </Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold text-gray-800 dark:text-zinc-200">
                    {item.category}
                  </td>

                  <td className="px-5 py-4 text-gray-600 dark:text-zinc-400 max-w-xs">
                    {item.description}
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-500">
                    <p>{formatDateTime(item.created_at)}</p>
                    <p className="text-[11px] text-gray-400 font-medium">By: {item.created_by}</p>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <span
                      className={`text-base font-bold ${
                        item.type === "income" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {item.type === "income" ? "+" : "-"}
                      {formatINR(item.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              Cashbook entry engmah hmuh a ni lo.
            </div>
          )}
        </div>

        {/* Add Entry Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="New Cashbook Entry"
        >
          <form onSubmit={handleCreateEntry} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                Entry Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEntryType("income");
                    setCategory(INCOME_CATEGORIES[0]);
                  }}
                  className={`py-2 text-sm font-semibold rounded-lg border transition ${
                    entryType === "income"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300"
                  }`}
                >
                  + Cash Inflow (Income)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryType("expense");
                    setCategory(EXPENSE_CATEGORIES[0]);
                  }}
                  className={`py-2 text-sm font-semibold rounded-lg border transition ${
                    entryType === "expense"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300"
                  }`}
                >
                  - Cash Outflow (Expense)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm"
              >
                {(entryType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Amount (₹)"
              type="number"
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <Input
              label="Description / Purpose"
              placeholder="e.g. 15 Litres diesel for generator or Customer subscription"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className={entryType === "income" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
              >
                Save Entry
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
