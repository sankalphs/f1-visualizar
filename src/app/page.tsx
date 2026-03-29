"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { formatLapTime, formatInterval } from "@/lib/utils";
import {
  Timer,
  Users,
  Wrench,
  ShieldAlert,
  TrendingUp,
  MapPin,
  Radio,
  ArrowRight,
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
    refetchInterval: 60_000,
  });

  const { data: positions = [], isLoading: posLoading } = useQuery({
    queryKey: ["positions", sessionKey],
    queryFn: () => f1Api.position.list({ session_key: sessionKey }),
    refetchInterval: 60_000,
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
    refetchInterval: 60_000,
  });

  const latestWeather = weather.length > 0 ? weather[weather.length - 1] : null;

  const latestIntervals = useMemo(() => {
    const map = new Map<number, (typeof intervals)[0]>();
    for (const i of intervals) map.set(i.driver_number, i);
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

      {/* Quick Stats Row — each links to its page */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link href="/drivers">
          <StatCard label="DRIVERS" value={drivers.length} loading={driversLoading} />
        </Link>
        <Link href="/laps">
          <StatCard label="LAPS" value={laps.length} loading={lapsLoading} icon={<Timer size={14} />} />
        </Link>
        <Link href="/pit">
          <StatCard label="PIT STOPS" value={pitStops.length} icon={<Wrench size={14} />} />
        </Link>
        <Link href="/race-control">
          <StatCard label="RC EVENTS" value={raceControlEvents.length} icon={<ShieldAlert size={14} />} />
        </Link>
        <Link href="/overtakes">
          <StatCard label="OVERTAKES" value={overtakes.length} icon={<TrendingUp size={14} />} />
        </Link>
      </div>

      {/* Main Grid: 8/4 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Weather — links to /weather */}
          <Link href="/weather" className="block">
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
          </Link>

          {/* Best Laps Table — links to /laps */}
          <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
            <Link href="/laps" className="block">
              <div className="bg-nb-primary text-white p-4 flex justify-between items-center hover:bg-nb-red transition-colors">
                <h2 className="font-headline font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <Timer size={16} />
                  TOP LAP TIMES
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                  VIEW ALL <ArrowRight size={12} />
                </span>
              </div>
            </Link>
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
                            <span className={`font-black ${idx === 0 ? "text-nb-red" : "text-nb-text"}`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-1 h-6"
                                style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                              />
                              <span className="italic text-nb-text">
                                {driver?.name_acronym || `#${lap.driver_number}`}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted text-xs">
                            {driver?.team_name || "--"}
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary font-black italic text-nb-text">
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
          </div>

          {/* Current Positions — links to /positions */}
          <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
            <Link href="/positions" className="block">
              <div className="bg-nb-primary text-white p-4 flex justify-between items-center hover:bg-nb-blue transition-colors">
                <h2 className="font-headline font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <Users size={16} />
                  CURRENT POSITIONS
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                  TRACK MAP <ArrowRight size={12} />
                </span>
              </div>
            </Link>
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
                            <span className={`font-black italic ${pos.position <= 3 ? "text-nb-red" : "text-nb-text"}`}>
                              P{pos.position}
                            </span>
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-1 h-6"
                                style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                              />
                              <span className="text-nb-text">{driver?.name_acronym || `#${pos.driver_number}`}</span>
                            </div>
                          </td>
                          <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted text-xs">
                            {driver?.team_name || "--"}
                          </td>
                          <td className="p-3 font-mono text-xs text-nb-text">
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
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Race Control — links to /race-control */}
          <Link href="/race-control" className="block">
            <div className="border-4 border-nb-primary bg-nb-surface neo-shadow flex flex-col">
              <div className="bg-nb-red text-white p-4 flex justify-between items-center hover:bg-red-700 transition-colors">
                <h2 className="font-headline font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <ShieldAlert size={16} />
                  RACE CONTROL
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                  ALL <ArrowRight size={12} />
                </span>
              </div>
              <div className="flex-1 p-4 space-y-3 max-h-80 overflow-y-auto">
                {raceControlEvents.length > 0 ? (
                  raceControlEvents
                    .slice(-8)
                    .reverse()
                    .map((rc, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-nb-primary p-3 flex gap-3"
                      >
                        <div className="font-headline font-black text-sm text-nb-text min-w-[50px]">
                          {rc.lap_number ? `L${rc.lap_number}` : "--"}
                        </div>
                        <div className="font-body text-xs">
                          <span className="block font-headline font-black uppercase text-[10px] text-nb-red">
                            {rc.flag || rc.category}
                          </span>
                          <span className="text-nb-text-muted">{rc.message}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-nb-text-muted font-headline font-bold uppercase">
                    No race control events
                  </p>
                )}
              </div>
            </div>
          </Link>

          {/* Pit Stops — links to /pit */}
          <Link href="/pit" className="block">
            <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
              <div className="bg-nb-primary text-white p-4 flex justify-between items-center hover:bg-nb-blue transition-colors">
                <h2 className="font-headline font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  <Wrench size={16} />
                  PIT STOPS
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                  ALL <ArrowRight size={12} />
                </span>
              </div>
              <div className="p-4 max-h-80 overflow-x-auto">
                {pitStops.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-nb-primary font-headline font-black uppercase">
                        <th className="p-2 text-nb-text">DRIVER</th>
                        <th className="p-2 text-nb-text">LAP</th>
                        <th className="p-2 text-nb-text">LANE</th>
                        <th className="p-2 text-nb-text text-right">STOP</th>
                      </tr>
                    </thead>
                    <tbody className="font-headline font-bold">
                      {pitStops.slice(0, 8).map((pit, idx) => {
                        const driver = driverMap.get(pit.driver_number);
                        return (
                          <tr
                            key={idx}
                            className="border-b border-nb-primary/30 hover:bg-nb-yellow/10"
                          >
                            <td className="p-2 italic text-nb-text">
                              {driver?.name_acronym || `#${pit.driver_number}`}
                            </td>
                            <td className="p-2 text-nb-text">L{pit.lap_number}</td>
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
            </div>
          </Link>
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
    <div className="bg-nb-surface border-4 border-nb-primary p-4 neo-shadow-sm flex flex-col justify-between h-28 hover:bg-nb-yellow/10 transition-colors cursor-pointer group">
      <span className="text-[10px] font-black uppercase tracking-widest font-headline flex items-center gap-1 text-nb-text">
        {icon}
        {label}
      </span>
      {loading ? (
        <Skeleton className="h-8 w-12" />
      ) : (
        <span className="font-headline font-black text-3xl text-nb-text group-hover:text-nb-red transition-colors">
          {value}
        </span>
      )}
    </div>
  );
}

function WeatherCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-nb-surface border-4 border-nb-primary p-4 neo-shadow-sm flex flex-col justify-between h-24 hover:bg-nb-yellow/10 transition-colors cursor-pointer">
      <span className="text-[10px] font-black uppercase tracking-widest font-headline text-nb-text-muted">
        {label}
      </span>
      <span className="font-headline font-black text-2xl text-nb-text">{value}</span>
    </div>
  );
}
