"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatLapTime } from "@/lib/utils";
import { Timer } from "lucide-react";
import { useMemo, useState } from "react";

export default function LapsPage() {
  const { sessionKey } = useSession();
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: laps = [], isLoading } = useQuery({
    queryKey: ["laps", sessionKey, selectedDriver],
    queryFn: () =>
      selectedDriver
        ? f1Api.laps.byDriver(sessionKey, selectedDriver)
        : f1Api.laps.list({ session_key: sessionKey }),
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const sortedLaps = useMemo(
    () =>
      [...laps].filter((l) => l.lap_duration && !l.is_pit_out_lap).sort(
        (a, b) => (a.lap_duration ?? Infinity) - (b.lap_duration ?? Infinity)
      ),
    [laps]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <Timer className="mr-2 inline" size={24} />
            Lap Times
          </h1>
          <p className="text-sm text-zinc-500">
            Detailed lap-by-lap timing data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedDriver ?? ""}
            onChange={(e) =>
              setSelectedDriver(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 focus:border-red-500 focus:outline-none"
          >
            <option value="">All Drivers</option>
            {drivers.map((d) => (
              <option key={d.driver_number} value={d.driver_number}>
                {d.name_acronym || `#${d.driver_number}`} - {d.team_name || ""}
              </option>
            ))}
          </select>
          <SessionSelector />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Laps ({sortedLaps.length})
          </CardTitle>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton rows={20} cols={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">Rank</th>
                  <th className="py-2 text-left font-medium">Driver</th>
                  <th className="py-2 text-left font-medium">Lap</th>
                  <th className="py-2 text-left font-medium">Lap Time</th>
                  <th className="py-2 text-left font-medium">S1</th>
                  <th className="py-2 text-left font-medium">S2</th>
                  <th className="py-2 text-left font-medium">S3</th>
                  <th className="py-2 text-left font-medium">I1</th>
                  <th className="py-2 text-left font-medium">I2</th>
                  <th className="py-2 text-left font-medium">ST</th>
                  <th className="py-2 text-left font-medium">Pit Out</th>
                </tr>
              </thead>
              <tbody>
                {sortedLaps.map((lap, idx) => {
                  const driver = driverMap.get(lap.driver_number);
                  return (
                    <tr
                      key={`${lap.driver_number}-${lap.lap_number}`}
                      className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                    >
                      <td className="py-2.5">
                        <Badge variant={idx === 0 ? "success" : "default"}>
                          {idx + 1}
                        </Badge>
                      </td>
                      <td className="py-2.5 font-medium">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: `#${driver?.team_colour || "888"}`,
                            }}
                          />
                          {driver?.name_acronym || `#${lap.driver_number}`}
                        </div>
                      </td>
                      <td className="py-2.5 text-zinc-400">
                        L{lap.lap_number}
                      </td>
                      <td className="py-2.5 font-mono font-semibold text-zinc-100">
                        {formatLapTime(lap.lap_duration)}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {lap.duration_sector_1?.toFixed(3) ?? "--"}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {lap.duration_sector_2?.toFixed(3) ?? "--"}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {lap.duration_sector_3?.toFixed(3) ?? "--"}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {lap.i1_speed ? `${lap.i1_speed}` : "--"}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {lap.i2_speed ? `${lap.i2_speed}` : "--"}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {lap.st_speed ? `${lap.st_speed}` : "--"}
                      </td>
                      <td className="py-2.5">
                        {lap.is_pit_out_lap && (
                          <Badge variant="warning">PIT</Badge>
                        )}
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
