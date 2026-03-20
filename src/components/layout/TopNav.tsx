"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SessionSelector } from "@/components/dashboard/SessionSelector";

const topNavLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/telemetry", label: "Telemetry" },
  { href: "/strategy", label: "Strategy" },
  { href: "/standings", label: "Standings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full px-4 md:px-6 py-3 bg-nb-bg border-b-4 border-nb-primary neo-shadow">
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/" className="shrink-0">
          <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-nb-red font-headline uppercase">
            F1 VISUALIZER
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 font-headline font-bold uppercase text-sm tracking-tighter">
          {topNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "text-nb-red border-b-4 border-nb-red pb-1"
                    : "text-nb-text hover:text-nb-blue transition-colors duration-100"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="hidden lg:flex items-center gap-3">
        <SessionSelector />
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}
