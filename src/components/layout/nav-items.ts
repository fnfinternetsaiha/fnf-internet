import {
  LayoutDashboard,
  Users,
  CreditCard,
  RefreshCw,
  AlertCircle,
  BookOpen,
  UserCheck,
} from "lucide-react";

export const NAV_ITEMS = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Recharge Queue", href: "/recharge-queue", icon: RefreshCw },
  { name: "Complaints / LOS", href: "/complaints", icon: AlertCircle },
  { name: "Cashbook", href: "/cashbook", icon: BookOpen },
  { name: "Staff & Roles", href: "/staff", icon: UserCheck },
];
