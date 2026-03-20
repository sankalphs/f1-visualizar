"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <ShieldAlert className="mr-2 inline" size={24} />
            Race Control
          </h1>
          <p className="text-sm text-zinc-500">
            Session status, flags, incidents, and safety car
          </p>
        </div>
        <SessionSelector />
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {Array.from(categoryStats.entries()).map(([cat, count]) => (
          <Card key={cat} className="p-3">
            <p className="text-xs text-zinc-500">{cat}</p>
            <p className="text-lg font-bold text-zinc-100">{count}</p>
          </Card>
        ))}
      </div>

      {/* All Events */}
      <Card>
        <CardHeader>
          <CardTitle>All Events ({events.length})</CardTitle>
        </CardHeader>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="max-h-[600px] space-y-2 overflow-y-auto">
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
                    className="flex items-start gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3"
                  >
                    <div className="flex-shrink-0">
                      <Badge
                        variant={
                          event.flag === "YELLOW" || event.flag === "DOUBLE YELLOW"
                            ? "warning"
                            : event.flag === "RED"
                              ? "danger"
                              : event.flag === "GREEN"
                                ? "success"
                                : "default"
                        }
                      >
                        {event.flag || event.category}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-200">{event.message}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span>{event.date ? new Date(event.date).toLocaleTimeString() : "--"}</span>
                        {event.scope && <span>Scope: {event.scope}</span>}
                        {event.sector && <span>Sector: {event.sector}</span>}
                        {event.lap_number && <span>Lap: {event.lap_number}</span>}
                        {driver && (
                          <span className="flex items-center gap-1">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
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
      </Card>
    </div>
  );
}
