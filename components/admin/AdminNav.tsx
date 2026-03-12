"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tent,
  BarChart3,
  Gauge,
  ArrowLeft,
} from "lucide-react";
import ThemeToggle from "@/components/keystatic/ThemeToggle";

const NAV_ITEMS = [
  {
    label: "Camp Sessions",
    href: "/admin/sessions",
    icon: Tent,
  },
  {
    label: "Site Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Performance",
    href: "/admin/performance",
    icon: Gauge,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="h-14 w-full flex items-center bg-gray-900 px-4 gap-2">
      <Link
        href="/keystatic"
        className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mr-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>CMS</span>
      </Link>

      <div className="h-6 w-px bg-white/20" />

      <div className="flex items-center gap-1 ml-2">
        <LayoutDashboard className="h-4 w-4 text-white/70" />
        <span className="text-white font-medium text-sm">Dashboard</span>
      </div>

      <div className="h-6 w-px bg-white/20 mx-2" />

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle compact />
        <Link
          href="/"
          className="text-white/50 hover:text-white text-xs transition-colors"
        >
          View Site
        </Link>
      </div>
    </header>
  );
}
