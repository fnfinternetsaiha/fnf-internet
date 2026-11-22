"use client";

import * as React from "react";
import {
  UserCheck,
  ShieldCheck,
  Plus,
  Search,
  Phone,
  MapPin,
  Shield,
  UserX,
  CheckCircle2,
  Wrench,
  BookOpen,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SAIHA_VENGS } from "@/lib/constants/vêng";
import { formatDate } from "@/lib/utils/format";
import { StaffUser, UserRole } from "@/types";

const INITIAL_STAFF: StaffUser[] = [
  {
    id: "STF-01",
    name: "K. Lalrammawia",
    phone: "9862001122",
    role: "super_admin",
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "STF-02",
    name: "Beiratha Chozah",
    phone: "9436159870",
    role: "desk_manager",
    is_active: true,
    created_at: "2024-01-15",
  },
  {
    id: "STF-03",
    name: "Lalmuanpuia Hlychho",
    phone: "8974521190",
    role: "technician",
    is_active: true,
    assigned_veng: ["College Veng", "Meisatla", "Council Veng"],
    created_at: "2024-02-01",
  },
  {
    id: "STF-04",
    name: "V.L. Hruaia",
    phone: "9862309112",
    role: "technician",
    is_active: true,
    assigned_veng: ["New Saiha East", "New Saiha West", "Siahatla I"],
    created_at: "2024-02-15",
  },
  {
    id: "STF-05",
    name: "C. Zairemmawia",
    phone: "9862998877",
    role: "accountant",
    is_active: true,
    created_at: "2024-03-01",
  },
];

export default function StaffPage() {
  const [staffList, setStaffList] = React.useState<StaffUser[]>(INITIAL_STAFF);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // New Staff Form state
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("technician");
  const [assignedVeng, setAssignedVeng] = React.useState<string[]>([SAIHA_VENGS[0]]);

  const toggleStatus = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: StaffUser = {
      id: `STF-0${staffList.length + 1}`,
      name,
      phone,
      role,
      is_active: true,
      assigned_veng: role === "technician" ? assignedVeng : undefined,
      created_at: new Date().toISOString().split("T")[0],
    };

    setStaffList([...staffList, newStaff]);
    setName("");
    setPhone("");
    setRole("technician");
    setIsModalOpen(false);
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case "super_admin":
        return <Badge variant="danger" className="gap-1"><Shield className="h-3 w-3" /> Super Admin</Badge>;
      case "desk_manager":
        return <Badge variant="info" className="gap-1"><ShieldCheck className="h-3 w-3" /> Desk Manager</Badge>;
      case "technician":
        return <Badge variant="warning" className="gap-1"><Wrench className="h-3 w-3" /> Field Tech</Badge>;
      case "accountant":
        return <Badge variant="success" className="gap-1"><BookOpen className="h-3 w-3" /> Accountant</Badge>;
    }
  };

  const filtered = staffList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.id.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "all" || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Staff &amp; Role Access Control
            </h1>
            <p className="text-sm text-gray-500">
              Manage FNF Saiha branch operators, technicians, and veng assignments.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Add Staff Member
          </Button>
        </div>

        {/* 4 Role Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">Super Admins</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {staffList.filter((s) => s.role === "super_admin").length}
              </div>
              <p className="text-xs text-gray-400 mt-1">Full control</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">Desk Managers</CardTitle>
              <ShieldCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {staffList.filter((s) => s.role === "desk_manager").length}
              </div>
              <p className="text-xs text-gray-400 mt-1">Operations &amp; verify</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">Field Techs</CardTitle>
              <Wrench className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {staffList.filter((s) => s.role === "technician").length}
              </div>
              <p className="text-xs text-gray-400 mt-1">Saiha fiber repairs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">Accountants</CardTitle>
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {staffList.filter((s) => s.role === "accountant").length}
              </div>
              <p className="text-xs text-gray-400 mt-1">Cashbook &amp; audit</p>
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
                placeholder="Search staff name, phone, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="desk_manager">Desk Manager</option>
                <option value="technician">Field Technician</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-900/60 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Staff ID &amp; Name</th>
                <th className="px-5 py-3.5">Phone Number</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Assigned Vêng Coverage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 transition">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-bold text-gray-400 block">{item.id}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                  </td>

                  <td className="px-5 py-4 text-gray-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5 font-mono text-xs">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {item.phone}
                    </span>
                  </td>

                  <td className="px-5 py-4">{getRoleBadge(item.role)}</td>

                  <td className="px-5 py-4">
                    {item.assigned_veng && item.assigned_veng.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.assigned_veng.map((v) => (
                          <span
                            key={v}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                          >
                            <MapPin className="h-2.5 w-2.5 text-blue-500" />
                            {v}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Entire Saiha Branch</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    {item.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Suspended</Badge>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      size="sm"
                      variant={item.is_active ? "outline" : "primary"}
                      onClick={() => toggleStatus(item.id)}
                      className="h-8 text-xs"
                    >
                      {item.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              Staff hmuh a ni lo.
            </div>
          )}
        </div>

        {/* Add Staff Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Saiha Branch Staff"
        >
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <Input
              label="Staff Full Name"
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
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                Staff Role &amp; Access Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm"
              >
                <option value="technician">Field Technician</option>
                <option value="desk_manager">Desk Manager</option>
                <option value="accountant">Accountant</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {role === "technician" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                  Assigned Primary Saiha Vêng
                </label>
                <select
                  onChange={(e) => setAssignedVeng([e.target.value])}
                  className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm"
                >
                  {SAIHA_VENGS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Staff Member
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
