"use client";

import { Menu, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Saiha ISP Portal
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="success" className="gap-1.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Server Online
        </Badge>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-zinc-800">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
            DM
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-semibold text-gray-800 dark:text-zinc-200">Desk Manager</p>
            <p className="text-gray-400 text-[10px]">Saiha Branch</p>
          </div>
        </div>
      </div>
    </header>
  );
}
