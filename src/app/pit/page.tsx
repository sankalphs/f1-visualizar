"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
      existing.totalTime += p.lane_duration;
      if (p.lane_duration < existing.minTime) existing.minTime = p.lane_duration;
      map.set(p.driver_number, existing);
    }
    return map;
  }, [pitStops]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <Wrench className="mr-2 inline" size={24} />
            Pit Stops
          </h1>
          <p className="text-sm text-zinc-500">Pit lane timing and analysis</p>
        </div>
        <SessionSelector />
      </div>

      {/* Pit Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pit Stop Summary</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-2 text-left font-medium">Driver</th>
                <th className="py-2 text-left font-medium">Team</th>
                <th className="py-2 text-left font-medium">Stops</th>
                <th className="py-2 text-left font-medium">Fastest Stop</th>
                <th className="py-2 text-left font-medium">Avg Lane Time</th>
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
                      className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                    >
                      <td className="py-2.5 font-medium">
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                        />
                        {driver?.name_acronym || `#${driverNum}`}
                      </td>
                      <td className="py-2.5 text-zinc-400">
                        {driver?.team_name || "Unknown"}
                      </td>
                      <td className="py-2.5">
                        <Badge variant="info">{stats.count}</Badge>
                      </td>
                      <td className="py-2.5 font-mono font-semibold text-emerald-400">
                        {stats.minTime.toFixed(2)}s
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {(stats.totalTime / stats.count).toFixed(2)}s
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* All Pit Stops */}
      <Card>
        <CardHeader>
          <CardTitle>All Pit Stops ({pitStops.length})</CardTitle>
        </CardHeader>
        {pitLoading ? (
          <TableSkeleton rows={15} cols={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">#</th>
                  <th className="py-2 text-left font-medium">Driver</th>
                  <th className="py-2 text-left font-medium">Lap</th>
                  <th className="py-2 text-left font-medium">Lane Duration</th>
                  <th className="py-2 text-left font-medium">Stop Duration</th>
                  <th className="py-2 text-left font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {pitStops.map((pit, idx) => {
                  const driver = driverMap.get(pit.driver_number);
                  return (
                    <tr
                      key={idx}
                      className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                    >
                      <td className="py-2.5 text-zinc-500">{idx + 1}</td>
                      <td className="py-2.5 font-medium">
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                        />
                        {driver?.name_acronym || `#${pit.driver_number}`}
                      </td>
                      <td className="py-2.5">L{pit.lap_number}</td>
                      <td className="py-2.5 font-mono text-zinc-200">
                        {pit.lane_duration.toFixed(2)}s
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {pit.stop_duration !== null
                          ? `${pit.stop_duration.toFixed(2)}s`
                          : "N/A"}
                      </td>
                      <td className="py-2.5 text-xs text-zinc-500">
                        {new Date(pit.date).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
