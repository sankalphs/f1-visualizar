"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { formatLapTime, formatInterval } from "@/lib/utils";
import {
  Timer,
  Users,
  Wrench,
  ShieldAlert,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { sessionKey, meeting, session } = useSession();

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

  const { data: pitStops = [] } = useQuery({
    queryKey: ["pit", sessionKey],
    queryFn: () => f1Api.pit.bySession(sessionKey),
  });

  const { data: raceControlEvents = [] } = useQuery({
    queryKey: ["race-control", sessionKey],
    queryFn: () => f1Api.raceControl.bySession(sessionKey),
  });

  const { data: overtakes = [] } = useQuery({
    queryKey: ["overtakes", sessionKey],
    queryFn: () => f1Api.overtakes.bySession(sessionKey),
  });

  const { data: intervals = [] } = useQuery({
    queryKey: ["intervals", sessionKey],
    queryFn: () => f1Api.intervals.bySession(sessionKey),
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
      if (!existing || (existing.lap_duration && lap.lap_duration < existing.lap_duration)) {
        map.set(lap.driver_number, lap);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => (a.lap_duration ?? Infinity) - (b.lap_duration ?? Infinity)
    );
  }, [laps]);

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
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
  void isLoading;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      {(meeting || session) && (
        <section className="relative bg-nb-primary text-white p-6 lg:p-10 border-4 border-nb-primary neo-shadow-lg overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="font-headline font-black text-4xl md:text-6xl lg:text-7xl leading-none tracking-tighter uppercase italic">
                {meeting?.meeting_name?.replace(/ Grand Prix/i, "").split(" ").slice(-2).join(" ") || "F1 Dashboard"}
                <br />
                <span className="text-nb-yellow">GRAND PRIX</span>
              </h1>
              <div className="mt-4 flex flex-wrap gap-3 font-headline font-bold uppercase text-sm">
                {meeting && (
                  <span className="bg-nb-yellow text-nb-primary px-3 py-1">
                    <MapPin size={12} className="inline mr-1" />
                    {meeting.circuit_short_name}
                  </span>
                )}
                {session && (
                  <span className="bg-nb-red text-white px-3 py-1">
                    {session.session_name}
                  </span>
                )}
              </div>
            </div>
            {session && (
              <div className="text-right border-l-4 border-nb-yellow pl-6 hidden md:block">
                <p className="font-headline font-black text-xl">
                  {new Date(session.date_start).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="font-headline font-black text-3xl text-nb-yellow">
                  {new Date(session.date_start).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-15 pointer-events-none stripes-pattern" />
        </section>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="DRIVERS" value={drivers.length} loading={driversLoading} />
        <StatCard label="LAPS" value={laps.length} loading={lapsLoading} icon={<Timer size={14} />} />
        <StatCard label="PIT STOPS" value={pitStops.length} icon={<Wrench size={14} />} />
        <StatCard label="RC EVENTS" value={raceControlEvents.length} icon={<ShieldAlert size={14} />} />
        <StatCard label="OVERTAKES" value={overtakes.length} icon={<TrendingUp size={14} />} />
      </div>

      {/* Main Grid: 8/4 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Weather */}
          {weatherLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : latestWeather ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <WeatherCard label="TRACK TEMP" value={`${latestWeather.track_temperature}°C`} />
              <WeatherCard label="AIR TEMP" value={`${latestWeather.air_temperature}°C`} />
              <WeatherCard label="HUMIDITY" value={`${latestWeather.humidity}%`} />
              <WeatherCard label="WIND" value={`${latestWeather.wind_speed} km/h`} />
            </div>
          ) : null}

          {/* Best Laps Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Timer size={16} />
                  TOP LAP TIMES
                </span>
              </CardTitle>
              <Badge variant="yellow">LIVE</Badge>
            </CardHeader>
            {lapsLoading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-nb-surface-dim border-b-2 border-nb-primary font-headline font-black uppercase text-xs">
                      <th className="p-3 border-r-2 border-nb-primary">POS</th>
                      <th className="p-3 border-r-2 border-nb-primary">DRIVER</th>
                      <th className="p-3 border-r-2 border-nb-primary">TEAM</th>
                      <th className="p-3 border-r-2 border-nb-primary">LAP TIME</th>
                      <th className="p-3 border-r-2 border-nb-primary">S1</th>
                      <th className="p-3 border-r-2 border-nb-primary">S2</th>
                      <th className="p-3">S3</th>
                    </tr>
                  </thead>
                  <tbody className="font-headline font-bold text-sm">
                    {bestLaps.slice(0, 8).map((lap, idx) => {
                      const driver = driverMap.get(lap.driver_number);
                      return (
                        <tr
                          key={lap.driver_number}
                          className="border-b-2 border-nb-primary hover:bg-nb-yellow/10 transition-colors"
                        >
                          <td className="p-3 border-r-2 border-nb-primary">
                            <span className={`font-black ${idx === 0 ? "text-nb-red" : ""}`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-1 h-6"
                                style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                              />
                              <span className="italic">
                                {driver?.name_acronym || `#${lap.driver_number}`}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted text-xs">
                            {driver?.team_name || "--"}
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary font-black italic">
                            {formatLapTime(lap.lap_duration)}
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted">
                            {lap.duration_sector_1?.toFixed(3) ?? "--"}
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted">
                            {lap.duration_sector_2?.toFixed(3) ?? "--"}
                          </td>
                          <td className="p-3 text-nb-text-muted">
                            {lap.duration_sector_3?.toFixed(3) ?? "--"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Current Positions */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  CURRENT POSITIONS
                </span>
              </CardTitle>
              <Link
                href="/positions"
                className="bg-white text-nb-primary font-headline font-black text-[10px] px-3 py-1 border border-white hover:bg-nb-yellow transition-colors uppercase"
              >
                TRACK MAP
              </Link>
            </CardHeader>
            {posLoading ? (
              <TableSkeleton rows={10} cols={4} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-nb-surface-dim border-b-2 border-nb-primary font-headline font-black uppercase text-xs">
                      <th className="p-3 border-r-2 border-nb-primary">POS</th>
                      <th className="p-3 border-r-2 border-nb-primary">DRIVER</th>
                      <th className="p-3 border-r-2 border-nb-primary">TEAM</th>
                      <th className="p-3">GAP</th>
                    </tr>
                  </thead>
                  <tbody className="font-headline font-bold text-sm">
                    {latestPositions.slice(0, 10).map((pos) => {
                      const driver = driverMap.get(pos.driver_number);
                      const interval = latestIntervals.find(
                        (i) => i.driver_number === pos.driver_number
                      );
                      return (
                        <tr
                          key={pos.driver_number}
                          className="border-b-2 border-nb-primary hover:bg-nb-yellow/10 transition-colors"
                        >
                          <td className="p-3 border-r-2 border-nb-primary">
                            <span className={`font-black italic ${pos.position <= 3 ? "text-nb-red" : ""}`}>
                              P{pos.position}
                            </span>
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-1 h-6"
                                style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                              />
                              {driver?.name_acronym || `#${pos.driver_number}`}
                            </div>
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted text-xs">
                            {driver?.team_name || "--"}
                          </td>
                          <td className="p-3 font-mono text-xs">
                            {interval
                              ? formatInterval(interval.gap_to_leader)
                              : pos.position === 1
                                ? "LEADER"
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
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Race Control */}
          <Card className="flex flex-col">
            <CardHeader className="bg-nb-red">
              <CardTitle>
                <span className="flex items-center gap-2">
                  <ShieldAlert size={16} />
                  RACE CONTROL
                </span>
              </CardTitle>
            </CardHeader>
            <div className="flex-1 p-4 space-y-3 max-h-80 overflow-y-auto">
              {raceControlEvents.length > 0 ? (
                raceControlEvents
                  .slice(-15)
                  .reverse()
                  .map((rc, idx) => (
                    <div
                      key={idx}
                      className="border-2 border-nb-primary p-3 flex gap-3"
                    >
                      <div className="font-headline font-black text-sm min-w-[50px]">
                        {rc.lap_number ? `L${rc.lap_number}` : "--"}
                      </div>
                      <div className="font-body text-xs font-bold">
                        <span className="block font-headline font-black uppercase text-[10px] text-nb-red">
                          {rc.flag || rc.category}
                        </span>
                        {rc.message}
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-nb-text-muted font-headline font-bold uppercase">
                  No race control events
                </p>
              )}
            </div>
          </Card>

          {/* Pit Stops */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Wrench size={16} />
                  PIT STOPS
                </span>
              </CardTitle>
            </CardHeader>
            <div className="p-4 max-h-80 overflow-x-auto">
              {pitStops.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-nb-primary font-headline font-black uppercase">
                      <th className="p-2">DRIVER</th>
                      <th className="p-2">LAP</th>
                      <th className="p-2">LANE</th>
                      <th className="p-2 text-right">STOP</th>
                    </tr>
                  </thead>
                  <tbody className="font-headline font-bold">
                    {pitStops.map((pit, idx) => {
                      const driver = driverMap.get(pit.driver_number);
                      return (
                        <tr
                          key={idx}
                          className="border-b border-nb-primary/30 hover:bg-nb-yellow/10"
                        >
                          <td className="p-2 italic">
                            {driver?.name_acronym || `#${pit.driver_number}`}
                          </td>
                          <td className="p-2">L{pit.lap_number}</td>
                          <td className="p-2 font-mono text-nb-text-muted">
                            {pit.lane_duration != null ? `${pit.lane_duration.toFixed(2)}s` : "--"}
                          </td>
                          <td className="p-2 font-mono text-right text-nb-red font-black">
                            {pit.stop_duration != null ? `${pit.stop_duration.toFixed(2)}s` : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-nb-text-muted font-headline font-bold uppercase">
                  No pit stops recorded
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  icon,
}: {
  label: string;
  value: number;
  loading?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-nb-surface border-4 border-nb-primary p-4 neo-shadow-sm flex flex-col justify-between h-28">
      <span className="text-[10px] font-black uppercase tracking-widest font-headline flex items-center gap-1">
        {icon}
        {label}
      </span>
      {loading ? (
        <Skeleton className="h-8 w-12" />
      ) : (
        <span className="font-headline font-black text-3xl">{value}</span>
      )}
    </div>
  );
}

function WeatherCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-nb-surface border-4 border-nb-primary p-4 neo-shadow-sm flex flex-col justify-between h-24">
      <span className="text-[10px] font-black uppercase tracking-widest font-headline text-nb-text-muted">
        {label}
      </span>
      <span className="font-headline font-black text-2xl">{value}</span>
    </div>
  );
}
