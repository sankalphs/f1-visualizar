"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { CloudSun, Droplets, Thermometer, Wind, Gauge } from "lucide-react";
import { useMemo } from "react";
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

export default function WeatherPage() {
  const { sessionKey } = useSession();

  const { data: weather = [], isLoading } = useQuery({
    queryKey: ["weather", sessionKey],
    queryFn: () => f1Api.weather.bySession(sessionKey),
  });

  const chartData = useMemo(
    () =>
      weather.map((w, i) => ({
        index: i,
        time: w.date ? new Date(w.date).toLocaleTimeString() : "--",
        track: w.track_temperature,
        air: w.air_temperature,
        humidity: w.humidity,
        wind: w.wind_speed,
        pressure: w.pressure,
        rainfall: w.rainfall,
      })),
    [weather]
  );

  const latestWeather = weather.length > 0 ? weather[weather.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-headline font-black uppercase text-xs tracking-tighter text-nb-text-muted">
            <CloudSun className="mr-1 inline" size={14} />
            Conditions
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none text-nb-text">
            Weather
          </h1>
        </div>
        <SessionSelector />
      </div>

      {/* Current Weather */}
      {latestWeather && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <WeatherStat icon={Thermometer} label="Track Temp" value={`${latestWeather.track_temperature}°C`} color="text-nb-red" />
          <WeatherStat icon={Thermometer} label="Air Temp" value={`${latestWeather.air_temperature}°C`} color="text-nb-blue" />
          <WeatherStat icon={Droplets} label="Humidity" value={`${latestWeather.humidity}%`} color="text-cyan-400" />
          <WeatherStat icon={Wind} label="Wind" value={`${latestWeather.wind_speed} m/s`} color="text-nb-text-muted" />
          <WeatherStat icon={Gauge} label="Pressure" value={`${latestWeather.pressure} mbar`} color="text-nb-text-muted" />
          <WeatherStat icon={CloudSun} label="Rainfall" value={latestWeather.rainfall ? "Yes" : "No"} color={latestWeather.rainfall ? "text-nb-blue" : "text-emerald-400"} />
        </div>
      )}

      {/* Temperature Chart */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Temperature Over Time</h2>
        </div>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-72 w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="time" tick={{ fill: "#4a4a4a", fontSize: 10 }} />
                <YAxis tick={{ fill: "#4a4a4a", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #1a1a1a",
                    borderRadius: "0px",
                    fontFamily: "inherit",
                    fontWeight: "bold",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="track" stroke="#e63b2e" strokeWidth={2} dot={false} name="Track (°C)" />
                <Line type="monotone" dataKey="air" stroke="#0055ff" strokeWidth={2} dot={false} name="Air (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Humidity Chart */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Humidity & Wind</h2>
        </div>
        <div className="h-64 w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="time" tick={{ fill: "#4a4a4a", fontSize: 10 }} />
              <YAxis tick={{ fill: "#4a4a4a", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #1a1a1a",
                  borderRadius: "0px",
                  fontFamily: "inherit",
                  fontWeight: "bold",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="humidity" stroke="#0055ff" strokeWidth={2} dot={false} name="Humidity (%)" />
              <Line type="monotone" dataKey="wind" stroke="#4a4a4a" strokeWidth={2} dot={false} name="Wind (m/s)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weather History Table */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Weather History</h2>
        </div>
        {isLoading ? (
          <TableSkeleton rows={10} cols={7} />
        ) : (
          <div className="max-h-96 overflow-x-auto">
            <table className="w-full text-sm font-headline font-bold">
              <thead>
                <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                  <th className="py-2 px-3 text-left">Time</th>
                  <th className="py-2 px-3 text-left">Track (°C)</th>
                  <th className="py-2 px-3 text-left">Air (°C)</th>
                  <th className="py-2 px-3 text-left">Humidity</th>
                  <th className="py-2 px-3 text-left">Wind</th>
                  <th className="py-2 px-3 text-left">Pressure</th>
                  <th className="py-2 px-3 text-left">Rain</th>
                </tr>
              </thead>
              <tbody>
                {weather
                  .slice()
                  .reverse()
                  .slice(0, 100)
                  .map((w, idx) => (
                    <tr
                      key={idx}
                      className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                    >
                      <td className="py-2 px-3 text-xs text-nb-text-muted">
                        {w.date ? new Date(w.date).toLocaleTimeString() : "--"}
                      </td>
                      <td className="py-2 px-3 font-mono text-nb-text">{w.track_temperature}</td>
                      <td className="py-2 px-3 font-mono text-nb-text-muted">{w.air_temperature}</td>
                      <td className="py-2 px-3 font-mono text-nb-text-muted">{w.humidity}%</td>
                      <td className="py-2 px-3 font-mono text-nb-text-muted">{w.wind_speed} m/s</td>
                      <td className="py-2 px-3 font-mono text-nb-text-muted">{w.pressure}</td>
                      <td className="py-2 px-3">
                        {w.rainfall ? (
                          <span className="text-nb-blue font-headline font-black">Yes</span>
                        ) : (
                          <span className="text-nb-text-muted">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function WeatherStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="border-4 border-nb-primary bg-nb-surface neo-shadow-sm p-3">
      <div className="flex items-center gap-3">
        <Icon size={16} className={color} />
        <div>
          <p className="text-xs font-headline font-bold uppercase text-nb-text-muted">{label}</p>
          <p className="text-sm font-headline font-black text-nb-text">{value}</p>
        </div>
      </div>
    </div>
  );
}
