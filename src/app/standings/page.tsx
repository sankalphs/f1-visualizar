"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
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
          <p className="font-headline font-black uppercase tracking-tighter text-sm text-nb-text-muted">
            Race Data
          </p>
          <h1 className="font-headline font-black uppercase tracking-tighter text-4xl text-nb-text">
            <Trophy className="mr-2 inline" size={32} />
            Standings
          </h1>
        </div>
        <SessionSelector />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Driver Championship */}
        <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
          <div className="bg-nb-primary px-4 py-2">
            <h2 className="font-headline font-black uppercase tracking-tighter text-white">
              Driver Championship
            </h2>
          </div>
          {cdLoading ? (
            <TableSkeleton rows={10} cols={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-headline font-bold">
                <thead>
                  <tr className="bg-nb-primary text-white font-headline font-black uppercase tracking-tighter">
                    <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Pos</th>
                    <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Driver</th>
                    <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Points</th>
                    <th className="px-3 py-2 text-left">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedChampDrivers.map((cd) => {
                    const driver = driverMap.get(cd.driver_number);
                    const change = cd.position_start - cd.position_current;
                    return (
                      <tr
                        key={cd.driver_number}
                        className="border-b-4 border-nb-primary/20 hover:bg-nb-yellow/20"
                      >
                        <td className="px-3 py-2.5 border-r-4 border-nb-primary/20">
                          <span className="font-headline font-black text-nb-text">
                            {cd.position_current}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r-4 border-nb-primary/20 font-headline font-bold text-nb-text">
                          <span
                            className="mr-2 inline-block w-1 h-6 align-middle"
                            style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                          />
                          {driver?.name_acronym || `#${cd.driver_number}`}
                        </td>
                        <td className="px-3 py-2.5 border-r-4 border-nb-primary/20 font-headline font-black text-nb-text">
                          {cd.points_current}
                        </td>
                        <td className="px-3 py-2.5">
                          {change > 0 && <span className="font-headline font-black text-nb-red">+{change}</span>}
                          {change < 0 && <span className="font-headline font-black text-nb-text-muted">{change}</span>}
                          {change === 0 && <span className="font-headline font-bold text-nb-text-muted">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Constructor Championship */}
        <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
          <div className="bg-nb-primary px-4 py-2">
            <h2 className="font-headline font-black uppercase tracking-tighter text-white">
              Constructor Championship
            </h2>
          </div>
          {ctLoading ? (
            <TableSkeleton rows={10} cols={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-headline font-bold">
                <thead>
                  <tr className="bg-nb-primary text-white font-headline font-black uppercase tracking-tighter">
                    <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Pos</th>
                    <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Team</th>
                    <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Points</th>
                    <th className="px-3 py-2 text-left">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedChampTeams.map((ct) => {
                    const change = ct.position_start - ct.position_current;
                    return (
                      <tr
                        key={ct.team_name}
                        className="border-b-4 border-nb-primary/20 hover:bg-nb-yellow/20"
                      >
                        <td className="px-3 py-2.5 border-r-4 border-nb-primary/20">
                          <span className="font-headline font-black text-nb-text">
                            {ct.position_current}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r-4 border-nb-primary/20 font-headline font-bold text-nb-text">
                          {ct.team_name}
                        </td>
                        <td className="px-3 py-2.5 border-r-4 border-nb-primary/20 font-headline font-black text-nb-text">
                          {ct.points_current}
                        </td>
                        <td className="px-3 py-2.5">
                          {change > 0 && <span className="font-headline font-black text-nb-red">+{change}</span>}
                          {change < 0 && <span className="font-headline font-black text-nb-text-muted">{change}</span>}
                          {change === 0 && <span className="font-headline font-bold text-nb-text-muted">-</span>}
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

      {/* Session Result & Starting Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
          <div className="bg-nb-primary px-4 py-2">
            <h2 className="font-headline font-black uppercase tracking-tighter text-white">
              Session Result
            </h2>
          </div>
          {srLoading ? (
            <TableSkeleton rows={10} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-headline font-bold">
                <thead>
                  <tr className="bg-nb-primary text-white font-headline font-black uppercase tracking-tighter">
                    <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Pos</th>
                    <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Driver</th>
                    <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Gap</th>
                    <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Laps</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((sr) => {
                    const driver = driverMap.get(sr.driver_number);
                    return (
                      <tr
                        key={sr.driver_number}
                        className="border-b-4 border-nb-primary/20 hover:bg-nb-yellow/20"
                      >
                        <td className="px-3 py-2.5 border-r-4 border-nb-primary/20">
                          <span className="font-headline font-black text-nb-text">
                            {sr.position}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r-4 border-nb-primary/20 font-headline font-bold text-nb-text">
                          <span
                            className="mr-2 inline-block w-1 h-6 align-middle"
                            style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                          />
                          {driver?.name_acronym || `#${sr.driver_number}`}
                        </td>
                        <td className="px-3 py-2.5 border-r-4 border-nb-primary/20 font-headline font-bold text-nb-text-muted">
                          {formatInterval(sr.gap_to_leader)}
                        </td>
                        <td className="px-3 py-2.5 border-r-4 border-nb-primary/20 font-headline font-bold text-nb-text-muted">
                          {sr.number_of_laps}
                        </td>
                        <td className="px-3 py-2.5">
                          {sr.dnf && (
                            <span className="border-2 border-nb-primary bg-nb-red px-2 py-0.5 text-xs font-headline font-black uppercase text-white">
                              DNF
                            </span>
                          )}
                          {sr.dns && (
                            <span className="border-2 border-nb-primary bg-nb-yellow px-2 py-0.5 text-xs font-headline font-black uppercase text-nb-text">
                              DNS
                            </span>
                          )}
                          {sr.dsq && (
                            <span className="border-2 border-nb-primary bg-nb-red px-2 py-0.5 text-xs font-headline font-black uppercase text-white">
                              DSQ
                            </span>
                          )}
                          {!sr.dnf && !sr.dns && !sr.dsq && (
                            <span className="border-2 border-nb-primary bg-nb-surface px-2 py-0.5 text-xs font-headline font-black uppercase text-nb-text">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
          <div className="bg-nb-primary px-4 py-2">
            <h2 className="font-headline font-black uppercase tracking-tighter text-white">
              Starting Grid
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-headline font-bold">
              <thead>
                <tr className="bg-nb-primary text-white font-headline font-black uppercase tracking-tighter">
                  <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Pos</th>
                  <th className="px-3 py-2 text-left border-r-4 border-nb-surface">Driver</th>
                  <th className="px-3 py-2 text-left">Lap Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedGrid.map((sg) => {
                  const driver = driverMap.get(sg.driver_number);
                  return (
                    <tr
                      key={sg.driver_number}
                      className="border-b-4 border-nb-primary/20 hover:bg-nb-yellow/20"
                    >
                      <td className="px-3 py-2.5 border-r-4 border-nb-primary/20">
                        <span className="font-headline font-black text-nb-text">
                          {sg.position}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 border-r-4 border-nb-primary/20 font-headline font-bold text-nb-text">
                        <span
                          className="mr-2 inline-block w-1 h-6 align-middle"
                          style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                        />
                        {driver?.name_acronym || `#${sg.driver_number}`}
                      </td>
                      <td className="px-3 py-2.5 font-headline font-bold text-nb-text-muted">
                        {sg.lap_duration?.toFixed(3) ?? "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
