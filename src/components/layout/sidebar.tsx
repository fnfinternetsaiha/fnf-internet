"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  BookOpen,
  UserCog,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getLoggedInStaff, StaffAccount } from "@/lib/services/staff-auth";

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = React.useState<StaffAccount | null>(null);

  React.useEffect(() => {
    setUser(getLoggedInStaff());
  }, []);

  const perms = user?.permissions;
  const isSuperAdmin = user?.role === "super_admin";

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard, visible: true },
    {
      label: "Customers",
      href: "/customers",
      icon: Users,
      visible: isSuperAdmin || perms?.can_manage_customers,
    },
    {
      label: "Payments",
      href: "/payments",
      icon: CreditCard,
      visible: isSuperAdmin || perms?.can_approve_payments,
    },
    {
      label: "Recharge Queue",
      href: "/recharge-queue",
      icon: RefreshCw,
      visible: isSuperAdmin || perms?.can_manage_recharge,
    },
    {
      label: "Complaints / LOS",
      href: "/complaints",
      icon: AlertTriangle,
      visible: isSuperAdmin || perms?.can_track_complaints,
    },
    {
      label: "Cashbook",
      href: "/cashbook",
      icon: BookOpen,
      visible: isSuperAdmin || perms?.can_view_finance,
    },
    {
      label: "Staff & Roles",
      href: "/staff",
      icon: UserCog,
      visible: isSuperAdmin || perms?.can_manage_staff,
    },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <Wifi className="h-4 w-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-gray-900 dark:text-white block leading-tight">
              FNF SAIHA
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
              Network NOC
            </span>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400">
        Saiha Headquarters &bull; Fiber ISP System v1.0
      </div>
    </aside>
  );
}
