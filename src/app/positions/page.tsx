"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { MapPin } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import type { Location, Driver } from "@/lib/types/f1";

export default function PositionsPage() {
  const { sessionKey } = useSession();
  const [refreshCount, setRefreshCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations", sessionKey, refreshCount],
    queryFn: () => f1Api.location.list({ session_key: sessionKey }),
    refetchInterval: 3000,
  });

  const { data: positionData = [] } = useQuery({
    queryKey: ["positions-live", sessionKey],
    queryFn: () => f1Api.position.list({ session_key: sessionKey }),
  });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(entry.contentRect.height, 500),
        });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const driverMap = useMemo(() => {
    const map = new Map<number, Driver>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const latestPositions = useMemo(() => {
    const map = new Map<number, (typeof positionData)[0]>();
    for (const p of positionData) {
      const existing = map.get(p.driver_number);
      if (!existing || new Date(p.date) > new Date(existing.date)) {
        map.set(p.driver_number, p);
      }
    }
    return map;
  }, [positionData]);

  const latestLocationPerDriver = useMemo(() => {
    const map = new Map<number, Location>();
    for (const loc of locations) {
      const existing = map.get(loc.driver_number);
      if (!existing || new Date(loc.date) > new Date(existing.date)) {
        map.set(loc.driver_number, loc);
      }
    }
    return map;
  }, [locations]);

  const trackBounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const loc of latestLocationPerDriver.values()) {
      if (loc.x < minX) minX = loc.x;
      if (loc.x > maxX) maxX = loc.x;
      if (loc.y < minY) minY = loc.y;
      if (loc.y > maxY) maxY = loc.y;
    }
    if (!isFinite(minX)) return { minX: 0, maxX: 1000, minY: 0, maxY: 1000 };
    const padX = (maxX - minX) * 0.1 || 50;
    const padY = (maxY - minY) * 0.1 || 50;
    return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
  }, [latestLocationPerDriver]);

  const toScreen = (x: number, y: number) => {
    const { minX, maxX, minY, maxY } = trackBounds;
    const sx = ((x - minX) / (maxX - minX)) * (dimensions.width - 80) + 40;
    const sy = ((y - minY) / (maxY - minY)) * (dimensions.height - 80) + 40;
    return { sx, sy };
  };

  const sortedDrivers = useMemo(() => {
    return Array.from(latestLocationPerDriver.entries())
      .map(([dn, loc]) => ({
        driverNumber: dn,
        driver: driverMap.get(dn),
        loc,
        position: latestPositions.get(dn)?.position ?? 99,
      }))
      .sort((a, b) => a.position - b.position);
  }, [latestLocationPerDriver, driverMap, latestPositions]);

  const handleRefresh = () => setRefreshCount((c) => c + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <MapPin className="mr-2 inline" size={24} />
            Track Positions
          </h1>
          <p className="text-sm text-zinc-500">
            Live driver positions on track (auto-refreshes every 3s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
          >
            Refresh
          </button>
          <SessionSelector />
        </div>
      </div>

      {/* Track Map */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-4 pt-4">
          <CardTitle>
            Track Map ({latestLocationPerDriver.size} drivers)
          </CardTitle>
        </CardHeader>
        {isLoading && sortedDrivers.length === 0 ? (
          <Skeleton className="h-[500px] w-full" />
        ) : (
          <div ref={containerRef} className="relative w-full" style={{ height: "500px" }}>
            <svg
              width={dimensions.width}
              height={dimensions.height}
              className="w-full h-full"
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            >
              {/* Track outline from driver paths */}
              {sortedDrivers.length > 0 && (
                <path
                  d={sortedDrivers
                    .map(({ loc }, i) => {
                      const { sx, sy } = toScreen(loc.x, loc.y);
                      return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="40"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.3}
                />
              )}

              {/* Grid lines */}
              {Array.from({ length: 10 }).map((_, i) => (
                <g key={i}>
                  <line
                    x1={0}
                    y1={(dimensions.height / 10) * i}
                    x2={dimensions.width}
                    y2={(dimensions.height / 10) * i}
                    stroke="#1f1f23"
                    strokeWidth="0.5"
                  />
                  <line
                    x1={(dimensions.width / 10) * i}
                    y1={0}
                    x2={(dimensions.width / 10) * i}
                    y2={dimensions.height}
                    stroke="#1f1f23"
                    strokeWidth="0.5"
                  />
                </g>
              ))}

              {/* Driver dots */}
              {sortedDrivers.map(({ driverNumber, driver, loc, position }) => {
                const { sx, sy } = toScreen(loc.x, loc.y);
                const color = `#${driver?.team_colour || "888"}`;
                return (
                  <g key={driverNumber}>
                    {/* Glow effect */}
                    <circle
                      cx={sx}
                      cy={sy}
                      r={14}
                      fill={color}
                      opacity={0.2}
                    />
                    {/* Main dot */}
                    <circle
                      cx={sx}
                      cy={sy}
                      r={9}
                      fill={color}
                      stroke="#0a0a0a"
                      strokeWidth="2"
                    />
                    {/* Driver number label */}
                    <text
                      x={sx}
                      y={sy + 24}
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {driver?.name_acronym || `#${driverNumber}`}
                    </text>
                    {/* Position badge */}
                    <text
                      x={sx}
                      y={sy - 16}
                      textAnchor="middle"
                      fill="#e4e4e7"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      P{position}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </Card>

      {/* Position List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Positions</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-2 text-left font-medium">Pos</th>
                <th className="py-2 text-left font-medium">Driver</th>
                <th className="py-2 text-left font-medium">Team</th>
                <th className="py-2 text-left font-medium">X</th>
                <th className="py-2 text-left font-medium">Y</th>
                <th className="py-2 text-left font-medium">Z</th>
                <th className="py-2 text-left font-medium">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {sortedDrivers.map(({ driverNumber, driver, loc, position }) => (
                <tr
                  key={driverNumber}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                >
                  <td className="py-2.5">
                    <Badge variant={position <= 3 ? "success" : "default"}>
                      P{position}
                    </Badge>
                  </td>
                  <td className="py-2.5 font-medium">
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: `#${driver?.team_colour || "888"}` }}
                    />
                    {driver?.name_acronym || `#${driverNumber}`}
                  </td>
                  <td className="py-2.5 text-zinc-400">
                    {driver?.team_name || ""}
                  </td>
                  <td className="py-2.5 font-mono text-zinc-400">{loc.x?.toFixed(0) ?? "--"}</td>
                  <td className="py-2.5 font-mono text-zinc-400">{loc.y?.toFixed(0) ?? "--"}</td>
                  <td className="py-2.5 font-mono text-zinc-400">{loc.z?.toFixed(0) ?? "--"}</td>
                  <td className="py-2.5 text-xs text-zinc-500">
                    {loc.date ? new Date(loc.date).toLocaleTimeString() : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
