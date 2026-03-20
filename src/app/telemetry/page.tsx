"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Gauge } from "lucide-react";
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
  AreaChart,
  Area,
} from "recharts";

export default function TelemetryPage() {
  const { sessionKey } = useSession();
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([1, 44]);

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: carData = [], isLoading } = useQuery({
    queryKey: ["car-data", sessionKey, selectedDrivers],
    queryFn: async () => {
      const results = await Promise.all(
        selectedDrivers.map((dn) =>
          f1Api.carData.byDriver(sessionKey, dn)
        )
      );
      return results.flat();
    },
    enabled: selectedDrivers.length > 0,
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const chartData = useMemo(() => {
    const byDriver = new Map<number, typeof carData>();
    for (const cd of carData) {
      if (!byDriver.has(cd.driver_number)) byDriver.set(cd.driver_number, []);
      byDriver.get(cd.driver_number)!.push(cd);
    }

    const points: Record<string, unknown>[] = [];
    const maxLength = Math.max(
      ...Array.from(byDriver.values()).map((d) => d.length)
    );

    for (let i = 0; i < Math.min(maxLength, 500); i += 1) {
      const point: Record<string, unknown> = { index: i };
      for (const [dn, data] of byDriver) {
        if (data[i]) {
          point[`speed_${dn}`] = data[i].speed;
          point[`throttle_${dn}`] = data[i].throttle;
          point[`brake_${dn}`] = data[i].brake;
          point[`rpm_${dn}`] = data[i].rpm;
          point[`gear_${dn}`] = data[i].n_gear;
        }
      }
      points.push(point);
    }
    return points;
  }, [carData]);

  const colors = ["#e10600", "#3671C6", "#FF8700", "#00D2BE", "#27F4D2"];

  const toggleDriver = (num: number) => {
    setSelectedDrivers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <Gauge className="mr-2 inline" size={24} />
            Telemetry
          </h1>
          <p className="text-sm text-zinc-500">
            Real-time car data: speed, throttle, brake, RPM, gear
          </p>
        </div>
        <SessionSelector />
      </div>

      {/* Driver Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Drivers</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {drivers.map((d) => (
            <button
              key={d.driver_number}
              onClick={() => toggleDriver(d.driver_number)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedDrivers.includes(d.driver_number)
                  ? "border-red-600 bg-red-600/20 text-red-400"
                  : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
              style={{
                borderColor: selectedDrivers.includes(d.driver_number)
                  ? `#${d.team_colour}`
                  : undefined,
              }}
            >
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: `#${d.team_colour}` }}
              />
              {d.name_acronym}
            </button>
          ))}
        </div>
      </Card>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Speed */}
          <TelemetryChart
            title="Speed (km/h)"
            data={chartData}
            selectedDrivers={selectedDrivers}
            driverMap={driverMap}
            colors={colors}
            dataKeyPrefix="speed"
            unit="km/h"
          />

          {/* Throttle */}
          <TelemetryChart
            title="Throttle (%)"
            data={chartData}
            selectedDrivers={selectedDrivers}
            driverMap={driverMap}
            colors={colors}
            dataKeyPrefix="throttle"
            unit="%"
          />

          {/* Brake */}
          <TelemetryChart
            title="Brake"
            data={chartData}
            selectedDrivers={selectedDrivers}
            driverMap={driverMap}
            colors={colors}
            dataKeyPrefix="brake"
            unit=""
          />

          {/* RPM */}
          <TelemetryChart
            title="RPM"
            data={chartData}
            selectedDrivers={selectedDrivers}
            driverMap={driverMap}
            colors={colors}
            dataKeyPrefix="rpm"
            unit="rpm"
          />

          {/* Gear */}
          <TelemetryChart
            title="Gear"
            data={chartData}
            selectedDrivers={selectedDrivers}
            driverMap={driverMap}
            colors={colors}
            dataKeyPrefix="gear"
            unit=""
            isStep
          />
        </div>
      )}
    </div>
  );
}

function TelemetryChart({
  title,
  data,
  selectedDrivers,
  driverMap,
  colors,
  dataKeyPrefix,
  unit,
  isStep,
}: {
  title: string;
  data: Record<string, unknown>[];
  selectedDrivers: number[];
  driverMap: Map<number, { name_acronym: string; team_colour: string }>;
  colors: string[];
  dataKeyPrefix: string;
  unit: string;
  isStep?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {isStep ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="index" tick={{ fill: "#71717a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
              />
              {selectedDrivers.map((dn, i) => (
                <Line
                  key={dn}
                  type="stepAfter"
                  dataKey={`${dataKeyPrefix}_${dn}`}
                  stroke={colors[i % colors.length]}
                  strokeWidth={1.5}
                  dot={false}
                  name={driverMap.get(dn)?.name_acronym || `#${dn}`}
                />
              ))}
            </LineChart>
          ) : (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="index" tick={{ fill: "#71717a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value} ${unit}`, ""]}
              />
              <Legend />
              {selectedDrivers.map((dn, i) => (
                <Area
                  key={dn}
                  type="monotone"
                  dataKey={`${dataKeyPrefix}_${dn}`}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                  dot={false}
                  name={driverMap.get(dn)?.name_acronym || `#${dn}`}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
