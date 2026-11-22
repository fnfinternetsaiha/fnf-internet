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
  const [activeLedgerCustomer, setActiveLedgerCustomer] = React.useState<CustomerUser | null>(null);
  const [passwordModalCustomer, setPasswordModalCustomer] = React.useState<CustomerUser | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);

  // New Customer Form State
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [veng, setVeng] = React.useState(SAIHA_VENGS[0]);
  const [address, setAddress] = React.useState("");
  const [planId, setPlanId] = React.useState(INTERNET_PLANS[0].id);
  const [mac, setMac] = React.useState("");
  const [custPass, setCustPass] = React.useState("password123");

  // Load customers from shared store
  React.useEffect(() => {
    setCustomers(getStoredCustomers());
  }, []);

  // Pay specific month from Ledger
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

  // Change Password
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

  // Add Customer
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
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Customer Directory &amp; Ledger
            </h1>
            <p className="text-sm text-gray-500">
              Saiha broadband subscribers with Jan - Dec accounts ledger &amp; portal credentials.
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Add New Customer
          </Button>
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
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

        {/* Customer Table with Jan-Dec Mini Bar & Both Action Buttons */}
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
                      <button
                        onClick={() => setActiveLedgerCustomer(item)}
                        className="text-left group"
                      >
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

                    {/* Jan - Dec Mini Heatmap Status */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 max-w-[220px]">
                        {item.monthlyRecords?.map((m) => (
                          <div
                            key={m.month}
                            title={`${m.month} 2026: ${m.status.toUpperCase()}${m.paidDate ? ` (${m.paidDate})` : ""}`}
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

                    {/* Action Buttons: View Ledger + Change Password */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveLedgerCustomer(item)}
                          className="gap-1.5 text-xs h-8 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400"
                        >
                          <Receipt className="h-3.5 w-3.5" /> View Ledger
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

        {/* 1. Full Jan-Dec Annual Accounts & Payment Ledger Modal */}
        <Modal
          isOpen={!!activeLedgerCustomer}
          onClose={() => setActiveLedgerCustomer(null)}
          title={`Annual Accounts Ledger: ${activeLedgerCustomer?.name} (${activeLedgerCustomer?.id})`}
          className="max-w-3xl"
        >
          {activeLedgerCustomer && (
            <div className="space-y-6">
              {/* Financial Profile Header */}
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

              {/* 12-Month Jan-Dec Grid */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  2026 Monthly Payment Breakup (Jan - Dec)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {activeLedgerCustomer.monthlyRecords?.map((rec) => (
                    <div
                      key={rec.month}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
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

        {/* 2. Change Password Modal */}
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
                <Check className="h-4 w-4" /> Password thlak fel a ni e! Customer khan a hmang thei nghal ang.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setPasswordModalCustomer(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-amber-600 hover:bg-amber-700">
                Update &amp; Save Password
              </Button>
            </div>
          </form>
        </Modal>

        {/* 3. Add Customer Modal */}
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
            <Input
              label="ONU MAC Address (Optional)"
              placeholder="e.g. 48:57:02:AA:BB:CC"
              value={mac}
              onChange={(e) => setMac(e.target.value)}
            />

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
