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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/laps", label: "Lap Times", icon: Timer },
  { href: "/telemetry", label: "Telemetry", icon: Gauge },
  { href: "/positions", label: "Track Positions", icon: MapPin },
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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-500">F1</span>
            <span className="text-sm font-semibold text-zinc-200">Visualizer</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
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
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-600/20 text-red-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-800 p-3">
        {!collapsed && (
          <p className="text-xs text-zinc-600">
            Data from OpenF1 API
          </p>
        )}
      </div>
    </aside>
  );
}
