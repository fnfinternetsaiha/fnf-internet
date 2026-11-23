import { StaffUser, UserRole } from "@/types";

export interface StaffPermissions {
  can_manage_customers: boolean;
  can_approve_payments: boolean;
  can_track_complaints: boolean;
  can_view_finance: boolean;
  can_manage_recharge: boolean;
  can_manage_staff: boolean;
}

export interface StaffAccount extends StaffUser {
  username: string;
  password: string;
  permissions: StaffPermissions;
}

interface StaffSession {
  user: StaffAccount;
  lastActive: number;
}

export const ALL_PERMISSIONS: StaffPermissions = {
  can_manage_customers: true,
  can_approve_payments: true,
  can_track_complaints: true,
  can_view_finance: true,
  can_manage_recharge: true,
  can_manage_staff: true,
};

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, StaffPermissions> = {
  super_admin: ALL_PERMISSIONS,
  desk_manager: {
    can_manage_customers: true,
    can_approve_payments: true,
    can_track_complaints: true,
    can_view_finance: false,
    can_manage_recharge: true,
    can_manage_staff: false,
  },
  technician: {
    can_manage_customers: true,
    can_approve_payments: false,
    can_track_complaints: true,
    can_view_finance: false,
    can_manage_recharge: false,
    can_manage_staff: false,
  },
  accountant: {
    can_manage_customers: false,
    can_approve_payments: true,
    can_track_complaints: false,
    can_view_finance: true,
    can_manage_recharge: false,
    can_manage_staff: false,
  },
};

const DEFAULT_STAFF: StaffAccount[] = [
  {
    id: "STF-001",
    name: "Super Administrator",
    username: "admin",
    phone: "9862001122",
    password: "admin123",
    role: "super_admin",
    is_active: true,
    permissions: ALL_PERMISSIONS,
    created_at: new Date().toISOString(),
  },
  {
    id: "STF-002",
    name: "Desk Manager",
    username: "manager",
    phone: "9862001123",
    password: "manager123",
    role: "desk_manager",
    is_active: true,
    permissions: DEFAULT_ROLE_PERMISSIONS.desk_manager,
    created_at: new Date().toISOString(),
  },
  {
    id: "STF-003",
    name: "Field Technician",
    username: "tech",
    phone: "9862001124",
    password: "tech123",
    role: "technician",
    is_active: true,
    permissions: DEFAULT_ROLE_PERMISSIONS.technician,
    created_at: new Date().toISOString(),
  },
];

const STAFF_KEY = "fnf_saiha_staff_accounts_v5";
// SESSION STORAGE KEY: Auto-wiped immediately when browser tab is closed!
const SESSION_KEY = "fnf_saiha_session_tab_v5";

export function getStoredStaff(): StaffAccount[] {
  if (typeof window === "undefined") return DEFAULT_STAFF;
  const data = localStorage.getItem(STAFF_KEY);
  if (!data) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(DEFAULT_STAFF));
    return DEFAULT_STAFF;
  }
  try {
    const list: StaffAccount[] = JSON.parse(data);
    return list.map((s) => ({
      ...s,
      permissions: s.permissions || DEFAULT_ROLE_PERMISSIONS[s.role] || ALL_PERMISSIONS,
    }));
  } catch {
    return DEFAULT_STAFF;
  }
}

export function saveStoredStaff(list: StaffAccount[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STAFF_KEY, JSON.stringify(list));
  }
}

export function authenticateAdmin(usernameOrPhone: string, pass: string): { success: boolean; user?: StaffAccount; error?: string } {
  const staff = getStoredStaff();
  const cleanInput = usernameOrPhone.trim().toLowerCase();
  const cleanPass = pass.trim();

  const user = staff.find(
    (s) =>
      (s.username.toLowerCase() === cleanInput || s.phone === cleanInput) &&
      s.password === cleanPass &&
      s.is_active
  );

  if (!user) {
    return { success: false, error: "Username emaw password a dik lo." };
  }

  if (user.role !== "super_admin") {
    return { success: false, error: "Access Denied: Super Admin account chauh luh theihna a ni." };
  }

  setLoggedInStaff(user);
  return { success: true, user };
}

export function authenticateStaff(usernameOrPhone: string, pass: string): { success: boolean; user?: StaffAccount; error?: string } {
  const staff = getStoredStaff();
  const cleanInput = usernameOrPhone.trim().toLowerCase();
  const cleanPass = pass.trim();

  const user = staff.find(
    (s) =>
      (s.username.toLowerCase() === cleanInput || s.phone === cleanInput) &&
      s.password === cleanPass &&
      s.is_active
  );

  if (!user) {
    return { success: false, error: "Staff username emaw password a dik lo." };
  }

  setLoggedInStaff(user);
  return { success: true, user };
}

// Session is in sessionStorage: Auto destroyed when tab is closed!
export function getLoggedInStaff(): StaffAccount | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session: StaffSession = JSON.parse(raw);
    return session.user;
  } catch {
    logoutStaff();
    return null;
  }
}

export function setLoggedInStaff(user: StaffAccount | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    const session: StaffSession = {
      user,
      lastActive: Date.now(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    logoutStaff();
  }
}

export function logoutStaff(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("fnf_saiha_logged_in_staff");
  localStorage.removeItem("fnf_saiha_staff_session_v4");
  localStorage.removeItem("fnf_saiha_staff_session_v3");
}

export function updateStaffPassword(staffId: string, newPass: string): boolean {
  const staff = getStoredStaff();
  const updated = staff.map((s) => (s.id === staffId ? { ...s, password: newPass.trim() } : s));
  saveStoredStaff(updated);
  return true;
}

export function updateStaffPermissions(staffId: string, perms: StaffPermissions): boolean {
  const staff = getStoredStaff();
  const updated = staff.map((s) => (s.id === staffId ? { ...s, permissions: perms } : s));
  saveStoredStaff(updated);
  return true;
}

export function addStaffAccount(newStaff: Omit<StaffAccount, "id" | "created_at">): StaffAccount {
  const staff = getStoredStaff();
  const id = `STF-${(staff.length + 1).toString().padStart(3, "0")}`;
  const account: StaffAccount = {
    ...newStaff,
    id,
    created_at: new Date().toISOString(),
  };
  saveStoredStaff([account, ...staff]);
  return account;
}

export function deleteStaffAccount(staffId: string): boolean {
  const staff = getStoredStaff();
  const toDelete = staff.find((s) => s.id === staffId);
  if (toDelete?.role === "super_admin" && staff.filter((s) => s.role === "super_admin").length <= 1) {
    alert("Super Admin hnuhnung ber hi a delete theih loh!");
    return false;
  }
  const filtered = staff.filter((s) => s.id !== staffId);
  saveStoredStaff(filtered);
  return true;
}
