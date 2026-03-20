"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
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
          <p className="font-headline font-bold text-xs uppercase tracking-widest text-nb-yellow">
            <GitBranch className="mr-1 inline" size={14} />
            Race Analysis
          </p>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none">
            Strategy
          </h1>
        </div>
        <SessionSelector />
      </div>

      {/* Strategy Timeline */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary px-4 py-3">
          <h2 className="font-headline font-black uppercase tracking-tighter text-lg">
            Tire Strategy Timeline
          </h2>
        </div>
        {stintsLoading ? (
          <div className="p-4">
            <TableSkeleton rows={10} cols={4} />
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {Array.from(stintsByDriver.entries())
              .sort((a, b) => a[0] - b[0])
              .map(([driverNum, driverStints]) => {
                const driver = driverMap.get(driverNum);
                return (
                  <div
                    key={driverNum}
                    className="flex items-center gap-3 border-b-4 border-nb-primary py-2"
                  >
                    <div className="w-28 flex-shrink-0 font-headline font-bold text-sm uppercase">
                      <span
                        className="mr-2 inline-block h-3 w-3"
                        style={{
                          backgroundColor: `#${driver?.team_colour || "888"}`,
                        }}
                      />
                      {driver?.name_acronym || `#${driverNum}`}
                    </div>
                    <div className="relative flex-1" style={{ height: "32px" }}>
                      {driverStints.map((stint) => {
                        const startPct =
                          ((stint.lap_start - 1) / maxLaps) * 100;
                        const endLap = stint.lap_end || maxLaps;
                        const widthPct =
                          ((endLap - stint.lap_start + 1) / maxLaps) * 100;
                        return (
                          <div
                            key={stint.stint_number}
                            className="absolute flex items-center justify-center border-2 border-nb-primary text-[10px] font-headline font-black"
                            style={{
                              left: `${startPct}%`,
                              width: `${widthPct}%`,
                              backgroundColor: getTyreColor(stint.compound),
                              color:
                                stint.compound === "HARD" ? "#000" : "#fff",
                              height: "32px",
                            }}
                          >
                            {stint.compound?.charAt(0) ?? "?"}
                            <span className="ml-1 font-bold opacity-80">
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
      </div>

      {/* Stint Details */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary px-4 py-3">
          <h2 className="font-headline font-black uppercase tracking-tighter text-lg">
            Stint Details
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-nb-primary text-nb-text font-headline font-bold uppercase tracking-tighter text-xs">
                <th className="px-4 py-3 text-left">Driver</th>
                <th className="px-4 py-3 text-left">Stint</th>
                <th className="px-4 py-3 text-left">Compound</th>
                <th className="px-4 py-3 text-left">Laps</th>
                <th className="px-4 py-3 text-left">Start Lap</th>
                <th className="px-4 py-3 text-left">End Lap</th>
                <th className="px-4 py-3 text-left">Tyre Age</th>
              </tr>
            </thead>
            <tbody>
              {stints.map((stint, idx) => {
                const driver = driverMap.get(stint.driver_number);
                return (
                  <tr
                    key={idx}
                    className="border-b-4 border-nb-primary hover:bg-nb-yellow/10"
                  >
                    <td className="px-4 py-2.5 font-headline font-bold uppercase">
                      {driver?.name_acronym || `#${stint.driver_number}`}
                    </td>
                    <td className="px-4 py-2.5 font-headline font-bold">
                      {stint.stint_number}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-block border-2 border-nb-primary px-2 py-0.5 font-headline font-black uppercase text-xs"
                        style={{
                          backgroundColor: getTyreColor(stint.compound),
                          color: stint.compound === "HARD" ? "#000" : "#fff",
                        }}
                      >
                        {stint.compound}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-headline font-bold">
                      {stint.lap_end
                        ? stint.lap_end - stint.lap_start + 1
                        : "Ongoing"}
                    </td>
                    <td className="px-4 py-2.5 font-headline font-bold">
                      L{stint.lap_start}
                    </td>
                    <td className="px-4 py-2.5 font-headline font-bold">
                      {stint.lap_end ? `L${stint.lap_end}` : "Current"}
                    </td>
                    <td className="px-4 py-2.5 font-headline font-bold">
                      {stint.tyre_age_at_start}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
