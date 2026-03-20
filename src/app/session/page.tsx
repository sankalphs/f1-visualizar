"use client";

import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Clock, Flag } from "lucide-react";
import { useMemo } from "react";

export default function SessionPage() {
  const { meetings, sessions, meeting } = useSession();

  const sortedMeetings = useMemo(
    () => [...meetings].sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()),
    [meetings]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <Calendar className="mr-2 inline" size={24} />
            Sessions & Meetings
          </h1>
          <p className="text-sm text-zinc-500">
            Browse all F1 meetings and sessions
          </p>
        </div>
        <SessionSelector />
      </div>

      {meeting && (
        <Card>
          <CardHeader>
            <CardTitle>Current Meeting</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-zinc-900/50 p-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Flag size={14} />
                <span className="text-xs">Event</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{meeting.meeting_name}</p>
            </div>
            <div className="rounded-lg bg-zinc-900/50 p-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin size={14} />
                <span className="text-xs">Circuit</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{meeting.circuit_short_name}</p>
            </div>
            <div className="rounded-lg bg-zinc-900/50 p-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar size={14} />
                <span className="text-xs">Location</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{meeting.location}, {meeting.country_name}</p>
            </div>
            <div className="rounded-lg bg-zinc-900/50 p-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock size={14} />
                <span className="text-xs">Type</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{meeting.circuit_type}</p>
            </div>
          </div>
          {meeting.circuit_image && (
            <div className="mt-4 flex justify-center">
              <img
                src={meeting.circuit_image}
                alt={meeting.circuit_short_name}
                className="h-32 opacity-80"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            </div>
          )}
        </Card>
      )}

      {/* Sessions for current meeting */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-2 text-left font-medium">Session</th>
                <th className="py-2 text-left font-medium">Type</th>
                <th className="py-2 text-left font-medium">Start</th>
                <th className="py-2 text-left font-medium">End</th>
                <th className="py-2 text-left font-medium">Circuit</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.session_key}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                >
                  <td className="py-2.5 font-medium">{s.session_name}</td>
                  <td className="py-2.5">
                    <Badge variant={s.session_type === "Race" ? "danger" : "default"}>
                      {s.session_type}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-zinc-400">{formatDate(s.date_start)}</td>
                  <td className="py-2.5 text-zinc-400">{formatDate(s.date_end)}</td>
                  <td className="py-2.5 text-zinc-400">{s.circuit_short_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* All Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>All Meetings (2025)</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-2 text-left font-medium">#</th>
                <th className="py-2 text-left font-medium">Meeting</th>
                <th className="py-2 text-left font-medium">Location</th>
                <th className="py-2 text-left font-medium">Circuit</th>
                <th className="py-2 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedMeetings.map((m, idx) => (
                <tr
                  key={m.meeting_key}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                >
                  <td className="py-2.5 text-zinc-500">{idx + 1}</td>
                  <td className="py-2.5 font-medium">
                    <div className="flex items-center gap-2">
                      <img
                        src={m.country_flag || ""}
                        alt={m.country_name || ""}
                        className="h-4 w-6 rounded object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                      {m.meeting_name}
                    </div>
                  </td>
                  <td className="py-2.5 text-zinc-400">
                    {m.location}, {m.country_name}
                  </td>
                  <td className="py-2.5 text-zinc-400">{m.circuit_short_name}</td>
                  <td className="py-2.5 text-zinc-400">
                    {m.date_start ? new Date(m.date_start).toLocaleDateString() : "--"}
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
