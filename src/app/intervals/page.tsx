"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatInterval } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";
import { useMemo } from "react";

export default function IntervalsPage() {
  const { sessionKey } = useSession();

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: intervals = [], isLoading } = useQuery({
    queryKey: ["intervals", sessionKey],
    queryFn: () => f1Api.intervals.bySession(sessionKey),
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const latestIntervals = useMemo(() => {
    const map = new Map<number, (typeof intervals)[0]>();
    for (const i of intervals) {
      const existing = map.get(i.driver_number);
      if (!existing || new Date(i.date) > new Date(existing.date)) {
        map.set(i.driver_number, i);
      }
    }
    return Array.from(map.values());
  }, [intervals]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-headline font-black uppercase text-xs tracking-tighter text-nb-text-muted">
            <ArrowLeftRight className="mr-1 inline" size={14} />
            Timing
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none text-nb-text">
            Intervals
          </h1>
        </div>
        <SessionSelector />
      </div>

      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Current Intervals</h2>
        </div>
        {isLoading ? (
          <TableSkeleton rows={20} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-headline font-bold">
              <thead>
                <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                  <th className="py-2 px-3 text-left">Driver</th>
                  <th className="py-2 px-3 text-left">Team</th>
                  <th className="py-2 px-3 text-left">Gap to Leader</th>
                  <th className="py-2 px-3 text-left">Interval</th>
                  <th className="py-2 px-3 text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {latestIntervals
                  .sort((a, b) => {
                    const gapA = typeof a.gap_to_leader === "number" ? a.gap_to_leader : 9999;
                    const gapB = typeof b.gap_to_leader === "number" ? b.gap_to_leader : 9999;
                    return gapA - gapB;
                  })
                  .map((interval, idx) => {
                    const driver = driverMap.get(interval.driver_number);
                    return (
                      <tr
                        key={interval.driver_number}
                        className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`border-2 border-nb-primary font-headline font-black uppercase text-[10px] px-2 py-0.5 ${idx === 0 ? "bg-nb-yellow text-nb-text" : "bg-nb-surface-dim text-nb-text"}`}>
                              P{idx + 1}
                            </span>
                            <span
                              className="inline-block w-1 h-6"
                              style={{
                                backgroundColor: `#${driver?.team_colour || "888"}`,
                              }}
                            />
                            {driver?.name_acronym || `#${interval.driver_number}`}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-nb-text-muted">
                          {driver?.team_name || "Unknown"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-nb-text">
                          {interval.gap_to_leader === null
                            ? "Leader"
                            : formatInterval(interval.gap_to_leader)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-nb-text-muted">
                          {interval.interval === null
                            ? "-"
                            : formatInterval(interval.interval)}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-nb-text-muted">
                          {interval.date ? new Date(interval.date).toLocaleTimeString() : "--"}
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
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Interval History (Recent 50)</h2>
        </div>
        <div className="max-h-96 overflow-x-auto">
          <table className="w-full text-sm font-headline font-bold">
            <thead>
              <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                <th className="py-2 px-3 text-left">Time</th>
                <th className="py-2 px-3 text-left">Driver</th>
                <th className="py-2 px-3 text-left">Gap to Leader</th>
                <th className="py-2 px-3 text-left">Interval</th>
              </tr>
            </thead>
            <tbody>
              {intervals.slice(-50).reverse().map((interval, idx) => {
                const driver = driverMap.get(interval.driver_number);
                return (
                  <tr
                    key={idx}
                    className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                  >
                    <td className="py-2 px-3 text-xs text-nb-text-muted">
                      {interval.date ? new Date(interval.date).toLocaleTimeString() : "--"}
                    </td>
                    <td className="py-2 px-3">
                      {driver?.name_acronym || `#${interval.driver_number}`}
                    </td>
                    <td className="py-2 px-3 font-mono text-nb-text-muted">
                      {interval.gap_to_leader === null
                        ? "Leader"
                        : formatInterval(interval.gap_to_leader)}
                    </td>
                    <td className="py-2 px-3 font-mono text-nb-text-muted">
                      {formatInterval(interval.interval)}
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
