"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
          <h1 className="text-2xl font-bold text-zinc-100">
            <ArrowLeftRight className="mr-2 inline" size={24} />
            Intervals
          </h1>
          <p className="text-sm text-zinc-500">
            Real-time intervals between drivers and gap to leader
          </p>
        </div>
        <SessionSelector />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Intervals</CardTitle>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton rows={20} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">Driver</th>
                  <th className="py-2 text-left font-medium">Team</th>
                  <th className="py-2 text-left font-medium">Gap to Leader</th>
                  <th className="py-2 text-left font-medium">Interval</th>
                  <th className="py-2 text-left font-medium">Last Updated</th>
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
                        className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                      >
                        <td className="py-2.5 font-medium">
                          <div className="flex items-center gap-2">
                            <Badge variant={idx === 0 ? "success" : "default"}>
                              P{idx + 1}
                            </Badge>
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: `#${driver?.team_colour || "888"}`,
                              }}
                            />
                            {driver?.name_acronym || `#${interval.driver_number}`}
                          </div>
                        </td>
                        <td className="py-2.5 text-zinc-400">
                          {driver?.team_name || "Unknown"}
                        </td>
                        <td className="py-2.5 font-mono text-zinc-200">
                          {interval.gap_to_leader === null
                            ? "Leader"
                            : formatInterval(interval.gap_to_leader)}
                        </td>
                        <td className="py-2.5 font-mono text-zinc-400">
                          {interval.interval === null
                            ? "-"
                            : formatInterval(interval.interval)}
                        </td>
                        <td className="py-2.5 text-xs text-zinc-500">
                          {interval.date ? new Date(interval.date).toLocaleTimeString() : "--"}
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
          <CardTitle>Interval History (Recent 50)</CardTitle>
        </CardHeader>
        <div className="max-h-96 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-2 text-left font-medium">Time</th>
                <th className="py-2 text-left font-medium">Driver</th>
                <th className="py-2 text-left font-medium">Gap to Leader</th>
                <th className="py-2 text-left font-medium">Interval</th>
              </tr>
            </thead>
            <tbody>
              {intervals.slice(-50).reverse().map((interval, idx) => {
                const driver = driverMap.get(interval.driver_number);
                return (
                  <tr
                    key={idx}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                  >
                    <td className="py-2 text-xs text-zinc-500">
                      {interval.date ? new Date(interval.date).toLocaleTimeString() : "--"}
                    </td>
                    <td className="py-2 font-medium">
                      {driver?.name_acronym || `#${interval.driver_number}`}
                    </td>
                    <td className="py-2 font-mono text-zinc-400">
                      {interval.gap_to_leader === null
                        ? "Leader"
                        : formatInterval(interval.gap_to_leader)}
                    </td>
                    <td className="py-2 font-mono text-zinc-400">
                      {formatInterval(interval.interval)}
                    </td>
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
