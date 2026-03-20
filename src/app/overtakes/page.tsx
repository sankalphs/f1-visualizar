"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Skeleton } from "@/components/ui/Skeleton";
import { Radio } from "lucide-react";
import { useMemo } from "react";

export default function OvertakesPage() {
  const { sessionKey } = useSession();

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: overtakes = [], isLoading } = useQuery({
    queryKey: ["overtakes", sessionKey],
    queryFn: () => f1Api.overtakes.bySession(sessionKey),
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const overtakeStats = useMemo(() => {
    const gained = new Map<number, number>();
    const lost = new Map<number, number>();
    for (const o of overtakes) {
      gained.set(o.overtaking_driver_number, (gained.get(o.overtaking_driver_number) || 0) + 1);
      lost.set(o.overtaken_driver_number, (lost.get(o.overtaken_driver_number) || 0) + 1);
    }
    return { gained, lost };
  }, [overtakes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-headline font-black uppercase text-xs tracking-tighter text-nb-text-muted">
            <Radio className="mr-1 inline" size={14} />
            Position Changes
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none text-nb-text">
            Overtakes
          </h1>
        </div>
        <SessionSelector />
      </div>

      {/* Overtake Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
          <div className="bg-nb-primary text-white p-4">
            <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Most Overtakes Made</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-headline font-bold">
              <thead>
                <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                  <th className="py-2 px-3 text-left">Rank</th>
                  <th className="py-2 px-3 text-left">Driver</th>
                  <th className="py-2 px-3 text-left">Overtakes</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(overtakeStats.gained.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([dn, count], idx) => {
                    const driver = driverMap.get(dn);
                    return (
                      <tr
                        key={dn}
                        className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                      >
                        <td className="py-2.5 px-3">
                          <span className={`border-2 border-nb-primary font-headline font-black uppercase text-[10px] px-2 py-0.5 ${idx === 0 ? "bg-nb-yellow text-nb-text" : "bg-nb-surface-dim text-nb-text"}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-1 h-6"
                              style={{
                                backgroundColor: `#${driver?.team_colour || "888"}`,
                              }}
                            />
                            {driver?.name_acronym || `#${dn}`}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black text-nb-text">
                          +{count}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
          <div className="bg-nb-primary text-white p-4">
            <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Most Times Overtaken</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-headline font-bold">
              <thead>
                <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                  <th className="py-2 px-3 text-left">Rank</th>
                  <th className="py-2 px-3 text-left">Driver</th>
                  <th className="py-2 px-3 text-left">Lost Positions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(overtakeStats.lost.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([dn, count], idx) => {
                    const driver = driverMap.get(dn);
                    return (
                      <tr
                        key={dn}
                        className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                      >
                        <td className="py-2.5 px-3">
                          <span className="border-2 border-nb-primary font-headline font-black uppercase text-[10px] px-2 py-0.5 bg-nb-surface-dim text-nb-text">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-1 h-6"
                              style={{
                                backgroundColor: `#${driver?.team_colour || "888"}`,
                              }}
                            />
                            {driver?.name_acronym || `#${dn}`}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black text-nb-red">
                          -{count}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* All Overtakes */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">All Overtakes ({overtakes.length})</h2>
        </div>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="max-h-[600px] overflow-x-auto">
            <table className="w-full text-sm font-headline font-bold">
              <thead>
                <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                  <th className="py-2 px-3 text-left">Time</th>
                  <th className="py-2 px-3 text-left">Overtaking</th>
                  <th className="py-2 px-3 text-left"></th>
                  <th className="py-2 px-3 text-left">Overtaken</th>
                  <th className="py-2 px-3 text-left">Position</th>
                </tr>
              </thead>
              <tbody>
                {overtakes.map((o, idx) => {
                  const overtaking = driverMap.get(o.overtaking_driver_number);
                  const overtaken = driverMap.get(o.overtaken_driver_number);
                  return (
                    <tr
                      key={idx}
                      className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                    >
                      <td className="py-2.5 px-3 text-xs text-nb-text-muted">
                        {o.date ? new Date(o.date).toLocaleTimeString() : "--"}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-1 h-6"
                            style={{
                              backgroundColor: `#${overtaking?.team_colour || "888"}`,
                            }}
                          />
                          {overtaking?.name_acronym || `#${o.overtaking_driver_number}`}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-nb-text-muted font-headline font-black uppercase text-[10px]">passed</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-1 h-6"
                            style={{
                              backgroundColor: `#${overtaken?.team_colour || "888"}`,
                            }}
                          />
                          {overtaken?.name_acronym || `#${o.overtaken_driver_number}`}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="border-2 border-nb-primary font-headline font-black uppercase text-[10px] px-2 py-0.5 bg-nb-blue text-white">
                          P{o.position}
                        </span>
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
