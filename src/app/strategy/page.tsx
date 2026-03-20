"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { getTyreColor } from "@/lib/utils";
import { GitBranch } from "lucide-react";
import { useMemo } from "react";

export default function StrategyPage() {
  const { sessionKey } = useSession();

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: stints = [], isLoading: stintsLoading } = useQuery({
    queryKey: ["stints", sessionKey],
    queryFn: () => f1Api.stints.list({ session_key: sessionKey }),
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const stintsByDriver = useMemo(() => {
    const map = new Map<number, typeof stints>();
    for (const s of stints) {
      if (!map.has(s.driver_number)) map.set(s.driver_number, []);
      map.get(s.driver_number)!.push(s);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.stint_number - b.stint_number);
    }
    return map;
  }, [stints]);

  const maxLaps = useMemo(() => {
    let max = 0;
    for (const s of stints) {
      if (s.lap_end && s.lap_end > max) max = s.lap_end;
      if (s.lap_start > max) max = s.lap_start;
    }
    return max || 70;
  }, [stints]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <GitBranch className="mr-2 inline" size={24} />
            Strategy
          </h1>
          <p className="text-sm text-zinc-500">
            Tire strategy and stint visualization
          </p>
        </div>
        <SessionSelector />
      </div>

      {/* Strategy Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Tire Strategy Timeline</CardTitle>
        </CardHeader>
        {stintsLoading ? (
          <TableSkeleton rows={10} cols={4} />
        ) : (
          <div className="space-y-2">
            {Array.from(stintsByDriver.entries())
              .sort((a, b) => a[0] - b[0])
              .map(([driverNum, driverStints]) => {
                const driver = driverMap.get(driverNum);
                return (
                  <div
                    key={driverNum}
                    className="flex items-center gap-3 border-b border-zinc-800/50 py-2"
                  >
                    <div className="w-24 flex-shrink-0 text-sm font-medium">
                      <span
                        className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: `#${driver?.team_colour || "888"}`,
                        }}
                      />
                      {driver?.name_acronym || `#${driverNum}`}
                    </div>
                    <div className="relative flex-1" style={{ height: "28px" }}>
                      {driverStints.map((stint) => {
                        const startPct =
                          ((stint.lap_start - 1) / maxLaps) * 100;
                        const endLap = stint.lap_end || maxLaps;
                        const widthPct =
                          ((endLap - stint.lap_start + 1) / maxLaps) * 100;
                        return (
                          <div
                            key={stint.stint_number}
                            className="absolute flex items-center justify-center rounded-md text-[10px] font-bold"
                            style={{
                              left: `${startPct}%`,
                              width: `${widthPct}%`,
                              backgroundColor: getTyreColor(stint.compound),
                              color:
                                stint.compound === "HARD" ? "#000" : "#fff",
                              height: "28px",
                            }}
                          >
                            {stint.compound?.charAt(0) ?? "?"}
                            <span className="ml-1 font-normal opacity-80">
                              L{stint.lap_start}-{endLap}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </Card>

      {/* Stint Details */}
      <Card>
        <CardHeader>
          <CardTitle>Stint Details</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-2 text-left font-medium">Driver</th>
                <th className="py-2 text-left font-medium">Stint</th>
                <th className="py-2 text-left font-medium">Compound</th>
                <th className="py-2 text-left font-medium">Laps</th>
                <th className="py-2 text-left font-medium">Start Lap</th>
                <th className="py-2 text-left font-medium">End Lap</th>
                <th className="py-2 text-left font-medium">Tyre Age</th>
              </tr>
            </thead>
            <tbody>
              {stints.map((stint, idx) => {
                const driver = driverMap.get(stint.driver_number);
                return (
                  <tr
                    key={idx}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                  >
                    <td className="py-2.5 font-medium">
                      {driver?.name_acronym || `#${stint.driver_number}`}
                    </td>
                    <td className="py-2.5">{stint.stint_number}</td>
                    <td className="py-2.5">
                      <Badge
                        style={{
                          backgroundColor: getTyreColor(stint.compound),
                          color: stint.compound === "HARD" ? "#000" : "#fff",
                        }}
                      >
                        {stint.compound}
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      {stint.lap_end
                        ? stint.lap_end - stint.lap_start + 1
                        : "Ongoing"}
                    </td>
                    <td className="py-2.5">L{stint.lap_start}</td>
                    <td className="py-2.5">
                      {stint.lap_end ? `L${stint.lap_end}` : "Current"}
                    </td>
                    <td className="py-2.5">{stint.tyre_age_at_start}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
