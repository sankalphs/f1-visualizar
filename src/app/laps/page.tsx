"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="bg-nb-primary text-white px-3 py-1 text-xs font-black uppercase font-headline">
            Timing Data
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none">
            Lap Times
          </h1>
          <p className="text-sm font-bold font-headline text-nb-text-muted uppercase mt-1">
            Detailed lap-by-lap timing data
          </p>
        </div>
        <select
          value={selectedDriver ?? ""}
          onChange={(e) =>
            setSelectedDriver(e.target.value ? Number(e.target.value) : null)
          }
          className="border-4 border-nb-primary bg-nb-surface px-4 py-2 font-headline font-bold text-sm uppercase text-nb-text focus:border-nb-blue focus:outline-none neo-shadow-sm"
        >
          <option value="">ALL DRIVERS</option>
          {drivers.map((d) => (
            <option key={d.driver_number} value={d.driver_number}>
              {d.name_acronym || `#${d.driver_number}`} - {d.team_name || ""}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Timer size={16} />
              ALL LAPS ({sortedLaps.length})
            </span>
          </CardTitle>
          <Badge variant="yellow">LIVE</Badge>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton rows={20} cols={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-nb-surface-dim border-b-2 border-nb-primary font-headline font-black uppercase text-xs">
                  <th className="p-3 border-r-2 border-nb-primary">RANK</th>
                  <th className="p-3 border-r-2 border-nb-primary">DRIVER</th>
                  <th className="p-3 border-r-2 border-nb-primary">LAP</th>
                  <th className="p-3 border-r-2 border-nb-primary">LAP TIME</th>
                  <th className="p-3 border-r-2 border-nb-primary">S1</th>
                  <th className="p-3 border-r-2 border-nb-primary">S2</th>
                  <th className="p-3 border-r-2 border-nb-primary">S3</th>
                  <th className="p-3 border-r-2 border-nb-primary">SPEED</th>
                  <th className="p-3">PIT</th>
                </tr>
              </thead>
              <tbody className="font-headline font-bold text-sm">
                {sortedLaps.map((lap, idx) => {
                  const driver = driverMap.get(lap.driver_number);
                  return (
                    <tr
                      key={`${lap.driver_number}-${lap.lap_number}`}
                      className="border-b-2 border-nb-primary hover:bg-nb-yellow/10 transition-colors"
                    >
                      <td className="p-3 border-r-2 border-nb-primary">
                        <span className={idx === 0 ? "font-black text-nb-red" : ""}>{idx + 1}</span>
                      </td>
                      <td className="p-3 border-r-2 border-nb-primary">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-1 h-6"
                            style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                          />
                          <span className="italic">
                            {driver?.name_acronym || `#${lap.driver_number}`}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted">
                        L{lap.lap_number}
                      </td>
                      <td className="p-3 border-r-2 border-nb-primary font-black italic">
                        {formatLapTime(lap.lap_duration)}
                      </td>
                      <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted font-mono text-xs">
                        {lap.duration_sector_1?.toFixed(3) ?? "--"}
                      </td>
                      <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted font-mono text-xs">
                        {lap.duration_sector_2?.toFixed(3) ?? "--"}
                      </td>
                      <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted font-mono text-xs">
                        {lap.duration_sector_3?.toFixed(3) ?? "--"}
                      </td>
                      <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted font-mono text-xs">
                        {lap.st_speed ? `${lap.st_speed}` : "--"}
                      </td>
                      <td className="p-3">
                        {lap.is_pit_out_lap && <Badge variant="warning">PIT</Badge>}
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
