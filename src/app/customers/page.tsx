"use client";

import * as React from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  KeyRound,
  Check,
  CreditCard,
  History,
  FileSpreadsheet,
  Upload,
  Download,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SAIHA_VENGS } from "@/lib/constants/vêng";
import { INTERNET_PLANS } from "@/lib/constants/plans";
import { formatINR, formatDate, daysUntilExpiry } from "@/lib/utils/format";
import { generateCustomerId } from "@/lib/utils/id-generator";
import {
  getStoredCustomers,
  saveStoredCustomers,
  updateCustomerPassword,
  CustomerUser,
} from "@/lib/services/customer-store";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<CustomerUser[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedVeng, setSelectedVeng] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);
  const [activeLedgerCustomer, setActiveLedgerCustomer] = React.useState<CustomerUser | null>(null);
  const [passwordModalCustomer, setPasswordModalCustomer] = React.useState<CustomerUser | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);

  // Bulk Import state
  const [bulkCsvText, setBulkCsvText] = React.useState("");
  const [parsedBulk, setParsedBulk] = React.useState<any[]>([]);
  const [bulkSuccessNotice, setBulkSuccessNotice] = React.useState(false);

  // New Customer Form State
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [veng, setVeng] = React.useState<string>(SAIHA_VENGS[0]);
  const [address, setAddress] = React.useState("");
  const [planId, setPlanId] = React.useState(INTERNET_PLANS[0].id);
  const [mac, setMac] = React.useState("");
  const [custPass, setCustPass] = React.useState("password123");

  React.useEffect(() => {
    setCustomers(getStoredCustomers());
  }, []);

  // Download Sample CSV/Excel Template
  const handleDownloadTemplate = () => {
    const header = "Name,Phone,Veng,Address,PlanSpeedMbps,Password\n";
    const sample = "Lalbiakvela,9862112233,College Veng,Near Synod Press,50,password123\nK. Zothanga,9436112244,New Saiha East,H/No 23 Bazar road,100,password123\n";
    const blob = new Blob([header + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "fnf_saiha_customer_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File or Text
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setBulkCsvText(text);
        processCsv(text);
      };
      reader.readAsText(file);
    }
  };

  const processCsv = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return;

    const rows = lines.slice(1).map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      return {
        name: parts[0] || "Unknown",
        phone: parts[1] || "0000000000",
        veng: parts[2] || "College Veng",
        address: parts[3] || "Saiha Town",
        speed: parseInt(parts[4]) || 50,
        password: parts[5] || "password123",
      };
    });
    setParsedBulk(rows);
  };

  // Execute Bulk Save
  const handleExecuteBulkImport = () => {
    if (parsedBulk.length === 0) return;

    let highestNum = customers.length;
    const newItems: CustomerUser[] = parsedBulk.map((item, idx) => {
      const customerId = generateCustomerId(highestNum + idx);
      const plan = INTERNET_PLANS.find((p) => p.speed_mbps === item.speed) || INTERNET_PLANS[0];
      const exp = new Date();
      exp.setDate(exp.getDate() + 30);

      const defaultRecords = MONTHS.map((m, mIdx) => ({
        month: m,
        status: (mIdx === new Date().getMonth() ? "paid" : mIdx < new Date().getMonth() ? "due" : "upcoming") as "paid" | "due" | "upcoming",
        amount: plan.price,
        paidDate: mIdx === new Date().getMonth() ? "Today" : undefined,
      }));

      return {
        id: customerId,
        name: item.name,
        phone: item.phone,
        password: item.password,
        veng: item.veng,
        address_detail: item.address,
        plan_id: plan.id,
        monthly_charge: plan.price,
        status: "active",
        expiry_date: exp.toISOString().split("T")[0],
        created_at: new Date().toISOString(),
        monthlyRecords: defaultRecords,
      };
    });

    const updated = [...newItems, ...customers];
    setCustomers(updated);
    saveStoredCustomers(updated);

    setBulkSuccessNotice(true);
    setTimeout(() => {
      setBulkSuccessNotice(false);
      setIsBulkModalOpen(false);
      setParsedBulk([]);
      setBulkCsvText("");
    }, 1500);
  };

  const handlePaySpecificMonth = (monthName: string) => {
    if (!activeLedgerCustomer) return;

    const updatedRecords = activeLedgerCustomer.monthlyRecords.map((rec) => {
      if (rec.month === monthName) {
        return {
          ...rec,
          status: "paid" as const,
          paidDate: `${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
        };
      }
      return rec;
    });

    const updatedCustomer: CustomerUser = {
      ...activeLedgerCustomer,
      status: "active",
      monthlyRecords: updatedRecords,
    };

    const updatedList = customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c));
    setCustomers(updatedList);
    saveStoredCustomers(updatedList);
    setActiveLedgerCustomer(updatedCustomer);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalCustomer || !newPassword.trim()) return;

    updateCustomerPassword(passwordModalCustomer.id, newPassword.trim());
    setCustomers(getStoredCustomers());
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setPasswordModalCustomer(null);
      setNewPassword("");
    }, 1200);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = INTERNET_PLANS.find((p) => p.id === planId) || INTERNET_PLANS[0];
    const newId = generateCustomerId(customers.length);
    const exp = new Date();
    exp.setDate(exp.getDate() + plan.validity_days);

    const defaultRecords = MONTHS.map((m, idx) => ({
      month: m,
      status: (idx === new Date().getMonth() ? "paid" : idx < new Date().getMonth() ? "due" : "upcoming") as "paid" | "due" | "upcoming",
      amount: plan.price,
      paidDate: idx === new Date().getMonth() ? "Today" : undefined,
    }));

    const newCust: CustomerUser = {
      id: newId,
      name,
      phone,
      password: custPass.trim() || "password123",
      veng,
      address_detail: address,
      plan_id: plan.id,
      monthly_charge: plan.price,
      onu_mac: mac || "N/A",
      status: "active",
      expiry_date: exp.toISOString().split("T")[0],
      created_at: new Date().toISOString(),
      monthlyRecords: defaultRecords,
    };

    const updated = [newCust, ...customers];
    setCustomers(updated);
    saveStoredCustomers(updated);

    setName("");
    setPhone("");
    setAddress("");
    setMac("");
    setIsAddModalOpen(false);
  };

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchesVeng = selectedVeng === "all" || c.veng === selectedVeng;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesVeng && matchesStatus;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header with Bulk Add Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Customer Directory &amp; Ledger
            </h1>
            <p className="text-sm text-gray-500">
              Saiha broadband subscribers with Jan - Dec accounts ledger &amp; portal credentials.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsBulkModalOpen(true)}
              variant="outline"
              className="gap-1.5 shadow-sm border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <FileSpreadsheet className="h-4 w-4" /> Bulk Import (Excel/CSV)
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, phone, or ID (e.g. 003FNF001)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={selectedVeng}
                onChange={(e) => setSelectedVeng(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200"
              >
                <option value="all">All Vêngs (Saiha)</option>
                {SAIHA_VENGS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-900/60 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Customer &amp; ID</th>
                <th className="px-5 py-3.5">Phone &amp; Location</th>
                <th className="px-5 py-3.5">Plan &amp; Rate</th>
                <th className="px-5 py-3.5">2026 Billing (Jan - Dec)</th>
                <th className="px-5 py-3.5">Status &amp; Expiry</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.map((item) => {
                const days = daysUntilExpiry(item.expiry_date);
                const isExpiring = days <= 3 && days >= 0;
                const isExpired = days < 0;

                const paidMonthsCount = item.monthlyRecords?.filter((r) => r.status === "paid").length || 0;
                const dueMonthsCount = item.monthlyRecords?.filter((r) => r.status === "due").length || 0;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 transition">
                    <td className="px-5 py-4">
                      <button onClick={() => setActiveLedgerCustomer(item)} className="text-left group cursor-pointer">
                        <span className="font-mono text-xs font-bold text-blue-600 group-hover:underline block">
                          {item.id}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                          {item.name}
                        </span>
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-zinc-200 font-mono">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {item.phone}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {item.veng}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {formatINR(item.monthly_charge)}
                      </span>
                      <span className="text-xs text-gray-400 uppercase">
                        {item.plan_id.replace("fnf-", "")} Mbps
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 max-w-[220px]">
                        {item.monthlyRecords?.map((m) => (
                          <div
                            key={m.month}
                            title={`${m.month} 2026: ${m.status.toUpperCase()}`}
                            className={`h-5 w-4 rounded-sm flex items-center justify-center text-[9px] font-bold ${
                              m.status === "paid"
                                ? "bg-emerald-500 text-white"
                                : m.status === "due"
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-gray-100 dark:bg-zinc-800 text-gray-400"
                            }`}
                          >
                            {m.month[0]}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-500 mt-1 block">
                        {paidMonthsCount} Paid &bull; {dueMonthsCount > 0 ? `${dueMonthsCount} Due` : "No Dues"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isExpired ? (
                          <Badge variant="danger">Expired</Badge>
                        ) : isExpiring ? (
                          <Badge variant="warning">{days} Days Left</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 block mt-1">
                        {formatDate(item.expiry_date)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveLedgerCustomer(item)}
                          className="gap-1.5 text-xs h-8 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400"
                        >
                          <Receipt className="h-3.5 w-3.5" /> Ledger
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPasswordModalCustomer(item);
                            setNewPassword("");
                            setPasswordSuccess(false);
                          }}
                          className="gap-1 text-xs h-8 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400"
                          title="Reset Portal Password"
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Password
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BULK IMPORT MODAL */}
        <Modal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          title="Bulk Import Customers (Excel / CSV)"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
              <div className="text-xs">
                <span className="font-bold text-blue-900 dark:text-blue-200 block">Excel/CSV Format Template:</span>
                <span className="text-blue-700 dark:text-blue-400 text-[11px]">Download sample columns (Name, Phone, Veng, Speed, Password)</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleDownloadTemplate} className="gap-1 text-xs">
                <Download className="h-3.5 w-3.5" /> Template
              </Button>
            </div>

            <label className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-zinc-900/50 transition">
              <input type="file" accept=".csv, .txt, .xls, .xlsx" onChange={handleBulkFileChange} className="hidden" />
              <FileSpreadsheet className="h-8 w-8 text-emerald-500 mb-2" />
              <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
                Click to Upload Customer Excel / CSV File
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">Supports .csv, .xls exported from spreadsheets</span>
            </label>

            {parsedBulk.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  Preview: {parsedBulk.length} Customer(s) Ready to Import
                </span>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-zinc-800 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-zinc-800 p-2">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Phone</th>
                        <th className="p-2">Veng</th>
                        <th className="p-2">Plan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {parsedBulk.map((r, i) => (
                        <tr key={i}>
                          <td className="p-2 font-semibold">{r.name}</td>
                          <td className="p-2 font-mono">{r.phone}</td>
                          <td className="p-2">{r.veng}</td>
                          <td className="p-2 font-bold text-blue-600">{r.speed}M</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {bulkSuccessNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Customers bulk-imported and saved successfully!
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExecuteBulkImport}
                disabled={parsedBulk.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Import {parsedBulk.length > 0 ? `(${parsedBulk.length}) Customers` : ""}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Annual Accounts & Payment Ledger Modal */}
        <Modal
          isOpen={!!activeLedgerCustomer}
          onClose={() => setActiveLedgerCustomer(null)}
          title={`Annual Accounts Ledger: ${activeLedgerCustomer?.name} (${activeLedgerCustomer?.id})`}
          className="max-w-3xl"
        >
          {activeLedgerCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] uppercase font-semibold text-gray-400 block">Vêng</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{activeLedgerCustomer.veng}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase font-semibold text-gray-400 block">Monthly Rate</span>
                  <span className="text-sm font-bold text-blue-600">{formatINR(activeLedgerCustomer.monthly_charge)}/mo</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase font-semibold text-gray-400 block">Total Paid (2026)</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {formatINR(
                      activeLedgerCustomer.monthlyRecords
                        ?.filter((r) => r.status === "paid")
                        .reduce((sum, r) => sum + r.amount, 0) || 0
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] uppercase font-semibold text-gray-400 block">Outstanding Due</span>
                  <span className="text-sm font-bold text-red-600">
                    {formatINR(
                      activeLedgerCustomer.monthlyRecords
                        ?.filter((r) => r.status === "due")
                        .reduce((sum, r) => sum + r.amount, 0) || 0
                    )}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  2026 Monthly Payment Breakup (Jan - Dec)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {activeLedgerCustomer.monthlyRecords?.map((rec) => (
                    <div
                      key={rec.month}
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        rec.status === "paid"
                          ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/20"
                          : rec.status === "due"
                          ? "border-red-200 dark:border-red-800/60 bg-red-50/40 dark:bg-red-950/20"
                          : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{rec.month} 2026</span>
                        {rec.status === "paid" ? (
                          <Badge variant="success" className="h-5 px-1.5 text-[10px]">Paid</Badge>
                        ) : rec.status === "due" ? (
                          <Badge variant="danger" className="h-5 px-1.5 text-[10px]">Due</Badge>
                        ) : (
                          <span className="text-[10px] text-gray-400">Upcoming</span>
                        )}
                      </div>

                      <div className="mt-2 text-xs">
                        <span className="font-semibold text-gray-800 dark:text-zinc-200 block">
                          {formatINR(rec.amount)}
                        </span>
                        {rec.status === "paid" ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block truncate">
                            {rec.paidDate}
                          </span>
                        ) : rec.status === "due" ? (
                          <button
                            onClick={() => handlePaySpecificMonth(rec.month)}
                            className="mt-1 w-full py-1 text-[11px] font-semibold rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1 transition"
                          >
                            <CreditCard className="h-3 w-3" /> Pay Now
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 block">Next cycle</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-zinc-800">
                <Button variant="outline" onClick={() => setActiveLedgerCustomer(null)}>
                  Close Ledger
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Change Password Modal */}
        <Modal
          isOpen={!!passwordModalCustomer}
          onClose={() => setPasswordModalCustomer(null)}
          title={`Reset Portal Password: ${passwordModalCustomer?.name} (${passwordModalCustomer?.id})`}
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/60 text-xs space-y-1">
              <p><span className="text-gray-400">Mobile:</span> <span className="font-mono font-semibold">{passwordModalCustomer?.phone}</span></p>
              <p><span className="text-gray-400">Current Password:</span> <span className="font-mono font-bold text-blue-600">{passwordModalCustomer?.password}</span></p>
            </div>

            <Input
              label="New Password"
              placeholder="e.g. saiha2026 or new secret"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            {passwordSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Password thlak fel a ni e!
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setPasswordModalCustomer(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-amber-600 hover:bg-amber-700">
                Update Password
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Customer Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Saiha Customer"
        >
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Lalmuanpuia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Initial Portal Password"
              placeholder="e.g. password123"
              value={custPass}
              onChange={(e) => setCustPass(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                Saiha Vêng (Locality)
              </label>
              <select
                value={veng}
                onChange={(e) => setVeng(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm"
              >
                {SAIHA_VENGS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Address Landmark / Detail"
              placeholder="e.g. Near Community Hall, House No. 12"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                Internet Plan
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm"
              >
                {INTERNET_PLANS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatINR(p.price)}/mo
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save &amp; Generate ID
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
