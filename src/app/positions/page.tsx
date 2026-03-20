"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { MapPin, Radio } from "lucide-react";
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
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-nb-primary text-white px-3 py-1 text-xs font-black uppercase font-headline inline-flex items-center gap-1.5">
              <Radio size={12} className="live-dot" />
              LIVE
            </span>
            <span className="text-nb-text-muted text-xs font-bold uppercase tracking-widest font-headline">
              Auto-refresh 3s
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-nb-text font-headline uppercase tracking-tighter">
            <MapPin className="mr-2 inline" size={28} />
            Track Positions
          </h1>
          <p className="text-sm text-nb-text-muted font-headline font-bold mt-1">
            Live driver positions on track &mdash; {latestLocationPerDriver.size} drivers detected
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="border-4 border-nb-primary bg-nb-surface px-4 py-2 font-headline font-bold text-sm uppercase text-nb-text neo-shadow hover:bg-nb-yellow hover:text-nb-primary transition-colors"
          >
            Refresh
          </button>
          <SessionSelector />
        </div>
      </div>

      {/* Track Map */}
      <div className="border-4 border-nb-primary bg-nb-primary neo-shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b-4 border-nb-primary bg-nb-primary text-white flex items-center justify-between">
          <h3 className="text-lg font-black font-headline uppercase tracking-tighter flex items-center gap-2">
            <MapPin size={18} />
            Track Map
            <span className="bg-nb-yellow text-nb-primary text-xs px-2 py-0.5 font-black">
              {latestLocationPerDriver.size} DRIVERS
            </span>
          </h3>
        </div>
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
                  stroke="#1a1a1a"
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
                    stroke="#1a1a1a"
                    strokeWidth="0.5"
                    opacity={0.15}
                  />
                  <line
                    x1={(dimensions.width / 10) * i}
                    y1={0}
                    x2={(dimensions.width / 10) * i}
                    y2={dimensions.height}
                    stroke="#1a1a1a"
                    strokeWidth="0.5"
                    opacity={0.15}
                  />
                </g>
              ))}

              {/* Driver dots */}
              {sortedDrivers.map(({ driverNumber, driver, loc, position }) => {
                const { sx, sy } = toScreen(loc.x, loc.y);
                const color = `#${driver?.team_colour || "888"}`;
                return (
                  <g key={driverNumber}>
                    {/* Team color ring */}
                    <circle
                      cx={sx}
                      cy={sy}
                      r={14}
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      strokeDasharray="4 2"
                    />
                    {/* Main dot — black fill, team-color stroke */}
                    <circle
                      cx={sx}
                      cy={sy}
                      r={9}
                      fill="#1a1a1a"
                      stroke={color}
                      strokeWidth="3"
                    />
                    {/* Position number inside dot */}
                    <text
                      x={sx}
                      y={sy + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="900"
                      fontFamily="'Space Grotesk', sans-serif"
                    >
                      {position}
                    </text>
                    {/* Driver acronym label */}
                    <text
                      x={sx}
                      y={sy + 26}
                      textAnchor="middle"
                      fill="#1a1a1a"
                      fontSize="10"
                      fontWeight="900"
                      fontFamily="'Space Grotesk', sans-serif"
                      style={{ textTransform: "uppercase" }}
                    >
                      {driver?.name_acronym || `#${driverNumber}`}
                    </text>
                    {/* Position badge above */}
                    <rect
                      x={sx - 14}
                      y={sy - 28}
                      width={28}
                      height={14}
                      fill="#1a1a1a"
                      stroke="#1a1a1a"
                      strokeWidth="1"
                    />
                    <text
                      x={sx}
                      y={sy - 19}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffcc00"
                      fontSize="8"
                      fontWeight="900"
                      fontFamily="'Space Grotesk', sans-serif"
                    >
                      P{position}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Position List */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="px-4 py-3 border-b-4 border-nb-primary bg-nb-primary text-white flex items-center justify-between">
          <h3 className="text-lg font-black font-headline uppercase tracking-tighter">
            Current Positions
          </h3>
          <span className="bg-nb-yellow text-nb-primary text-xs px-2 py-0.5 font-black font-headline uppercase">
            {sortedDrivers.length} RUNNING
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-nb-surface-dim border-b-2 border-nb-primary font-headline font-black uppercase text-xs text-nb-text">
                <th className="p-3 border-r-2 border-nb-primary text-left">Pos</th>
                <th className="p-3 border-r-2 border-nb-primary text-left">Driver</th>
                <th className="p-3 border-r-2 border-nb-primary text-left">Team</th>
                <th className="p-3 border-r-2 border-nb-primary text-left">X</th>
                <th className="p-3 border-r-2 border-nb-primary text-left">Y</th>
                <th className="p-3 border-r-2 border-nb-primary text-left">Z</th>
                <th className="p-3 text-left">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {sortedDrivers.map(({ driverNumber, driver, loc, position }) => (
                <tr
                  key={driverNumber}
                  className="border-b-2 border-nb-primary hover:bg-nb-yellow/10 transition-colors"
                >
                  <td className="p-3 border-r-2 border-nb-primary">
                    <Badge variant={position <= 3 ? "warning" : "default"}>
                      P{position}
                    </Badge>
                  </td>
                  <td className="p-3 border-r-2 border-nb-primary font-headline font-bold">
                    <span
                      className="mr-2 inline-block h-3 w-3 border-2"
                      style={{
                        backgroundColor: `#${driver?.team_colour || "888"}`,
                        borderColor: "#1a1a1a",
                      }}
                    />
                    {driver?.name_acronym || `#${driverNumber}`}
                  </td>
                  <td className="p-3 border-r-2 border-nb-primary text-nb-text-muted font-headline font-bold text-xs uppercase">
                    {driver?.team_name || ""}
                  </td>
                  <td className="p-3 border-r-2 border-nb-primary font-mono text-nb-text-muted font-bold text-xs">
                    {loc.x?.toFixed(0) ?? "--"}
                  </td>
                  <td className="p-3 border-r-2 border-nb-primary font-mono text-nb-text-muted font-bold text-xs">
                    {loc.y?.toFixed(0) ?? "--"}
                  </td>
                  <td className="p-3 border-r-2 border-nb-primary font-mono text-nb-text-muted font-bold text-xs">
                    {loc.z?.toFixed(0) ?? "--"}
                  </td>
                  <td className="p-3 text-xs text-nb-text-muted font-headline font-bold">
                    {loc.date ? new Date(loc.date).toLocaleTimeString() : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
