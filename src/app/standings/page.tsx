"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatInterval } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { useMemo } from "react";

export default function StandingsPage() {
  const { sessionKey } = useSession();

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: champDrivers = [], isLoading: cdLoading } = useQuery({
    queryKey: ["champ-drivers", sessionKey],
    queryFn: () => f1Api.championshipDrivers.bySession(sessionKey),
  });

  const { data: champTeams = [], isLoading: ctLoading } = useQuery({
    queryKey: ["champ-teams", sessionKey],
    queryFn: () => f1Api.championshipTeams.bySession(sessionKey),
  });

  const { data: sessionResults = [], isLoading: srLoading } = useQuery({
    queryKey: ["session-result", sessionKey],
    queryFn: () => f1Api.sessionResult.bySession(sessionKey),
  });

  const { data: startingGrid = [] } = useQuery({
    queryKey: ["starting-grid", sessionKey],
    queryFn: () => f1Api.startingGrid.bySession(sessionKey),
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const sortedChampDrivers = useMemo(
    () => [...champDrivers].sort((a, b) => a.position_current - b.position_current),
    [champDrivers]
  );

  const sortedChampTeams = useMemo(
    () => [...champTeams].sort((a, b) => a.position_current - b.position_current),
    [champTeams]
  );

  const sortedResults = useMemo(
    () => [...sessionResults].sort((a, b) => a.position - b.position),
    [sessionResults]
  );

  const sortedGrid = useMemo(
    () => [...startingGrid].sort((a, b) => a.position - b.position),
    [startingGrid]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <Trophy className="mr-2 inline" size={24} />
            Standings
          </h1>
          <p className="text-sm text-zinc-500">
            Championship standings and session results
          </p>
        </div>
        <SessionSelector />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Driver Championship */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Championship</CardTitle>
          </CardHeader>
          {cdLoading ? (
            <TableSkeleton rows={10} cols={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="py-2 text-left font-medium">Pos</th>
                    <th className="py-2 text-left font-medium">Driver</th>
                    <th className="py-2 text-left font-medium">Points</th>
                    <th className="py-2 text-left font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedChampDrivers.map((cd) => {
                    const driver = driverMap.get(cd.driver_number);
                    const change = cd.position_start - cd.position_current;
                    return (
                      <tr
                        key={cd.driver_number}
                        className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                      >
                        <td className="py-2.5">
                          <Badge variant={cd.position_current <= 3 ? "success" : "default"}>
                            P{cd.position_current}
                          </Badge>
                        </td>
                        <td className="py-2.5 font-medium">
                          <span
                            className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                          />
                          {driver?.name_acronym || `#${cd.driver_number}`}
                        </td>
                        <td className="py-2.5 font-mono font-bold">
                          {cd.points_current}
                        </td>
                        <td className="py-2.5">
                          {change > 0 && <span className="text-emerald-400">+{change}</span>}
                          {change < 0 && <span className="text-red-400">{change}</span>}
                          {change === 0 && <span className="text-zinc-500">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Constructor Championship */}
        <Card>
          <CardHeader>
            <CardTitle>Constructor Championship</CardTitle>
          </CardHeader>
          {ctLoading ? (
            <TableSkeleton rows={10} cols={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="py-2 text-left font-medium">Pos</th>
                    <th className="py-2 text-left font-medium">Team</th>
                    <th className="py-2 text-left font-medium">Points</th>
                    <th className="py-2 text-left font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedChampTeams.map((ct) => {
                    const change = ct.position_start - ct.position_current;
                    return (
                      <tr
                        key={ct.team_name}
                        className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                      >
                        <td className="py-2.5">
                          <Badge variant={ct.position_current <= 3 ? "success" : "default"}>
                            P{ct.position_current}
                          </Badge>
                        </td>
                        <td className="py-2.5 font-medium">{ct.team_name}</td>
                        <td className="py-2.5 font-mono font-bold">
                          {ct.points_current}
                        </td>
                        <td className="py-2.5">
                          {change > 0 && <span className="text-emerald-400">+{change}</span>}
                          {change < 0 && <span className="text-red-400">{change}</span>}
                          {change === 0 && <span className="text-zinc-500">-</span>}
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

      {/* Session Result & Starting Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Result</CardTitle>
          </CardHeader>
          {srLoading ? (
            <TableSkeleton rows={10} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="py-2 text-left font-medium">Pos</th>
                    <th className="py-2 text-left font-medium">Driver</th>
                    <th className="py-2 text-left font-medium">Gap</th>
                    <th className="py-2 text-left font-medium">Laps</th>
                    <th className="py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((sr) => {
                    const driver = driverMap.get(sr.driver_number);
                    return (
                      <tr
                        key={sr.driver_number}
                        className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                      >
                        <td className="py-2.5">
                          <Badge variant={sr.position <= 3 ? "success" : "default"}>
                            P{sr.position}
                          </Badge>
                        </td>
                        <td className="py-2.5 font-medium">
                          <span
                            className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                          />
                          {driver?.name_acronym || `#${sr.driver_number}`}
                        </td>
                        <td className="py-2.5 font-mono text-zinc-400">
                          {formatInterval(sr.gap_to_leader)}
                        </td>
                        <td className="py-2.5 text-zinc-400">{sr.number_of_laps}</td>
                        <td className="py-2.5">
                          {sr.dnf && <Badge variant="danger">DNF</Badge>}
                          {sr.dns && <Badge variant="warning">DNS</Badge>}
                          {sr.dsq && <Badge variant="danger">DSQ</Badge>}
                          {!sr.dnf && !sr.dns && !sr.dsq && <Badge variant="success">OK</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Starting Grid</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">Pos</th>
                  <th className="py-2 text-left font-medium">Driver</th>
                  <th className="py-2 text-left font-medium">Lap Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedGrid.map((sg) => {
                  const driver = driverMap.get(sg.driver_number);
                  return (
                    <tr
                      key={sg.driver_number}
                      className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                    >
                      <td className="py-2.5">
                        <Badge variant={sg.position <= 3 ? "success" : "default"}>
                          P{sg.position}
                        </Badge>
                      </td>
                      <td className="py-2.5 font-medium">
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                        />
                        {driver?.name_acronym || `#${sg.driver_number}`}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {sg.lap_duration?.toFixed(3) ?? "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
