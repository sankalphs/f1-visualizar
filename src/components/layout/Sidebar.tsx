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
  TrendingUp,
  Layers,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/laps", label: "Lap Times", icon: Timer },
  { href: "/telemetry", label: "Telemetry", icon: Gauge },
  { href: "/positions", label: "Track Positions", icon: MapPin },
  { href: "/position-history", label: "Position History", icon: TrendingUp },
  { href: "/sectors", label: "Sector Heatmap", icon: Layers },
  { href: "/strategy", label: "Strategy", icon: GitBranch },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/session", label: "Sessions", icon: LayoutDashboard },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-20 z-50 flex h-10 w-10 items-center justify-center border-2 border-nb-primary bg-nb-surface text-nb-text shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:hidden hover:bg-nb-yellow transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-nb-bg border-r-4 border-nb-primary flex flex-col pt-[72px] pb-10 overflow-y-auto transition-transform duration-200",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="px-4 mb-6">
          <div className="text-xl font-black border-b-2 border-nb-primary mb-1 font-headline uppercase tracking-tight">
            GRAND PRIX
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-nb-red">
            LIVE TELEMETRY
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col font-headline font-bold text-sm uppercase">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "p-3 mx-2 flex items-center gap-3 transition-all duration-100",
                  isActive
                    ? "bg-nb-yellow text-nb-primary border-2 border-nb-primary shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                    : "text-nb-text hover:bg-nb-blue hover:text-white hover:skew-x-1"
                )}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile close */}
        <button
          onClick={closeMobile}
          className="absolute top-[80px] right-3 rounded p-1.5 text-nb-text hover:bg-nb-primary hover:text-white md:hidden"
        >
          <X size={16} />
        </button>
      </aside>
    </>
  );
}
