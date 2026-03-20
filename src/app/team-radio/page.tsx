"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
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
          <span className="font-headline font-black uppercase text-xs tracking-tighter text-nb-text-muted">
            <MessageSquare className="mr-1 inline" size={14} />
            Comms
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none text-nb-text">
            Team Radio
          </h1>
        </div>
        <SessionSelector />
      </div>

      {/* Driver Filter */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Filter by Driver</h2>
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          <button
            onClick={() => setSelectedDriver(null)}
            className={`border-2 border-nb-primary font-headline font-black uppercase text-[10px] px-3 py-1.5 transition-colors ${
              selectedDriver === null
                ? "bg-nb-red text-white"
                : "bg-nb-surface-dim text-nb-text hover:bg-nb-yellow/20"
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
                className={`border-2 border-nb-primary font-headline font-black uppercase text-[10px] px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
                  selectedDriver === dn
                    ? "bg-nb-red text-white"
                    : "bg-nb-surface-dim text-nb-text hover:bg-nb-yellow/20"
                }`}
              >
                <span
                  className="inline-block w-1 h-4"
                  style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                />
                {driver?.name_acronym || `#${dn}`} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Radio List */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Radio Messages ({radio.length})</h2>
        </div>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : radio.length > 0 ? (
          <div className="max-h-[600px] space-y-2 overflow-y-auto p-3">
            {radio
              .slice()
              .reverse()
              .map((r, idx) => {
                const driver = driverMap.get(r.driver_number);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 border-2 border-nb-primary bg-nb-surface-dim p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-1 h-6"
                        style={{
                          backgroundColor: `#${driver?.team_colour || "888"}`,
                        }}
                      />
                      <span className="text-sm font-headline font-bold text-nb-text">
                        {driver?.name_acronym || `#${r.driver_number}`}
                      </span>
                    </div>
                    <div className="flex-1">
                      <audio controls className="w-full max-w-md">
                        <source src={r.recording_url} type="audio/mp3" />
                      </audio>
                    </div>
                    <span className="text-xs font-headline font-bold text-nb-text-muted">
                      {r.date ? new Date(r.date).toLocaleTimeString() : "--"}
                    </span>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm font-headline font-bold text-nb-text-muted">
            No radio messages available for this session
          </p>
        )}
      </div>
    </div>
  );
}
