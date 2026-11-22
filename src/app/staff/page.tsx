"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  KeyRound,
  Trash2,
  ShieldCheck,
  Lock,
  Check,
  AlertCircle,
  Phone,
  Shield,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  getStoredStaff,
  getLoggedInStaff,
  updateStaffPassword,
  addStaffAccount,
  deleteStaffAccount,
  StaffAccount,
} from "@/lib/services/staff-auth";
import { UserRole } from "@/types";

export default function StaffPage() {
  const [staffList, setStaffList] = React.useState<StaffAccount[]>([]);
  const [currentUser, setCurrentUser] = React.useState<StaffAccount | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [passwordModalStaff, setPasswordModalStaff] = React.useState<StaffAccount | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [passwordNotice, setPasswordNotice] = React.useState(false);

  // Add Form state
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("desk_manager");

  const refreshStaff = () => {
    setStaffList(getStoredStaff());
    setCurrentUser(getLoggedInStaff());
  };

  React.useEffect(() => {
    refreshStaff();
  }, []);

  // Handle Add New Staff
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;

    addStaffAccount({
      name,
      username: username.toLowerCase().trim(),
      phone: phone.trim() || "N/A",
      password: password.trim(),
      role,
      is_active: true,
    });

    setName("");
    setUsername("");
    setPhone("");
    setPassword("");
    setIsAddModalOpen(false);
    refreshStaff();
  };

  // Handle Delete Staff
  const handleDeleteStaff = (staff: StaffAccount) => {
    if (confirm(`I chiang maw? Staff "${staff.name}" (${staff.username}) hi delete i duh em?`)) {
      deleteStaffAccount(staff.id);
      refreshStaff();
    }
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalStaff || !newPassword.trim()) return;

    updateStaffPassword(passwordModalStaff.id, newPassword.trim());
    setPasswordNotice(true);
    setTimeout(() => {
      setPasswordNotice(false);
      setPasswordModalStaff(null);
      setNewPassword("");
      refreshStaff();
    }, 1200);
  };

  const isSuperAdmin = currentUser?.role === "super_admin";

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Staff &amp; Role Permissions
            </h1>
            <p className="text-sm text-gray-500">
              Manage NOC staff members, assign role permissions, reset passwords, and revoke access.
            </p>
          </div>
          {isSuperAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4" /> Add New Staff
            </Button>
          )}
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-900 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Staff Name &amp; ID</th>
                <th className="px-5 py-3.5">Login Username</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5">Role Permission</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-bold text-blue-600 block">{staff.id}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{staff.name}</span>
                    {currentUser?.id === staff.id && (
                      <span className="text-[10px] text-blue-500 font-bold block">(You)</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-800 dark:text-zinc-200">
                    {staff.username}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600 dark:text-zinc-400">
                    {staff.phone}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={staff.role === "super_admin" ? "danger" : staff.role === "desk_manager" ? "primary" : "neutral"}>
                      {staff.role.replace("_", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={staff.is_active ? "success" : "danger"}>
                      {staff.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Change Password Button */}
                      {(isSuperAdmin || currentUser?.id === staff.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPasswordModalStaff(staff);
                            setNewPassword("");
                            setPasswordNotice(false);
                          }}
                          className="text-xs h-8 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 gap-1"
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Password
                        </Button>
                      )}

                      {/* Delete Staff Button (Super Admin Only) */}
                      {isSuperAdmin && currentUser?.id !== staff.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStaff(staff)}
                          className="text-xs h-8 text-red-600 border-red-300 hover:bg-red-50 dark:border-red-900 dark:text-red-400 gap-1"
                          title="Delete staff account"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Change Password Modal */}
        <Modal
          isOpen={!!passwordModalStaff}
          onClose={() => setPasswordModalStaff(null)}
          title={`Change Password: ${passwordModalStaff?.name} (${passwordModalStaff?.username})`}
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <p className="text-xs text-gray-500">
              Enter a new secret password for this staff member.
            </p>

            <Input
              label="New Password"
              placeholder="e.g. secretpassword2026"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            {passwordNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Password updated successfully!
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setPasswordModalStaff(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-amber-600 hover:bg-amber-700">
                Update Password
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Staff Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Staff Account"
        >
          <form onSubmit={handleAddStaff} className="space-y-4">
            <Input
              label="Staff Full Name"
              placeholder="e.g. John Lalhmingthanga"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Login Username"
              placeholder="e.g. john_noc"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="e.g. 9862000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Initial Password"
              placeholder="e.g. strongpassword123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                Role Permission
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="desk_manager">Desk Manager (Verify payments, add customers, complaints)</option>
                <option value="technician">Field Technician (LOS tickets, network faults)</option>
                <option value="accountant">Accountant (Cashbook &amp; Financials)</option>
                <option value="super_admin">Super Admin (Full administrative access &amp; staff control)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700">
                Create Staff Account
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
