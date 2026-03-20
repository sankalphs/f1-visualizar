"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
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
          <span className="font-headline font-bold text-sm uppercase tracking-tighter text-nb-text-muted">
            <Layers className="mr-2 inline" size={16} />
            Telemetry
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none text-nb-text">
            Sector Heatmap
          </h1>
        </div>
        <SessionSelector />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 border-4 border-nb-primary bg-nb-surface p-1">
          {sectors.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedSector(s.key)}
              className={`px-3 py-1.5 text-xs font-headline font-bold uppercase tracking-tighter transition-colors ${
                selectedSector === s.key
                  ? "bg-nb-red text-white"
                  : "text-nb-text hover:bg-nb-surface-dim"
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
          className="border-2 border-nb-primary bg-nb-surface font-headline font-bold text-sm text-nb-text px-3 py-2 focus:outline-none focus:border-nb-red"
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
      <div className="flex items-center gap-4 text-xs font-headline font-bold text-nb-text-muted uppercase tracking-tighter">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 border-2 border-nb-primary" style={{ backgroundColor: "rgba(39, 244, 210, 0.6)" }} />
          <span>Fast</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 border-2 border-nb-primary" style={{ backgroundColor: "rgba(250, 204, 21, 0.5)" }} />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 border-2 border-nb-primary" style={{ backgroundColor: "rgba(239, 68, 68, 0.5)" }} />
          <span>Slow</span>
        </div>
      </div>

      {/* Heatmap */}
      {isLoading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : filteredData.length > 0 ? (
        <div className="border-4 border-nb-primary bg-nb-surface neo-shadow overflow-hidden">
          <div className="bg-nb-primary text-white p-4 font-headline font-bold uppercase tracking-tighter">
            Sector Times Heatmap ({selectedSector.toUpperCase()})
            {selectedDriver
              ? ` - ${driverMap.get(selectedDriver)?.name_acronym || `#${selectedDriver}`}`
              : ""}
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-max p-4">
              <table className="text-xs border-collapse font-headline">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-nb-primary text-white px-2 py-1 text-left font-bold uppercase tracking-tighter min-w-[80px] border-2 border-nb-primary">
                      Driver
                    </th>
                    {uniqueLaps.map((lap) => (
                      <th
                        key={lap}
                        className="px-1 py-1 text-center font-bold text-nb-text-muted min-w-[52px] border-2 border-nb-primary"
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
                        <td className="sticky left-0 z-10 bg-nb-surface px-2 py-0.5 border-2 border-nb-primary">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span
                              className="inline-block w-1 h-4 flex-shrink-0"
                              style={{ backgroundColor: `#${d?.team_colour || "888"}` }}
                            />
                            <span className="font-bold text-nb-text">
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
                                className="px-0.5 py-0.5 text-center border-2 border-nb-primary"
                              >
                                <div className="h-7 w-[52px] bg-nb-surface-dim flex items-center justify-center text-nb-text-muted font-bold">
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
                              className="px-0.5 py-0.5 text-center border-2 border-nb-primary"
                            >
                              <div
                                className={`h-7 w-[52px] flex items-center justify-center font-mono text-[10px] font-bold ${isBest ? "ring-2 ring-emerald-400" : ""}`}
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
        </div>
      ) : (
        <div className="border-4 border-nb-primary bg-nb-surface neo-shadow p-8">
          <p className="text-center font-headline font-bold text-nb-text-muted">
            No sector data available for this session
          </p>
        </div>
      )}

      {/* Best Sectors Table */}
      {bestSectors.size > 0 && (
        <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
          <div className="bg-nb-primary text-white p-4 font-headline font-bold uppercase tracking-tighter">
            Best Sector Times
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-headline">
              <thead>
                <tr className="border-b-4 border-nb-primary bg-nb-primary text-white">
                  <th className="py-2 px-4 text-left font-bold uppercase tracking-tighter">Driver</th>
                  <th className="py-2 px-4 text-left font-bold uppercase tracking-tighter">Best S1</th>
                  <th className="py-2 px-4 text-left font-bold uppercase tracking-tighter">Best S2</th>
                  <th className="py-2 px-4 text-left font-bold uppercase tracking-tighter">Best S3</th>
                  <th className="py-2 px-4 text-left font-bold uppercase tracking-tighter">Best Total</th>
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
                        className="border-b-2 border-nb-primary hover:bg-nb-surface-dim"
                      >
                        <td className="py-2.5 px-4 font-bold">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-1 h-6"
                              style={{ backgroundColor: `#${d?.team_colour || "888"}` }}
                            />
                            {d?.name_acronym || `#${dn}`}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono">
                          <span
                            className={
                              Math.abs(best.s1 - fastestSectors.s1) < 0.01
                                ? "text-emerald-400 font-bold"
                                : "text-nb-text-muted"
                            }
                          >
                            {best.s1.toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono">
                          <span
                            className={
                              Math.abs(best.s2 - fastestSectors.s2) < 0.01
                                ? "text-emerald-400 font-bold"
                                : "text-nb-text-muted"
                            }
                          >
                            {best.s2.toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono">
                          <span
                            className={
                              Math.abs(best.s3 - fastestSectors.s3) < 0.01
                                ? "text-emerald-400 font-bold"
                                : "text-nb-text-muted"
                            }
                          >
                            {best.s3.toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-nb-text">
                          {formatLapTime(best.total)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
