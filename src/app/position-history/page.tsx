"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function PositionHistoryPage() {
  const { sessionKey } = useSession();
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["positions-history", sessionKey],
    queryFn: () => f1Api.position.list({ session_key: sessionKey }),
  });

  const { data: laps = [] } = useQuery({
    queryKey: ["laps", sessionKey],
    queryFn: () => f1Api.laps.list({ session_key: sessionKey }),
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const allDriverNumbers = useMemo(() => {
    const set = new Set<number>();
    for (const p of positions) set.add(p.driver_number);
    return Array.from(set).sort((a, b) => {
      const da = driverMap.get(a);
      const db = driverMap.get(b);
      return (da?.name_acronym || `${a}`).localeCompare(db?.name_acronym || `${b}`);
    });
  }, [positions, driverMap]);

  // Initialize selected drivers on first load
  useMemo(() => {
    if (selectedDrivers.length === 0 && allDriverNumbers.length > 0) {
      setSelectedDrivers(allDriverNumbers.slice(0, 8));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDriverNumbers]);

  // Build chart data by sampling positions into time buckets
  const { chartData } = useMemo(() => {
    if (positions.length === 0) return { chartData: [], timeLabels: [] };

    // Get time range
    const timestamps = positions.map((p) => new Date(p.date).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);

    // Create evenly spaced time buckets (up to 60 points)
    const numBuckets = Math.min(60, Math.max(20, Math.floor(positions.length / 50)));
    const bucketSize = (maxTime - minTime) / numBuckets;

    // Get lap timestamps for better x-axis labels
    const lapTimes = laps
      .filter((l) => l.date_start)
      .map((l) => ({
        lap: l.lap_number,
        time: new Date(l.date_start!).getTime(),
      }))
      .sort((a, b) => a.time - b.time);

    // Build position samples per driver per bucket
    const driverBuckets = new Map<number, Map<number, number>>();
    for (const p of positions) {
      const bucketIdx = Math.min(
        numBuckets - 1,
        Math.floor((new Date(p.date).getTime() - minTime) / bucketSize)
      );
      if (!driverBuckets.has(p.driver_number))
        driverBuckets.set(p.driver_number, new Map());
      driverBuckets.get(p.driver_number)!.set(bucketIdx, p.position);
    }

    // Forward-fill missing buckets
    for (const [, buckets] of driverBuckets) {
      let lastPos = 20;
      for (let i = 0; i < numBuckets; i++) {
        if (buckets.has(i)) {
          lastPos = buckets.get(i)!;
        } else {
          buckets.set(i, lastPos);
        }
      }
    }

    // Find the closest lap number for each bucket
    const bucketLap = (idx: number): string => {
      const bucketTime = minTime + idx * bucketSize;
      if (lapTimes.length === 0) return `${idx + 1}`;
      let closest = lapTimes[0];
      let minDist = Infinity;
      for (const lt of lapTimes) {
        const dist = Math.abs(lt.time - bucketTime);
        if (dist < minDist) {
          minDist = dist;
          closest = lt;
        }
      }
      return `L${closest.lap}`;
    };

    const labels: string[] = [];
    const data = [];
    for (let i = 0; i < numBuckets; i++) {
      const label = bucketLap(i);
      labels.push(label);
      const point: Record<string, unknown> = { tick: label, bucket: i };
      for (const [dn, buckets] of driverBuckets) {
        point[`pos_${dn}`] = buckets.get(i);
      }
      data.push(point);
    }

    return { chartData: data };
  }, [positions, laps]);

  const colors = [
    "#e10600", "#3671C6", "#FF8700", "#00D2BE", "#27F4D2",
    "#B6BABD", "#52E252", "#0600EF", "#FF1801", "#FFFFFF",
    "#1E41FF", "#006F62", "#27F4D2", "#0090FF", "#1E5BC6",
    "#FD4BC7", "#FF8700", "#FFFFFF", "#B6BABD", "#00D2BE",
  ];

  const toggleDriver = (num: number) => {
    setSelectedDrivers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <TrendingUp className="mr-2 inline" size={24} />
            Position History
          </h1>
          <p className="text-sm text-zinc-500">
            How each driver&apos;s position changed throughout the session
          </p>
        </div>
        <SessionSelector />
      </div>

      {/* Driver selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Drivers</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {allDriverNumbers.map((dn) => {
            const d = driverMap.get(dn);
            return (
              <button
                key={dn}
                onClick={() => toggleDriver(dn)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedDrivers.includes(dn)
                    ? "border-red-600 bg-red-600/20 text-red-400"
                    : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
                style={{
                  borderColor: selectedDrivers.includes(dn)
                    ? `#${d?.team_colour || "888"}`
                    : undefined,
                }}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: `#${d?.team_colour || "888"}` }}
                />
                {d?.name_acronym || `#${dn}`}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Chart */}
      {isLoading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : chartData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Position Over Session Duration</CardTitle>
          </CardHeader>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="tick"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  interval={Math.max(0, Math.floor(chartData.length / 15))}
                />
                <YAxis
                  reversed
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  domain={[1, 20]}
                  ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]}
                  label={{
                    value: "Position",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#71717a",
                    fontSize: 12,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                  }}
                  formatter={(value, name) => {
                    const dn = Number(String(name).split("_")[1]);
                    const d = driverMap.get(dn);
                    return [`P${value}`, d?.name_acronym || `#${dn}`];
                  }}
                />
                <Legend
                  formatter={(value: string) => {
                    const dn = Number(value.split("_")[1]);
                    const d = driverMap.get(dn);
                    return d?.name_acronym || `#${dn}`;
                  }}
                />
                {selectedDrivers.map((dn, i) => (
                  <Line
                    key={dn}
                    type="monotone"
                    dataKey={`pos_${dn}`}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2}
                    dot={false}
                    name={`pos_${dn}`}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card className="p-8">
          <p className="text-center text-zinc-500">
            No position history data available for this session
          </p>
        </Card>
      )}

      {/* Position change summary */}
      {positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Position Change Summary</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">Driver</th>
                  <th className="py-2 text-left font-medium">Start</th>
                  <th className="py-2 text-left font-medium">Current</th>
                  <th className="py-2 text-left font-medium">Change</th>
                  <th className="py-2 text-left font-medium">Best</th>
                  <th className="py-2 text-left font-medium">Worst</th>
                </tr>
              </thead>
              <tbody>
                {allDriverNumbers.map((dn) => {
                  const d = driverMap.get(dn);
                  const driverPositions = positions
                    .filter((p) => p.driver_number === dn)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                  if (driverPositions.length === 0) return null;

                  const startPos = driverPositions[0].position;
                  const endPos = driverPositions[driverPositions.length - 1].position;
                  const change = startPos - endPos;
                  const bestPos = Math.min(...driverPositions.map((p) => p.position));
                  const worstPos = Math.max(...driverPositions.map((p) => p.position));

                  return (
                    <tr
                      key={dn}
                      className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                    >
                      <td className="py-2.5 font-medium">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: `#${d?.team_colour || "888"}` }}
                          />
                          {d?.name_acronym || `#${dn}`}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <Badge variant="outline">P{startPos}</Badge>
                      </td>
                      <td className="py-2.5">
                        <Badge variant={endPos <= 3 ? "success" : "default"}>P{endPos}</Badge>
                      </td>
                      <td className="py-2.5 font-mono font-semibold">
                        <span
                          className={
                            change > 0
                              ? "text-emerald-400"
                              : change < 0
                                ? "text-red-400"
                                : "text-zinc-400"
                          }
                        >
                          {change > 0 ? `+${change}` : change === 0 ? "0" : change}
                        </span>
                      </td>
                      <td className="py-2.5 text-zinc-400">P{bestPos}</td>
                      <td className="py-2.5 text-zinc-400">P{worstPos}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
