"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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

  const colors = ["#e63b2e", "#0055ff", "#ffcc00", "#00d2be", "#1a1a1a"];

  const toggleDriver = (num: number) => {
    setSelectedDrivers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="bg-nb-primary text-white px-3 py-1 text-xs font-black uppercase font-headline">
            Car Data
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none">
            Telemetry
          </h1>
          <p className="text-sm font-bold font-headline text-nb-text-muted uppercase mt-1">
            Real-time car data: speed, throttle, brake, RPM, gear
          </p>
        </div>
      </div>

      {/* Driver Selection */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4 font-headline font-black uppercase tracking-tighter">
          SELECT DRIVERS
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {drivers.map((d) => (
            <button
              key={d.driver_number}
              onClick={() => toggleDriver(d.driver_number)}
              className={`border-2 border-nb-primary px-3 py-1.5 text-xs font-headline font-bold uppercase transition-all ${
                selectedDrivers.includes(d.driver_number)
                  ? "bg-nb-yellow text-nb-primary shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                  : "bg-nb-surface text-nb-text hover:bg-nb-blue hover:text-white"
              }`}
              style={{
                borderColor: selectedDrivers.includes(d.driver_number)
                  ? `#${d.team_colour || "888"}`
                  : undefined,
              }}
            >
              <span
                className="mr-1.5 inline-block h-2 w-2"
                style={{ backgroundColor: `#${d.team_colour || "888"}` }}
              />
              {d.name_acronym || `#${d.driver_number}`}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="space-y-6">
          <TelemetryChart
            title="VELOCITY"
            unit="KM/H"
            data={chartData}
            selectedDrivers={selectedDrivers}
            driverMap={driverMap}
            colors={colors}
            dataKeyPrefix="speed"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TelemetryChart
              title="THROTTLE %"
              unit="%"
              data={chartData}
              selectedDrivers={selectedDrivers}
              driverMap={driverMap}
              colors={colors}
              dataKeyPrefix="throttle"
              small
            />
            <TelemetryChart
              title="BRAKE"
              unit=""
              data={chartData}
              selectedDrivers={selectedDrivers}
              driverMap={driverMap}
              colors={colors}
              dataKeyPrefix="brake"
              small
            />
            <TelemetryChart
              title="RPM"
              unit="rpm"
              data={chartData}
              selectedDrivers={selectedDrivers}
              driverMap={driverMap}
              colors={colors}
              dataKeyPrefix="rpm"
              small
            />
            <TelemetryChart
              title="GEAR"
              unit=""
              data={chartData}
              selectedDrivers={selectedDrivers}
              driverMap={driverMap}
              colors={colors}
              dataKeyPrefix="gear"
              small
              isStep
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TelemetryChart({
  title,
  unit,
  data,
  selectedDrivers,
  driverMap,
  colors,
  dataKeyPrefix,
  small,
  isStep,
}: {
  title: string;
  unit: string;
  data: Record<string, unknown>[];
  selectedDrivers: number[];
  driverMap: Map<number, { name_acronym: string; team_colour: string }>;
  colors: string[];
  dataKeyPrefix: string;
  small?: boolean;
  isStep?: boolean;
}) {
  return (
    <div className="border-4 border-nb-primary bg-nb-primary p-4 md:p-6 relative">
      <div className="absolute top-4 right-6 flex gap-4 text-[10px] font-headline font-black uppercase">
        {selectedDrivers.map((dn, i) => (
          <div key={dn} className="flex items-center gap-2" style={{ color: colors[i % colors.length] }}>
            <span className="w-3 h-0.5" style={{ backgroundColor: colors[i % colors.length] }} />
            {driverMap.get(dn)?.name_acronym || `#${dn}`}
          </div>
        ))}
      </div>
      <div className="mb-3">
        <h3 className="text-white font-headline font-black text-lg italic uppercase tracking-tighter">
          {title}{" "}
          {unit && <span className="text-xs font-normal not-italic text-zinc-400">{unit}</span>}
        </h3>
      </div>
      <div className={`${small ? "h-32" : "h-64"} telemetry-grid relative overflow-hidden border-b-2 border-zinc-700`}>
        <ResponsiveContainer width="100%" height="100%">
          {isStep ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="index" tick={{ fill: "#666", fontSize: 10 }} />
              <YAxis tick={{ fill: "#666", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "2px solid #ffcc00",
                  borderRadius: 0,
                }}
              />
              {selectedDrivers.map((dn, i) => (
                <Line
                  key={dn}
                  type="stepAfter"
                  dataKey={`${dataKeyPrefix}_${dn}`}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  name={driverMap.get(dn)?.name_acronym || `#${dn}`}
                />
              ))}
            </LineChart>
          ) : (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="index" tick={{ fill: "#666", fontSize: 10 }} />
              <YAxis tick={{ fill: "#666", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "2px solid #ffcc00",
                  borderRadius: 0,
                }}
                formatter={(value) => [`${value} ${unit}`, ""]}
              />
              {selectedDrivers.map((dn, i) => (
                <Area
                  key={dn}
                  type="monotone"
                  dataKey={`${dataKeyPrefix}_${dn}`}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={false}
                  name={driverMap.get(dn)?.name_acronym || `#${dn}`}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
