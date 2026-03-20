"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";

export default function TeamRadioPage() {
  const { sessionKey } = useSession();
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: radio = [], isLoading } = useQuery({
    queryKey: ["team-radio", sessionKey, selectedDriver],
    queryFn: () =>
      selectedDriver
        ? f1Api.teamRadio.byDriver(sessionKey, selectedDriver)
        : f1Api.teamRadio.list({ session_key: sessionKey }),
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const radioByDriver = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of radio) {
      map.set(r.driver_number, (map.get(r.driver_number) || 0) + 1);
    }
    return map;
  }, [radio]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <MessageSquare className="mr-2 inline" size={24} />
            Team Radio
          </h1>
          <p className="text-sm text-zinc-500">
            Driver-to-pit communications
          </p>
        </div>
        <SessionSelector />
      </div>

      {/* Driver Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Driver</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDriver(null)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedDriver === null
                ? "border-red-600 bg-red-600/20 text-red-400"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            All ({radio.length})
          </button>
          {Array.from(radioByDriver.entries()).map(([dn, count]) => {
            const driver = driverMap.get(dn);
            return (
              <button
                key={dn}
                onClick={() => setSelectedDriver(dn)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedDriver === dn
                    ? "border-red-600 bg-red-600/20 text-red-400"
                    : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                />
                {driver?.name_acronym || `#${dn}`} ({count})
              </button>
            );
          })}
        </div>
      </Card>

      {/* Radio List */}
      <Card>
        <CardHeader>
          <CardTitle>Radio Messages ({radio.length})</CardTitle>
        </CardHeader>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : radio.length > 0 ? (
          <div className="max-h-[600px] space-y-3 overflow-y-auto">
            {radio
              .slice()
              .reverse()
              .map((r, idx) => {
                const driver = driverMap.get(r.driver_number);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: `#${driver?.team_colour || "888"}`,
                        }}
                      />
                      <span className="text-sm font-medium">
                        {driver?.name_acronym || `#${r.driver_number}`}
                      </span>
                    </div>
                    <div className="flex-1">
                      <audio controls className="w-full max-w-md">
                        <source src={r.recording_url} type="audio/mp3" />
                      </audio>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {r.date ? new Date(r.date).toLocaleTimeString() : "--"}
                    </span>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-zinc-500">
            No radio messages available for this session
          </p>
        )}
      </Card>
    </div>
  );
}
