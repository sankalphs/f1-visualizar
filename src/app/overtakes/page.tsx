"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
          <h1 className="text-2xl font-bold text-zinc-100">
            <Radio className="mr-2 inline" size={24} />
            Overtakes
          </h1>
          <p className="text-sm text-zinc-500">
            Position changes and overtaking moves
          </p>
        </div>
        <SessionSelector />
      </div>

      {/* Overtake Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Overtakes Made</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">Rank</th>
                  <th className="py-2 text-left font-medium">Driver</th>
                  <th className="py-2 text-left font-medium">Overtakes</th>
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
                        className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                      >
                        <td className="py-2.5">
                          <Badge variant={idx === 0 ? "success" : "default"}>
                            {idx + 1}
                          </Badge>
                        </td>
                        <td className="py-2.5 font-medium">
                          <span
                            className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: `#${driver?.team_colour || "888"}`,
                            }}
                          />
                          {driver?.name_acronym || `#${dn}`}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-emerald-400">
                          +{count}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Times Overtaken</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">Rank</th>
                  <th className="py-2 text-left font-medium">Driver</th>
                  <th className="py-2 text-left font-medium">Lost Positions</th>
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
                        className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                      >
                        <td className="py-2.5">
                          <Badge variant="default">{idx + 1}</Badge>
                        </td>
                        <td className="py-2.5 font-medium">
                          <span
                            className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: `#${driver?.team_colour || "888"}`,
                            }}
                          />
                          {driver?.name_acronym || `#${dn}`}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-red-400">
                          -{count}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* All Overtakes */}
      <Card>
        <CardHeader>
          <CardTitle>All Overtakes ({overtakes.length})</CardTitle>
        </CardHeader>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="max-h-[600px] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">Time</th>
                  <th className="py-2 text-left font-medium">Overtaking</th>
                  <th className="py-2 text-left font-medium"></th>
                  <th className="py-2 text-left font-medium">Overtaken</th>
                  <th className="py-2 text-left font-medium">Position</th>
                </tr>
              </thead>
              <tbody>
                {overtakes.map((o, idx) => {
                  const overtaking = driverMap.get(o.overtaking_driver_number);
                  const overtaken = driverMap.get(o.overtaken_driver_number);
                  return (
                    <tr
                      key={idx}
                      className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                    >
                      <td className="py-2.5 text-xs text-zinc-500">
                        {o.date ? new Date(o.date).toLocaleTimeString() : "--"}
                      </td>
                      <td className="py-2.5 font-medium">
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: `#${overtaking?.team_colour || "888"}`,
                          }}
                        />
                        {overtaking?.name_acronym || `#${o.overtaking_driver_number}`}
                      </td>
                      <td className="py-2.5 text-zinc-600">passed</td>
                      <td className="py-2.5 font-medium">
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: `#${overtaken?.team_colour || "888"}`,
                          }}
                        />
                        {overtaken?.name_acronym || `#${o.overtaken_driver_number}`}
                      </td>
                      <td className="py-2.5">
                        <Badge variant="info">P{o.position}</Badge>
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
