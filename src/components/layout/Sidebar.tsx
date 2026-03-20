"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Timer,
  Gauge,
  GitBranch,
  Trophy,
  ShieldAlert,
  Wrench,
  CloudSun,
  Users,
  Radio,
  ArrowLeftRight,
  MessageSquare,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/laps", label: "Lap Times", icon: Timer },
  { href: "/telemetry", label: "Telemetry", icon: Gauge },
  { href: "/positions", label: "Track Positions", icon: MapPin },
  { href: "/position-history", label: "Position History", icon: TrendingUp },
  { href: "/sectors", label: "Sector Heatmap", icon: Layers },
  { href: "/strategy", label: "Strategy", icon: GitBranch },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/session", label: "Session", icon: Trophy },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/intervals", label: "Intervals", icon: ArrowLeftRight },
  { href: "/pit", label: "Pit Stops", icon: Wrench },
  { href: "/race-control", label: "Race Control", icon: ShieldAlert },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/team-radio", label: "Team Radio", icon: MessageSquare },
  { href: "/overtakes", label: "Overtakes", icon: Radio },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-400 shadow-lg md:hidden hover:bg-zinc-800 hover:text-zinc-200"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300 dark:bg-zinc-950",
          // Mobile: slide in/out
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop: collapsed/expanded
          collapsed ? "md:w-16" : "md:w-56",
          // Mobile: always full-ish width
          "w-64"
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          {(!collapsed || mobileOpen) && (
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-red-500">F1</span>
              <span className="text-sm font-semibold text-zinc-200">Visualizer</span>
            </Link>
          )}

          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 md:hidden"
          >
            <X size={16} />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 hidden md:block",
              !collapsed && !mobileOpen && ""
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-red-600/20 text-red-400"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
                      collapsed && "md:justify-center md:px-2"
                    )}
                  >
                    <item.icon size={18} />
                    {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-zinc-800 p-3 flex items-center justify-between">
          {(!collapsed || mobileOpen) && (
            <p className="text-xs text-zinc-600">
              Data from OpenF1 API
            </p>
          )}
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
