"use client";

import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
          <h1 className="text-2xl font-bold text-zinc-100">
            <Users className="mr-2 inline" size={24} />
            Drivers
          </h1>
          <p className="text-sm text-zinc-500">Driver profiles and team information</p>
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
            <Card key={driver.driver_number} className="p-0 overflow-hidden">
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: `#${driver.team_colour}` }}
              />
              <div className="p-4 text-center">
                {driver.headshot_url ? (
                  <img
                    src={driver.headshot_url}
                    alt={driver.full_name}
                    className="mx-auto mb-3 h-20 w-20 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold">
                    {driver.name_acronym?.charAt(0)}
                  </div>
                )}
                <h3 className="text-sm font-semibold text-zinc-100">{driver.full_name}</h3>
                <p className="text-xs text-zinc-500">{driver.team_name}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Badge variant="outline">#{driver.driver_number}</Badge>
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: `#${driver.team_colour}` }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Driver Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Drivers</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-2 text-left font-medium">#</th>
                <th className="py-2 text-left font-medium">Number</th>
                <th className="py-2 text-left font-medium">Name</th>
                <th className="py-2 text-left font-medium">Acronym</th>
                <th className="py-2 text-left font-medium">Team</th>
                <th className="py-2 text-left font-medium">Color</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr
                  key={d.driver_number}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                >
                  <td className="py-2.5">
                    <img
                      src={d.headshot_url}
                      alt={d.full_name}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  </td>
                  <td className="py-2.5 font-mono font-bold">{d.driver_number}</td>
                  <td className="py-2.5 font-medium">{d.full_name}</td>
                  <td className="py-2.5 font-mono text-zinc-400">{d.name_acronym}</td>
                  <td className="py-2.5 text-zinc-400">{d.team_name}</td>
                  <td className="py-2.5">
                    <span
                      className="inline-block h-4 w-8 rounded"
                      style={{ backgroundColor: `#${d.team_colour}` }}
                    />
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
