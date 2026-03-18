"use client";

import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  TrendingUp,
  Shield,
  GitBranch,
  FileSearch,
  BarChart3,
  Settings,
  Factory,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Parts Database", href: "/parts", icon: Package },
  { label: "Quality Issues", href: "/quality", icon: AlertTriangle },
  { label: "Predictions", href: "/predictions", icon: TrendingUp },
  { label: "PFMEA & Control", href: "/pfmea", icon: Shield },
  { label: "Horizontal Deploy", href: "/horizontal", icon: GitBranch },
  { label: "RFQ Engine", href: "/rfq", icon: FileSearch },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#0d1321] border-r border-white/5 transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 shrink-0">
          <Factory className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-sm font-bold tracking-widest text-white">
              MANUSIGMA
            </h1>
            <p className="text-[10px] font-medium tracking-wider text-cyan-400/70">
              Predictive Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                active
                  ? "bg-cyan-500/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
                  active
                    ? "text-cyan-400"
                    : "text-gray-500 group-hover:text-gray-300"
                }`}
              />

              {!collapsed && (
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    active ? "text-white" : ""
                  }`}
                >
                  {item.label}
                </span>
              )}

              {/* Hover glow for active item */}
              {active && (
                <span className="absolute inset-0 rounded-lg bg-cyan-400/5 pointer-events-none" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings link */}
      <div className="px-3 pb-2">
        <Link
          href="/settings"
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isActive("/settings")
              ? "bg-cyan-500/10 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Settings
            className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
              isActive("/settings")
                ? "text-cyan-400"
                : "text-gray-500 group-hover:text-gray-300"
            }`}
          />
          {!collapsed && (
            <span className="text-sm font-medium whitespace-nowrap">
              Settings
            </span>
          )}
        </Link>
      </div>

      {/* Collapse toggle */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
