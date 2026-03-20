"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
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
          <h1 className="text-2xl font-bold text-zinc-100">
            <CloudSun className="mr-2 inline" size={24} />
            Weather
          </h1>
          <p className="text-sm text-zinc-500">
            Track and air conditions over time
          </p>
        </div>
        <SessionSelector />
      </div>

      {/* Current Weather */}
      {latestWeather && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <WeatherStat icon={Thermometer} label="Track Temp" value={`${latestWeather.track_temperature}°C`} color="text-red-400" />
          <WeatherStat icon={Thermometer} label="Air Temp" value={`${latestWeather.air_temperature}°C`} color="text-blue-400" />
          <WeatherStat icon={Droplets} label="Humidity" value={`${latestWeather.humidity}%`} color="text-cyan-400" />
          <WeatherStat icon={Wind} label="Wind" value={`${latestWeather.wind_speed} m/s`} color="text-zinc-400" />
          <WeatherStat icon={Gauge} label="Pressure" value={`${latestWeather.pressure} mbar`} color="text-zinc-400" />
          <WeatherStat icon={CloudSun} label="Rainfall" value={latestWeather.rainfall ? "Yes" : "No"} color={latestWeather.rainfall ? "text-blue-400" : "text-emerald-400"} />
        </div>
      )}

      {/* Temperature Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Over Time</CardTitle>
        </CardHeader>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="time" tick={{ fill: "#71717a", fontSize: 10 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="track" stroke="#e10600" strokeWidth={2} dot={false} name="Track (°C)" />
                <Line type="monotone" dataKey="air" stroke="#3b82f6" strokeWidth={2} dot={false} name="Air (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Humidity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Humidity & Wind</CardTitle>
        </CardHeader>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="time" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} dot={false} name="Humidity (%)" />
              <Line type="monotone" dataKey="wind" stroke="#a1a1aa" strokeWidth={2} dot={false} name="Wind (m/s)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Weather History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weather History</CardTitle>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton rows={10} cols={7} />
        ) : (
          <div className="max-h-96 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">Time</th>
                  <th className="py-2 text-left font-medium">Track (°C)</th>
                  <th className="py-2 text-left font-medium">Air (°C)</th>
                  <th className="py-2 text-left font-medium">Humidity</th>
                  <th className="py-2 text-left font-medium">Wind</th>
                  <th className="py-2 text-left font-medium">Pressure</th>
                  <th className="py-2 text-left font-medium">Rain</th>
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
                      className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                    >
                      <td className="py-2 text-xs text-zinc-500">
                        {w.date ? new Date(w.date).toLocaleTimeString() : "--"}
                      </td>
                      <td className="py-2 font-mono text-zinc-200">{w.track_temperature}</td>
                      <td className="py-2 font-mono text-zinc-400">{w.air_temperature}</td>
                      <td className="py-2 font-mono text-zinc-400">{w.humidity}%</td>
                      <td className="py-2 font-mono text-zinc-400">{w.wind_speed} m/s</td>
                      <td className="py-2 font-mono text-zinc-400">{w.pressure}</td>
                      <td className="py-2">
                        {w.rainfall ? (
                          <span className="text-blue-400">Yes</span>
                        ) : (
                          <span className="text-zinc-600">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
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
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <Icon size={16} className={color} />
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="text-sm font-semibold text-zinc-100">{value}</p>
        </div>
      </div>
    </Card>
  );
}
