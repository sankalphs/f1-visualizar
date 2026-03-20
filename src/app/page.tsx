"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { SessionSelector, useSession } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { formatLapTime, formatInterval } from "@/lib/utils";
import {
  Clock,
  CloudSun,
  Timer,
  Users,
  Gauge,
  Trophy,
  Wrench,
  ShieldAlert,
} from "lucide-react";
import { useMemo } from "react";

export default function DashboardPage() {
  const { sessionKey } = useSession();

  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: laps = [], isLoading: lapsLoading } = useQuery({
    queryKey: ["laps", sessionKey],
    queryFn: () => f1Api.laps.list({ session_key: sessionKey }),
  });

  const { data: positions = [], isLoading: posLoading } = useQuery({
    queryKey: ["positions", sessionKey],
    queryFn: () => f1Api.position.list({ session_key: sessionKey }),
  });

  const { data: weather = [], isLoading: weatherLoading } = useQuery({
    queryKey: ["weather", sessionKey],
    queryFn: () => f1Api.weather.bySession(sessionKey),
  });

  const { data: pitStops = [], isLoading: pitLoading } = useQuery({
    queryKey: ["pit", sessionKey],
    queryFn: () => f1Api.pit.bySession(sessionKey),
  });

  const { data: raceControlEvents = [], isLoading: rcLoading } = useQuery({
    queryKey: ["race-control", sessionKey],
    queryFn: () => f1Api.raceControl.bySession(sessionKey),
  });

  const { data: overtakes = [], isLoading: overtakesLoading } = useQuery({
    queryKey: ["overtakes", sessionKey],
    queryFn: () => f1Api.overtakes.bySession(sessionKey),
  });

  const { data: intervals = [] } = useQuery({
    queryKey: ["intervals", sessionKey],
    queryFn: () => f1Api.intervals.bySession(sessionKey),
  });

  const { data: teamRadio = [] } = useQuery({
    queryKey: ["team-radio", sessionKey],
    queryFn: () => f1Api.teamRadio.list({ session_key: sessionKey }),
  });

  const latestWeather = weather.length > 0 ? weather[weather.length - 1] : null;

  const latestIntervals = useMemo(() => {
    const map = new Map<number, (typeof intervals)[0]>();
    for (const i of intervals) {
      map.set(i.driver_number, i);
    }
    return Array.from(map.values());
  }, [intervals]);

  const bestLaps = useMemo(() => {
    const map = new Map<number, (typeof laps)[0]>();
    for (const lap of laps) {
      if (lap.is_pit_out_lap || !lap.lap_duration) continue;
      const existing = map.get(lap.driver_number);
      if (
        !existing ||
        (existing.lap_duration && lap.lap_duration < existing.lap_duration)
      ) {
        map.set(lap.driver_number, lap);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => (a.lap_duration ?? Infinity) - (b.lap_duration ?? Infinity)
    );
  }, [laps]);

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) {
      map.set(d.driver_number, d);
    }
    return map;
  }, [drivers]);

  const latestPositions = useMemo(() => {
    const map = new Map<number, (typeof positions)[0]>();
    for (const p of positions) {
      const existing = map.get(p.driver_number);
      if (!existing || new Date(p.date) > new Date(existing.date)) {
        map.set(p.driver_number, p);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.position - b.position);
  }, [positions]);

  const isLoading = driversLoading || lapsLoading || posLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">F1 Dashboard</h1>
          <p className="text-sm text-zinc-500">
            Real-time Formula 1 data visualization
          </p>
        </div>
        <SessionSelector />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <QuickStat
          icon={Users}
          label="Drivers"
          value={drivers.length}
          loading={driversLoading}
        />
        <QuickStat
          icon={Timer}
          label="Laps Recorded"
          value={laps.length}
          loading={lapsLoading}
        />
        <QuickStat
          icon={Wrench}
          label="Pit Stops"
          value={pitStops.length}
          loading={pitLoading}
        />
        <QuickStat
          icon={ShieldAlert}
          label="RC Events"
          value={raceControlEvents.length}
          loading={rcLoading}
        />
        <QuickStat
          icon={Gauge}
          label="Overtakes"
          value={overtakes.length}
          loading={overtakesLoading}
        />
        <QuickStat
          icon={Clock}
          label="Radio Clips"
          value={teamRadio.length}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Current Standings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Trophy size={14} className="text-yellow-500" />
                Current Positions
              </span>
            </CardTitle>
          </CardHeader>
          {posLoading ? (
            <TableSkeleton rows={10} cols={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="py-2 text-left font-medium">Pos</th>
                    <th className="py-2 text-left font-medium">Driver</th>
                    <th className="py-2 text-left font-medium">Team</th>
                    <th className="py-2 text-left font-medium">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {latestPositions.map((pos) => {
                    const driver = driverMap.get(pos.driver_number);
                    const interval = latestIntervals.find(
                      (i) => i.driver_number === pos.driver_number
                    );
                    return (
                      <tr
                        key={pos.driver_number}
                        className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                      >
                        <td className="py-2.5">
                          <Badge
                            variant={pos.position <= 3 ? "success" : "default"}
                          >
                            P{pos.position}
                          </Badge>
                        </td>
                        <td className="py-2.5 font-medium">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: `#${driver?.team_colour || "888"}`,
                              }}
                            />
                            <span className="text-zinc-100">
                              {driver?.name_acronym || `#${pos.driver_number}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 text-zinc-400">
                          {driver?.team_name || "Unknown"}
                        </td>
                        <td className="py-2.5 font-mono text-zinc-400">
                          {interval
                            ? formatInterval(interval.gap_to_leader)
                            : pos.position === 1
                              ? "Leader"
                              : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Weather */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <CloudSun size={14} className="text-blue-400" />
                Weather
              </span>
            </CardTitle>
          </CardHeader>
          {weatherLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : latestWeather ? (
            <div className="grid grid-cols-2 gap-3">
              <WeatherItem
                label="Track Temp"
                value={`${latestWeather.track_temperature}°C`}
              />
              <WeatherItem
                label="Air Temp"
                value={`${latestWeather.air_temperature}°C`}
              />
              <WeatherItem
                label="Humidity"
                value={`${latestWeather.humidity}%`}
              />
              <WeatherItem
                label="Wind"
                value={`${latestWeather.wind_speed} m/s`}
              />
              <WeatherItem
                label="Pressure"
                value={`${latestWeather.pressure} mbar`}
              />
              <WeatherItem
                label="Rainfall"
                value={latestWeather.rainfall ? "Yes" : "No"}
              />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No weather data available</p>
          )}
        </Card>
      </div>

      {/* Best Laps */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Timer size={14} className="text-emerald-400" />
              Best Lap Times
            </span>
          </CardTitle>
        </CardHeader>
        {lapsLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">Rank</th>
                  <th className="py-2 text-left font-medium">Driver</th>
                  <th className="py-2 text-left font-medium">Team</th>
                  <th className="py-2 text-left font-medium">Best Lap</th>
                  <th className="py-2 text-left font-medium">S1</th>
                  <th className="py-2 text-left font-medium">S2</th>
                  <th className="py-2 text-left font-medium">S3</th>
                  <th className="py-2 text-left font-medium">Speed</th>
                </tr>
              </thead>
              <tbody>
                {bestLaps.map((lap, idx) => {
                  const driver = driverMap.get(lap.driver_number);
                  return (
                    <tr
                      key={lap.driver_number}
                      className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                    >
                      <td className="py-2.5">
                        <Badge variant={idx === 0 ? "success" : "default"}>
                          {idx + 1}
                        </Badge>
                      </td>
                      <td className="py-2.5 font-medium">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: `#${driver?.team_colour || "888"}`,
                            }}
                          />
                          {driver?.name_acronym || `#${lap.driver_number}`}
                        </div>
                      </td>
                      <td className="py-2.5 text-zinc-400">
                        {driver?.team_name || "Unknown"}
                      </td>
                      <td className="py-2.5 font-mono font-semibold text-zinc-100">
                        {formatLapTime(lap.lap_duration)}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {lap.duration_sector_1?.toFixed(3) ?? "--"}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {lap.duration_sector_2?.toFixed(3) ?? "--"}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {lap.duration_sector_3?.toFixed(3) ?? "--"}
                      </td>
                      <td className="py-2.5 font-mono text-zinc-400">
                        {lap.st_speed ? `${lap.st_speed} km/h` : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Race Control & Pit Stops */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-400" />
                Recent Race Control
              </span>
            </CardTitle>
          </CardHeader>
          {rcLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : raceControlEvents.length > 0 ? (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {raceControlEvents
                .slice(-20)
                .reverse()
                .map((rc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-2.5"
                  >
                    <div className="flex-1">
                      <p className="text-xs text-zinc-300">{rc.message}</p>
                      <p className="text-xs text-zinc-600">
                        {rc.date ? new Date(rc.date).toLocaleTimeString() : "--"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No race control events</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Wrench size={14} className="text-orange-400" />
                Pit Stops
              </span>
            </CardTitle>
          </CardHeader>
          {pitLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : pitStops.length > 0 ? (
            <div className="max-h-64 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="py-2 text-left font-medium">Driver</th>
                    <th className="py-2 text-left font-medium">Lap</th>
                    <th className="py-2 text-left font-medium">Lane</th>
                    <th className="py-2 text-left font-medium">Stop</th>
                  </tr>
                </thead>
                <tbody>
                  {pitStops.map((pit, idx) => {
                    const driver = driverMap.get(pit.driver_number);
                    return (
                      <tr
                        key={idx}
                        className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                      >
                        <td className="py-2.5 font-medium">
                          {driver?.name_acronym || `#${pit.driver_number}`}
                        </td>
                        <td className="py-2.5">L{pit.lap_number}</td>
                        <td className="py-2.5 font-mono text-zinc-400">
                          {pit.lane_duration != null ? `${pit.lane_duration.toFixed(2)}s` : "--"}
                        </td>
                        <td className="py-2.5 font-mono text-zinc-400">
                          {pit.stop_duration != null
                            ? `${pit.stop_duration.toFixed(2)}s`
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No pit stops recorded</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-zinc-800 p-2">
          <Icon size={16} />
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          {loading ? (
            <Skeleton className="h-5 w-10" />
          ) : (
            <p className="text-lg font-bold text-zinc-100">{value}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function WeatherItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-900/50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  );
}
