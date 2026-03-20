"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { useMemo, useState, useEffect } from "react";
import { Radio, Clock } from "lucide-react";

export function TopNav() {
  const { sessionKey } = useSession();
  const [now, setNow] = useState(() => Date.now());

  // Update current time every 30s for live indicator
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const { data: positions = [] } = useQuery({
    queryKey: ["positions", sessionKey],
    queryFn: () => f1Api.position.list({ session_key: sessionKey }),
    refetchInterval: 30_000,
  });

  const latestDate = useMemo(() => {
    if (positions.length === 0) return null;
    let newest = positions[0].date;
    for (const p of positions) {
      if (new Date(p.date) > new Date(newest)) newest = p.date;
    }
    return newest;
  }, [positions]);

  const isLive = latestDate && now > 0
    ? new Date(latestDate).getTime() > now - 10 * 60 * 1000
    : false;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full px-4 md:px-6 py-3 bg-nb-bg border-b-4 border-nb-primary neo-shadow">
      <div className="flex items-center gap-4 md:gap-6">
        <Link href="/" className="shrink-0">
          <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-nb-red font-headline uppercase">
            F1 VISUALIZER
          </span>
        </Link>
        <LiveIndicator isLive={isLive} latestDate={latestDate} />
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

function LiveIndicator({ isLive, latestDate }: { isLive: boolean; latestDate: string | null }) {
  if (!latestDate) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 border-2 border-nb-primary text-[10px] font-headline font-black uppercase ${
      isLive ? "bg-emerald-500/20 text-emerald-700" : "bg-nb-yellow/20 text-amber-700"
    }`}>
      {isLive ? (
        <>
          <Radio size={12} className="animate-pulse" />
          <span>LIVE</span>
        </>
      ) : (
        <>
          <Clock size={12} />
          <span>ARCHIVED</span>
        </>
      )}
    </div>
  );
}
