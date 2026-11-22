import { StaffUser, UserRole } from "@/types";

export interface StaffAccount extends StaffUser {
  username: string;
  password: string;
}

const DEFAULT_STAFF: StaffAccount[] = [
  {
    id: "STF-001",
    name: "Super Administrator",
    username: "admin",
    phone: "9862001122",
    password: "admin123", // Admin page atangin thlak theih nghal a ni
    role: "super_admin",
    is_active: true,
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
    assigned_veng: ["College Veng", "New Saiha West", "Meisatla"],
    created_at: new Date().toISOString(),
  },
];

const STAFF_KEY = "fnf_saiha_staff_accounts_v2";
const STAFF_SESSION_KEY = "fnf_saiha_logged_in_staff";

export function getStoredStaff(): StaffAccount[] {
  if (typeof window === "undefined") return DEFAULT_STAFF;
  const data = localStorage.getItem(STAFF_KEY);
  if (!data) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(DEFAULT_STAFF));
    return DEFAULT_STAFF;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_STAFF;
  }
}

export function saveStoredStaff(list: StaffAccount[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STAFF_KEY, JSON.stringify(list));
  }
}

export function authenticateStaff(usernameOrPhone: string, pass: string): StaffAccount | null {
  const staff = getStoredStaff();
  const cleanInput = usernameOrPhone.trim().toLowerCase();
  const cleanPass = pass.trim();

  return (
    staff.find(
      (s) =>
        (s.username.toLowerCase() === cleanInput || s.phone === cleanInput) &&
        s.password === cleanPass &&
        s.is_active
    ) || null
  );
}

export function getLoggedInStaff(): StaffAccount | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STAFF_SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setLoggedInStaff(user: StaffAccount | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STAFF_SESSION_KEY);
  }
}

// Admin changes ANY staff password
export function updateStaffPassword(staffId: string, newPass: string): boolean {
  const staff = getStoredStaff();
  const updated = staff.map((s) => (s.id === staffId ? { ...s, password: newPass.trim() } : s));
  saveStoredStaff(updated);

  const current = getLoggedInStaff();
  if (current && current.id === staffId) {
    setLoggedInStaff({ ...current, password: newPass.trim() });
  }
  return true;
}

// Add new staff with custom role and password
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

// Delete staff user
export function deleteStaffAccount(staffId: string): boolean {
  const staff = getStoredStaff();
  // Prevent deleting the last super admin
  const toDelete = staff.find((s) => s.id === staffId);
  if (toDelete?.role === "super_admin" && staff.filter((s) => s.role === "super_admin").length <= 1) {
    alert("Super Admin hnuhnung ber hi a delete theih loh!");
    return false;
  }
  const filtered = staff.filter((s) => s.id !== staffId);
  saveStoredStaff(filtered);
  return true;
}
