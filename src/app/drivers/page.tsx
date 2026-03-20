"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Skeleton } from "@/components/ui/Skeleton";
import { Users } from "lucide-react";

export default function DriversPage() {
  const { sessionKey } = useSession();

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["drivers", sessionKey],
    queryFn: () => f1Api.drivers.bySession(sessionKey),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-headline font-black uppercase text-xs tracking-tighter text-nb-text-muted">
            <Users className="mr-1 inline" size={14} />
            Grid
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none text-nb-text">
            Drivers
          </h1>
        </div>
        <SessionSelector />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {drivers.map((driver) => (
            <div
              key={driver.driver_number}
              className="border-4 border-nb-primary bg-nb-surface neo-shadow overflow-hidden"
            >
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: `#${driver.team_colour || "888"}` }}
              />
              <div className="p-4 text-center">
                {driver.headshot_url ? (
                  <img
                    src={driver.headshot_url}
                    alt={driver.full_name || ""}
                    className="mx-auto mb-3 h-20 w-20 object-cover border-2 border-nb-primary"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center bg-nb-primary text-white text-2xl font-black font-headline border-2 border-nb-primary">
                    {driver.name_acronym?.charAt(0) || "?"}
                  </div>
                )}
                <h3 className="text-sm font-headline font-bold text-nb-text">{driver.full_name || "Unknown"}</h3>
                <p className="text-xs font-headline font-bold text-nb-text-muted">{driver.team_name || ""}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="border-2 border-nb-primary font-headline font-black uppercase text-[10px] px-2 py-0.5 bg-nb-surface-dim">
                    #{driver.driver_number}
                  </span>
                  <span
                    className="inline-block w-1 h-6"
                    style={{ backgroundColor: `#${driver.team_colour || "888"}` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Driver Table */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">All Drivers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-headline font-bold">
            <thead>
              <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                <th className="py-2 px-3 text-left">#</th>
                <th className="py-2 px-3 text-left">Number</th>
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Acronym</th>
                <th className="py-2 px-3 text-left">Team</th>
                <th className="py-2 px-3 text-left">Color</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr
                  key={d.driver_number}
                  className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                >
                  <td className="py-2.5 px-3">
                    <img
                      src={d.headshot_url}
                      alt={d.full_name || ""}
                      className="h-8 w-8 object-cover border-2 border-nb-primary"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-black text-nb-text">{d.driver_number}</td>
                  <td className="py-2.5 px-3 text-nb-text">{d.full_name || "Unknown"}</td>
                  <td className="py-2.5 px-3 font-mono text-nb-text-muted">{d.name_acronym || "--"}</td>
                  <td className="py-2.5 px-3 text-nb-text-muted">{d.team_name || ""}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className="inline-block w-1 h-6"
                      style={{ backgroundColor: `#${d.team_colour || "888"}` }}
                    />
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
