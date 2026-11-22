"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wifi } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Wifi className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white block">
            FNF SAIHA
          </span>
          <span className="text-[11px] font-medium text-blue-600 uppercase tracking-widest block -mt-0.5">
            Network NOC
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-gray-500 dark:text-zinc-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-400 dark:text-zinc-500">
        <p className="font-medium text-gray-700 dark:text-zinc-300">Saiha Headquarters</p>
        <p className="text-[11px]">FNF Fiber ISP System v1.0</p>
      </div>
    </aside>
  );
}
