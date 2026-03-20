"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Skeleton } from "@/components/ui/Skeleton";
import { ShieldAlert } from "lucide-react";
import { useMemo } from "react";

export default function RaceControlPage() {
  const { sessionKey } = useSession();

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["race-control", sessionKey],
    queryFn: () => f1Api.raceControl.bySession(sessionKey),
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) {
      map.set(e.category, (map.get(e.category) || 0) + 1);
    }
    return map;
  }, [events]);

  const getFlagVariant = (flag: string | null) => {
    if (flag === "YELLOW" || flag === "DOUBLE YELLOW") return "bg-nb-yellow text-nb-text";
    if (flag === "RED") return "bg-nb-red text-white";
    if (flag === "GREEN") return "bg-emerald-500 text-white";
    return "bg-nb-surface-dim text-nb-text";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-headline font-black uppercase text-xs tracking-tighter text-nb-text-muted">
            <ShieldAlert className="mr-1 inline" size={14} />
            Control
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none text-nb-text">
            Race Control
          </h1>
        </div>
        <SessionSelector />
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {Array.from(categoryStats.entries()).map(([cat, count]) => (
          <div key={cat} className="border-4 border-nb-primary bg-nb-surface neo-shadow-sm p-3">
            <p className="text-xs font-headline font-bold uppercase text-nb-text-muted">{cat}</p>
            <p className="text-lg font-headline font-black text-nb-text">{count}</p>
          </div>
        ))}
      </div>

      {/* All Events */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">All Events ({events.length})</h2>
        </div>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="max-h-[600px] space-y-2 overflow-y-auto p-3">
            {events
              .slice()
              .reverse()
              .map((event, idx) => {
                const driver = event.driver_number
                  ? driverMap.get(event.driver_number)
                  : null;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 border-2 border-nb-primary bg-nb-surface-dim p-3"
                  >
                    <div className="flex-shrink-0">
                      <span className={`border-2 border-nb-primary font-headline font-black uppercase text-[10px] px-2 py-0.5 ${getFlagVariant(event.flag)}`}>
                        {event.flag || event.category}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-headline font-bold text-nb-text">{event.message}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-headline font-bold text-nb-text-muted">
                        <span>{event.date ? new Date(event.date).toLocaleTimeString() : "--"}</span>
                        {event.scope && <span>Scope: {event.scope}</span>}
                        {event.sector && <span>Sector: {event.sector}</span>}
                        {event.lap_number && <span>Lap: {event.lap_number}</span>}
                        {driver && (
                          <span className="flex items-center gap-1">
                            <span
                              className="inline-block w-1 h-4"
                              style={{
                                backgroundColor: `#${driver.team_colour}`,
                              }}
                            />
                            {driver.name_acronym}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
