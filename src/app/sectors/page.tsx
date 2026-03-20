"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatLapTime } from "@/lib/utils";
import { Layers } from "lucide-react";
import { useMemo, useState } from "react";

type SectorKey = "s1" | "s2" | "s3";

interface SectorHeatmapCell {
  driver: number;
  lap: number;
  s1: number | null;
  s2: number | null;
  s3: number | null;
  total: number | null;
}

function getSectorRGB(value: number, min: number, max: number): string {
  if (max === min) return "39, 244, 210";
  const ratio = (value - min) / (max - min);
  // Green (fast) -> Yellow (mid) -> Red (slow)
  if (ratio < 0.5) {
    const t = ratio * 2;
    const r = Math.round(39 + (250 - 39) * t);
    const g = Math.round(244 + (204 - 244) * t);
    const b = Math.round(210 + (21 - 210) * t);
    return `${r}, ${g}, ${b}`;
  } else {
    const t = (ratio - 0.5) * 2;
    const r = Math.round(250 + (239 - 250) * t);
    const g = Math.round(204 + (68 - 204) * t);
    const b = Math.round(21 + (68 - 21) * t);
    return `${r}, ${g}, ${b}`;
  }
}

export default function SectorsPage() {
  const { sessionKey } = useSession();
  const [selectedSector, setSelectedSector] = useState<SectorKey>("s1");
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  const { data: laps = [], isLoading } = useQuery({
    queryKey: ["laps-sectors", sessionKey],
    queryFn: () => f1Api.laps.list({ session_key: sessionKey }),
  });

  const driverMap = useMemo(() => {
    const map = new Map<number, (typeof drivers)[0]>();
    for (const d of drivers) map.set(d.driver_number, d);
    return map;
  }, [drivers]);

  const driverNumbers = useMemo(() => {
    const set = new Set<number>();
    for (const l of laps) set.add(l.driver_number);
    return Array.from(set).sort((a, b) => a - b);
  }, [laps]);

  // Build heatmap data: driver x lap
  const heatmapData = useMemo((): SectorHeatmapCell[] => {
    const cells: SectorHeatmapCell[] = [];
    for (const lap of laps) {
      if (
        lap.duration_sector_1 == null &&
        lap.duration_sector_2 == null &&
        lap.duration_sector_3 == null
      )
        continue;
      cells.push({
        driver: lap.driver_number,
        lap: lap.lap_number,
        s1: lap.duration_sector_1,
        s2: lap.duration_sector_2,
        s3: lap.duration_sector_3,
        total: lap.lap_duration,
      });
    }
    return cells;
  }, [laps]);

  // Filter for selected driver if any
  const filteredData = useMemo(() => {
    if (selectedDriver) return heatmapData.filter((c) => c.driver === selectedDriver);
    return heatmapData;
  }, [heatmapData, selectedDriver]);

  // Get unique laps and drivers for the grid
  const uniqueLaps = useMemo(() => {
    const set = new Set<number>();
    for (const c of filteredData) set.add(c.lap);
    return Array.from(set).sort((a, b) => a - b);
  }, [filteredData]);

  const uniqueDrivers = useMemo(() => {
    const set = new Set<number>();
    for (const c of filteredData) set.add(c.driver);
    return Array.from(set).sort((a, b) => a - b);
  }, [filteredData]);

  // Compute min/max for selected sector
  const sectorRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const c of filteredData) {
      const val = c[selectedSector];
      if (val != null) {
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }
    if (!isFinite(min)) return { min: 0, max: 1 };
    return { min, max: max || min + 1 };
  }, [filteredData, selectedSector]);

  // Best sector times per driver
  const bestSectors = useMemo(() => {
    const map = new Map<number, { s1: number; s2: number; s3: number; total: number }>();
    for (const c of filteredData) {
      const existing = map.get(c.driver);
      if (!existing) {
        if (c.s1 && c.s2 && c.s3 && c.total) {
          map.set(c.driver, { s1: c.s1, s2: c.s2, s3: c.s3, total: c.total });
        }
      } else {
        if (c.s1 && c.s1 < existing.s1) existing.s1 = c.s1;
        if (c.s2 && c.s2 < existing.s2) existing.s2 = c.s2;
        if (c.s3 && c.s3 < existing.s3) existing.s3 = c.s3;
        if (c.total && c.total < existing.total) existing.total = c.total;
      }
    }
    return map;
  }, [filteredData]);

  // Get fastest sector overall
  const fastestSectors = useMemo(() => {
    let fS1 = Infinity, fS2 = Infinity, fS3 = Infinity;
    for (const c of filteredData) {
      if (c.s1 && c.s1 < fS1) fS1 = c.s1;
      if (c.s2 && c.s2 < fS2) fS2 = c.s2;
      if (c.s3 && c.s3 < fS3) fS3 = c.s3;
    }
    return { s1: fS1, s2: fS2, s3: fS3 };
  }, [filteredData]);

  const lookupCell = useMemo(() => {
    const map = new Map<string, SectorHeatmapCell>();
    for (const c of filteredData) {
      map.set(`${c.driver}-${c.lap}`, c);
    }
    return map;
  }, [filteredData]);

  const sectors: { key: SectorKey; label: string }[] = [
    { key: "s1", label: "Sector 1" },
    { key: "s2", label: "Sector 2" },
    { key: "s3", label: "Sector 3" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <Layers className="mr-2 inline" size={24} />
            Sector Heatmap
          </h1>
          <p className="text-sm text-zinc-500">
            Visual sector-by-sector time comparison across all laps
          </p>
        </div>
        <SessionSelector />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-1">
          {sectors.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedSector(s.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedSector === s.key
                  ? "bg-red-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <select
          value={selectedDriver ?? ""}
          onChange={(e) =>
            setSelectedDriver(e.target.value ? Number(e.target.value) : null)
          }
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-red-500 focus:outline-none"
        >
          <option value="">All Drivers</option>
          {driverNumbers.map((dn) => (
            <option key={dn} value={dn}>
              {driverMap.get(dn)?.name_acronym || `#${dn}`} -{" "}
              {driverMap.get(dn)?.team_name || ""}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(39, 244, 210, 0.6)" }} />
          <span>Fast</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(250, 204, 21, 0.5)" }} />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(239, 68, 68, 0.5)" }} />
          <span>Slow</span>
        </div>
      </div>

      {/* Heatmap */}
      {isLoading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : filteredData.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-4 pt-4">
            <CardTitle>
              Sector Times Heatmap ({selectedSector.toUpperCase()})
              {selectedDriver
                ? ` - ${driverMap.get(selectedDriver)?.name_acronym || `#${selectedDriver}`}`
                : ""}
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <div className="min-w-max p-4">
              <table className="text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-zinc-950 px-2 py-1 text-left font-medium text-zinc-500 min-w-[80px]">
                      Driver
                    </th>
                    {uniqueLaps.map((lap) => (
                      <th
                        key={lap}
                        className="px-1 py-1 text-center font-medium text-zinc-500 min-w-[52px]"
                      >
                        L{lap}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uniqueDrivers.map((dn) => {
                    const d = driverMap.get(dn);
                    return (
                      <tr key={dn}>
                        <td className="sticky left-0 z-10 bg-zinc-950 px-2 py-0.5">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span
                              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `#${d?.team_colour || "888"}` }}
                            />
                            <span className="font-medium text-zinc-300">
                              {d?.name_acronym || `#${dn}`}
                            </span>
                          </div>
                        </td>
                        {uniqueLaps.map((lap) => {
                          const cell = lookupCell.get(`${dn}-${lap}`);
                          const value = cell?.[selectedSector];
                          if (value == null) {
                            return (
                              <td
                                key={`${dn}-${lap}`}
                                className="px-0.5 py-0.5 text-center"
                              >
                                <div className="h-7 w-[52px] rounded bg-zinc-900/50 flex items-center justify-center text-zinc-600">
                                  -
                                </div>
                              </td>
                            );
                          }
                          const rgb = getSectorRGB(
                            value,
                            sectorRange.min,
                            sectorRange.max
                          );
                          const isBest =
                            Math.abs(value - fastestSectors[selectedSector]) < 0.01;
                          return (
                            <td
                              key={`${dn}-${lap}`}
                              className="px-0.5 py-0.5 text-center"
                            >
                              <div
                                className={`h-7 w-[52px] rounded flex items-center justify-center font-mono text-[10px] font-semibold ${isBest ? "ring-1 ring-emerald-400" : ""}`}
                                style={{
                                  backgroundColor: `rgba(${rgb}, 0.4)`,
                                  color: "#e4e4e7",
                                }}
                                title={`S1: ${cell?.s1?.toFixed(3) ?? "-"} | S2: ${cell?.s2?.toFixed(3) ?? "-"} | S3: ${cell?.s3?.toFixed(3) ?? "-"}`}
                              >
                                {value.toFixed(2)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8">
          <p className="text-center text-zinc-500">
            No sector data available for this session
          </p>
        </Card>
      )}

      {/* Best Sectors Table */}
      {bestSectors.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Best Sector Times</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 text-left font-medium">Driver</th>
                  <th className="py-2 text-left font-medium">Best S1</th>
                  <th className="py-2 text-left font-medium">Best S2</th>
                  <th className="py-2 text-left font-medium">Best S3</th>
                  <th className="py-2 text-left font-medium">Best Total</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(bestSectors.entries())
                  .sort((a, b) => a[1].total - b[1].total)
                  .map(([dn, best]) => {
                    const d = driverMap.get(dn);
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
                        <td className="py-2.5 font-mono">
                          <span
                            className={
                              Math.abs(best.s1 - fastestSectors.s1) < 0.01
                                ? "text-emerald-400 font-semibold"
                                : "text-zinc-400"
                            }
                          >
                            {best.s1.toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono">
                          <span
                            className={
                              Math.abs(best.s2 - fastestSectors.s2) < 0.01
                                ? "text-emerald-400 font-semibold"
                                : "text-zinc-400"
                            }
                          >
                            {best.s2.toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono">
                          <span
                            className={
                              Math.abs(best.s3 - fastestSectors.s3) < 0.01
                                ? "text-emerald-400 font-semibold"
                                : "text-zinc-400"
                            }
                          >
                            {best.s3.toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono font-semibold text-zinc-100">
                          {formatLapTime(best.total)}
                        </td>
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
