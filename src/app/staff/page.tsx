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
  Sliders,
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
  updateStaffPermissions,
  addStaffAccount,
  deleteStaffAccount,
  StaffAccount,
  StaffPermissions,
  DEFAULT_ROLE_PERMISSIONS,
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

  // Edit Permissions Modal
  const [permsModalStaff, setPermsModalStaff] = React.useState<StaffAccount | null>(null);
  const [editablePerms, setEditablePerms] = React.useState<StaffPermissions>({
    can_manage_customers: true,
    can_approve_payments: true,
    can_track_complaints: true,
    can_view_finance: false,
    can_manage_recharge: true,
    can_manage_staff: false,
  });

  // Add Form state
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("desk_manager");
  const [newPerms, setNewPerms] = React.useState<StaffPermissions>(DEFAULT_ROLE_PERMISSIONS.desk_manager);

  const refreshStaff = () => {
    setStaffList(getStoredStaff());
    setCurrentUser(getLoggedInStaff());
  };

  React.useEffect(() => {
    refreshStaff();
  }, []);

  // When role changes in add modal, auto-populate recommended permissions
  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setNewPerms(DEFAULT_ROLE_PERMISSIONS[selectedRole] || DEFAULT_ROLE_PERMISSIONS.desk_manager);
  };

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
      permissions: newPerms,
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

  // Handle Permissions Update
  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permsModalStaff) return;

    updateStaffPermissions(permsModalStaff.id, editablePerms);
    setPermsModalStaff(null);
    refreshStaff();
  };

  const isSuperAdmin = currentUser?.role === "super_admin" || currentUser?.permissions?.can_manage_staff;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Staff &amp; Role Permissions
            </h1>
            <p className="text-sm text-gray-500">
              Manage NOC staff members, assign custom granular permissions (Finance, Complaints, Approvals, Customers).
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
                <th className="px-5 py-3.5">Staff &amp; ID</th>
                <th className="px-5 py-3.5">Username &amp; Phone</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Assigned Permissions</th>
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
                    <span className="block font-semibold">{staff.username}</span>
                    <span className="text-[11px] text-gray-500">{staff.phone}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={staff.role === "super_admin" ? "danger" : staff.role === "desk_manager" ? "primary" : "neutral"}>
                      {staff.role.replace("_", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {staff.permissions?.can_view_finance && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Finance
                        </span>
                      )}
                      {staff.permissions?.can_track_complaints && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Complaints
                        </span>
                      )}
                      {staff.permissions?.can_approve_payments && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Payments
                        </span>
                      )}
                      {staff.permissions?.can_manage_customers && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Customers
                        </span>
                      )}
                      {staff.permissions?.can_manage_recharge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Recharge
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={staff.is_active ? "success" : "danger"}>
                      {staff.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit Permissions Button */}
                      {isSuperAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPermsModalStaff(staff);
                            setEditablePerms(staff.permissions || DEFAULT_ROLE_PERMISSIONS.desk_manager);
                          }}
                          className="text-xs h-8 border-indigo-400 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 gap-1"
                          title="Custom Permissions"
                        >
                          <Sliders className="h-3 w-3" /> Permissions
                        </Button>
                      )}

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
                          <KeyRound className="h-3 w-3" /> Password
                        </Button>
                      )}

                      {/* Delete Staff Button */}
                      {isSuperAdmin && currentUser?.id !== staff.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStaff(staff)}
                          className="text-xs h-8 text-red-600 border-red-300 hover:bg-red-50 dark:border-red-900 dark:text-red-400 gap-1"
                          title="Delete staff"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 1. CREATE STAFF MODAL WITH PERMISSION CHECKBOXES */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Staff Account &amp; Assign Permissions"
          className="max-w-lg"
        >
          <form onSubmit={handleAddStaff} className="space-y-4">
            <Input
              label="Staff Full Name"
              placeholder="e.g. John Lalhmingthanga"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <Input
              label="Initial Password"
              placeholder="e.g. strongpassword123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-zinc-400 mb-1">
                Base Role Preset
              </label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-900 dark:text-white"
              >
                <option value="desk_manager">Desk Manager</option>
                <option value="technician">Field Technician</option>
                <option value="accountant">Accountant</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            {/* Granular Permission Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Custom Permission Checkboxes:
              </label>
              <div className="space-y-2 bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPerms.can_view_finance}
                    onChange={(e) => setNewPerms({ ...newPerms, can_view_finance: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">View Finance &amp; Cashbook</span>
                    <span className="text-[11px] text-gray-500">Can view company revenue, cashbook expenses &amp; Google Drive backup</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPerms.can_track_complaints}
                    onChange={(e) => setNewPerms({ ...newPerms, can_track_complaints: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">Track &amp; Resolve Complaints</span>
                    <span className="text-[11px] text-gray-500">Can view LOS red blinking lights, fiber cuts, and resolve tickets</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPerms.can_approve_payments}
                    onChange={(e) => setNewPerms({ ...newPerms, can_approve_payments: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">Verify &amp; Approve Payments</span>
                    <span className="text-[11px] text-gray-500">Can approve Google Pay proofs and reconcile with Bank Statement</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPerms.can_manage_customers}
                    onChange={(e) => setNewPerms({ ...newPerms, can_manage_customers: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">Manage Customers &amp; Ledger</span>
                    <span className="text-[11px] text-gray-500">Can register subscribers, bulk import Excel, and reset customer passwords</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPerms.can_manage_recharge}
                    onChange={(e) => setNewPerms({ ...newPerms, can_manage_recharge: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">Process Recharge Queue</span>
                    <span className="text-[11px] text-gray-500">Can activate ISP top-up queue</span>
                  </div>
                </label>
              </div>
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

        {/* 2. EDIT PERMISSIONS MODAL */}
        <Modal
          isOpen={!!permsModalStaff}
          onClose={() => setPermsModalStaff(null)}
          title={`Edit Permissions: ${permsModalStaff?.name} (${permsModalStaff?.username})`}
        >
          <form onSubmit={handleSavePermissions} className="space-y-4">
            <p className="text-xs text-gray-500">
              Toggle specific access checkboxes for this staff member.
            </p>

            <div className="space-y-2.5 bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editablePerms.can_view_finance}
                  onChange={(e) => setEditablePerms({ ...editablePerms, can_view_finance: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="font-semibold text-gray-900 dark:text-white">View Finance &amp; Cashbook (Sum dinhmun &amp; Drive Backup)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editablePerms.can_track_complaints}
                  onChange={(e) => setEditablePerms({ ...editablePerms, can_track_complaints: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="font-semibold text-gray-900 dark:text-white">Track Complaints &amp; LOS (Fiber repair tickets)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editablePerms.can_approve_payments}
                  onChange={(e) => setEditablePerms({ ...editablePerms, can_approve_payments: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="font-semibold text-gray-900 dark:text-white">Verify Payments &amp; Bank Reconcile</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editablePerms.can_manage_customers}
                  onChange={(e) => setEditablePerms({ ...editablePerms, can_manage_customers: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="font-semibold text-gray-900 dark:text-white">Manage Customers &amp; Ledger (Excel Import)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editablePerms.can_manage_recharge}
                  onChange={(e) => setEditablePerms({ ...editablePerms, can_manage_recharge: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="font-semibold text-gray-900 dark:text-white">Process Recharge Queue</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setPermsModalStaff(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
                Save Permissions
              </Button>
            </div>
          </form>
        </Modal>

        {/* 3. CHANGE PASSWORD MODAL */}
        <Modal
          isOpen={!!passwordModalStaff}
          onClose={() => setPasswordModalStaff(null)}
          title={`Change Password: ${passwordModalStaff?.name}`}
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="New Password"
              placeholder="e.g. newpassword2026"
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
      </div>
    </DashboardShell>
  );
}
