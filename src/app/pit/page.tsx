"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Wrench } from "lucide-react";
import { useMemo } from "react";

export default function PitPage() {
  const { sessionKey } = useSession();

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: pitStops = [], isLoading: pitLoading } = useQuery({
    queryKey: ["pit", sessionKey],
    queryFn: () => f1Api.pit.bySession(sessionKey),
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const pitStats = useMemo(() => {
    const map = new Map<number, { count: number; totalTime: number; minTime: number }>();
    for (const p of pitStops) {
      const existing = map.get(p.driver_number) || { count: 0, totalTime: 0, minTime: Infinity };
      existing.count++;
      if (p.lane_duration != null) {
        existing.totalTime += p.lane_duration;
        if (p.lane_duration < existing.minTime) existing.minTime = p.lane_duration;
      }
      map.set(p.driver_number, existing);
    }
    return map;
  }, [pitStops]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-headline font-black uppercase text-xs tracking-tighter text-nb-text-muted">
            <Wrench className="mr-1 inline" size={14} />
            Pit Lane
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none text-nb-text">
            Pit Stops
          </h1>
        </div>
        <SessionSelector />
      </div>

      {/* Pit Summary */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Pit Stop Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-headline font-bold">
            <thead>
              <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                <th className="py-2 px-3 text-left">Driver</th>
                <th className="py-2 px-3 text-left">Team</th>
                <th className="py-2 px-3 text-left">Stops</th>
                <th className="py-2 px-3 text-left">Fastest Stop</th>
                <th className="py-2 px-3 text-left">Avg Lane Time</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(pitStats.entries())
                .sort((a, b) => a[1].minTime - b[1].minTime)
                .map(([driverNum, stats]) => {
                  const driver = driverMap.get(driverNum);
                  return (
                    <tr
                      key={driverNum}
                      className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-1 h-6"
                            style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                          />
                          {driver?.name_acronym || `#${driverNum}`}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-nb-text-muted">
                        {driver?.team_name || "Unknown"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="border-2 border-nb-primary font-headline font-black uppercase text-[10px] px-2 py-0.5 bg-nb-blue text-white">
                          {stats.count}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-nb-text">
                        {stats.minTime === Infinity ? "--" : `${stats.minTime.toFixed(2)}s`}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-nb-text-muted">
                        {stats.count > 0 ? `${(stats.totalTime / stats.count).toFixed(2)}s` : "--"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Pit Stops */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">All Pit Stops ({pitStops.length})</h2>
        </div>
        {pitLoading ? (
          <TableSkeleton rows={15} cols={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-headline font-bold">
              <thead>
                <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                  <th className="py-2 px-3 text-left">#</th>
                  <th className="py-2 px-3 text-left">Driver</th>
                  <th className="py-2 px-3 text-left">Lap</th>
                  <th className="py-2 px-3 text-left">Lane Duration</th>
                  <th className="py-2 px-3 text-left">Stop Duration</th>
                  <th className="py-2 px-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {pitStops.map((pit, idx) => {
                  const driver = driverMap.get(pit.driver_number);
                  return (
                    <tr
                      key={idx}
                      className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                    >
                      <td className="py-2.5 px-3 text-nb-text-muted">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-1 h-6"
                            style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                          />
                          {driver?.name_acronym || `#${pit.driver_number}`}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">L{pit.lap_number}</td>
                      <td className="py-2.5 px-3 font-mono text-nb-text">
                        {pit.lane_duration != null ? `${pit.lane_duration.toFixed(2)}s` : "--"}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-nb-text-muted">
                        {pit.stop_duration !== null
                          ? `${pit.stop_duration.toFixed(2)}s`
                          : "N/A"}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-nb-text-muted">
                        {pit.date ? new Date(pit.date).toLocaleTimeString() : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
