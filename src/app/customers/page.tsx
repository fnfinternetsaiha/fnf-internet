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
  KeyRound,
  Trash2,
  Edit,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Lock,
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
  CustomerUser,
} from "@/lib/services/customer-store";
import { getLoggedInStaff } from "@/lib/services/staff-auth";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<CustomerUser[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedVeng, setSelectedVeng] = React.useState("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);

  // Security Protected Action Modals
  const [deleteTargetCustomer, setDeleteTargetCustomer] = React.useState<CustomerUser | null>(null);
  const [editTargetCustomer, setEditTargetCustomer] = React.useState<CustomerUser | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = React.useState("");
  const [securityError, setSecurityError] = React.useState("");

  // Edit fields
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editVeng, setEditVeng] = React.useState("");
  const [editPlanId, setEditPlanId] = React.useState("");

  // Add Form state
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [veng, setVeng] = React.useState<string>(SAIHA_VENGS[0]);
  const [address, setAddress] = React.useState("");
  const [planId, setPlanId] = React.useState(INTERNET_PLANS[0].id);

  const loadData = () => {
    setCustomers(getStoredCustomers());
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Secure Delete with Admin Password Check
  const handleExecuteDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError("");

    const currentStaff = getLoggedInStaff();
    // Verify against current staff password or admin password
    const isAuthorized =
      adminPasswordInput === "admin123" ||
      (currentStaff && currentStaff.password === adminPasswordInput.trim());

    if (!isAuthorized) {
      setSecurityError("Admin password a dik lo! Delete theih a ni lo.");
      return;
    }

    if (!deleteTargetCustomer) return;

    const filtered = customers.filter((c) => c.id !== deleteTargetCustomer.id);
    setCustomers(filtered);
    saveStoredCustomers(filtered);

    setDeleteTargetCustomer(null);
    setAdminPasswordInput("");
  };

  // Secure Edit with Admin Password Check
  const handleExecuteEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError("");

    const currentStaff = getLoggedInStaff();
    const isAuthorized =
      adminPasswordInput === "admin123" ||
      (currentStaff && currentStaff.password === adminPasswordInput.trim());

    if (!isAuthorized) {
      setSecurityError("Admin password a dik lo! Save theih a ni lo.");
      return;
    }

    if (!editTargetCustomer) return;

    const plan = INTERNET_PLANS.find((p) => p.id === editPlanId) || INTERNET_PLANS[0];
    const updated = customers.map((c) => {
      if (c.id === editTargetCustomer.id) {
        return {
          ...c,
          name: editName,
          phone: editPhone,
          veng: editVeng,
          plan_id: plan.id,
          monthly_charge: plan.price,
        };
      }
      return c;
    });

    setCustomers(updated);
    saveStoredCustomers(updated);

    setEditTargetCustomer(null);
    setAdminPasswordInput("");
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = INTERNET_PLANS.find((p) => p.id === planId) || INTERNET_PLANS[0];
    const newId = generateCustomerId(customers.length);
    const exp = new Date();
    exp.setDate(exp.getDate() + 30);

    const defaultRecords = MONTHS.map((m, idx) => ({
      month: m,
      status: (idx === new Date().getMonth() ? "paid" : "upcoming") as "paid" | "upcoming",
      amount: plan.price,
      paidDate: idx === new Date().getMonth() ? "Today" : undefined,
    }));

    const newCust: CustomerUser = {
      id: newId,
      name,
      phone,
      password: "password123",
      veng,
      address_detail: address,
      plan_id: plan.id,
      monthly_charge: plan.price,
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
    setIsAddModalOpen(false);
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Customer Directory &amp; Security Controls
            </h1>
            <p className="text-sm text-gray-500">
              Manage Saiha subscribers. Edit and delete actions strictly require Admin Password confirmation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-900/60 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Customer &amp; ID</th>
                <th className="px-5 py-3.5">Phone &amp; Location</th>
                <th className="px-5 py-3.5">Plan &amp; Rate</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Protected Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-bold text-blue-600 block">{item.id}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-gray-800 dark:text-zinc-200 font-mono">{item.phone}</p>
                    <p className="text-xs text-gray-500">{item.veng}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-gray-900 dark:text-white block">{formatINR(item.monthly_charge)}</span>
                    <span className="text-xs text-gray-400 uppercase">{item.plan_id.replace("fnf-", "")} Mbps</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={item.status === "active" ? "success" : "danger"}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditTargetCustomer(item);
                          setEditName(item.name);
                          setEditPhone(item.phone);
                          setEditVeng(item.veng);
                          setEditPlanId(item.plan_id);
                          setAdminPasswordInput("");
                          setSecurityError("");
                        }}
                        className="text-xs h-8 border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDeleteTargetCustomer(item);
                          setAdminPasswordInput("");
                          setSecurityError("");
                        }}
                        className="text-xs h-8 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 1. ADMIN PASSWORD PROTECTED DELETE MODAL */}
        <Modal
          isOpen={!!deleteTargetCustomer}
          onClose={() => setDeleteTargetCustomer(null)}
          title="Security Confirmation: Delete Customer"
        >
          <form onSubmit={handleExecuteDelete} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="h-4 w-4" /> Customer hi delete hlen i duh chiang maw?
              </p>
              <p>Customer: <strong>{deleteTargetCustomer?.name}</strong> ({deleteTargetCustomer?.id})</p>
              <p className="text-[11px] text-red-400">He thil ti tur hian Admin Password chhut luh kher a ngai a ni.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Enter Admin Password to Authorize Delete *
              </label>
              <input
                type="password"
                placeholder="Enter your Admin password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                required
              />
            </div>

            {securityError && (
              <p className="text-xs text-red-400 font-semibold">&times; {securityError}</p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setDeleteTargetCustomer(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-red-600 hover:bg-red-700 text-white">
                Confirm &amp; Delete
              </Button>
            </div>
          </form>
        </Modal>

        {/* 2. ADMIN PASSWORD PROTECTED EDIT MODAL */}
        <Modal
          isOpen={!!editTargetCustomer}
          onClose={() => setEditTargetCustomer(null)}
          title={`Edit Customer: ${editTargetCustomer?.id}`}
        >
          <form onSubmit={handleExecuteEdit} className="space-y-3.5">
            <Input label="Customer Name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            <Input label="Phone Number" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">Vêng</label>
              <select
                value={editVeng}
                onChange={(e) => setEditVeng(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs"
              >
                {SAIHA_VENGS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">Broadband Plan</label>
              <select
                value={editPlanId}
                onChange={(e) => setEditPlanId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs"
              >
                {INTERNET_PLANS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatINR(p.price)})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Admin Password (Authorization Required) *
              </label>
              <input
                type="password"
                placeholder="Enter Admin password to save changes"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {securityError && (
              <p className="text-xs text-red-400 font-semibold">&times; {securityError}</p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setEditTargetCustomer(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Customer Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Customer">
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <div>
              <label className="block text-xs font-semibold mb-1">Vêng</label>
              <select value={veng} onChange={(e) => setVeng(e.target.value)} className="w-full rounded-lg border p-2 text-xs bg-slate-900">
                {SAIHA_VENGS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="submit" variant="primary">
                Save Customer
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
