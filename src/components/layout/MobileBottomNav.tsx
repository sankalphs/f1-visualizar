"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Timer,
  Gauge,
  Trophy,
} from "lucide-react";

const mobileNavItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/telemetry", label: "Live", icon: Gauge },
  { href: "/laps", label: "Laps", icon: Timer },
  { href: "/standings", label: "Rank", icon: Trophy },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-nb-bg border-t-4 border-nb-primary z-50 flex items-center justify-around py-3">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 ${
              isActive ? "text-nb-red" : "text-nb-text"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-black font-headline uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
