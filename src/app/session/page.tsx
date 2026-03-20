"use client";

import { useSession } from "@/components/dashboard/SessionSelector";
import { SessionSelector } from "@/components/dashboard/SessionSelector";
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
          <span className="font-headline font-black uppercase text-xs tracking-tighter text-nb-text-muted">
            <Calendar className="mr-1 inline" size={14} />
            Schedule
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mt-2 leading-none text-nb-text">
            Sessions
          </h1>
        </div>
        <SessionSelector />
      </div>

      {meeting && (
        <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
          <div className="bg-nb-primary text-white p-4">
            <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Current Meeting</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
            <div className="border-2 border-nb-primary bg-nb-surface-dim p-4">
              <div className="flex items-center gap-2 text-nb-text-muted">
                <Flag size={14} />
                <span className="text-xs font-headline font-bold uppercase">Event</span>
              </div>
              <p className="mt-1 text-sm font-headline font-black text-nb-text">{meeting.meeting_name}</p>
            </div>
            <div className="border-2 border-nb-primary bg-nb-surface-dim p-4">
              <div className="flex items-center gap-2 text-nb-text-muted">
                <MapPin size={14} />
                <span className="text-xs font-headline font-bold uppercase">Circuit</span>
              </div>
              <p className="mt-1 text-sm font-headline font-black text-nb-text">{meeting.circuit_short_name}</p>
            </div>
            <div className="border-2 border-nb-primary bg-nb-surface-dim p-4">
              <div className="flex items-center gap-2 text-nb-text-muted">
                <Calendar size={14} />
                <span className="text-xs font-headline font-bold uppercase">Location</span>
              </div>
              <p className="mt-1 text-sm font-headline font-black text-nb-text">{meeting.location}, {meeting.country_name}</p>
            </div>
            <div className="border-2 border-nb-primary bg-nb-surface-dim p-4">
              <div className="flex items-center gap-2 text-nb-text-muted">
                <Clock size={14} />
                <span className="text-xs font-headline font-bold uppercase">Type</span>
              </div>
              <p className="mt-1 text-sm font-headline font-black text-nb-text">{meeting.circuit_type}</p>
            </div>
          </div>
          {meeting.circuit_image && (
            <div className="mt-2 flex justify-center pb-4">
              <img
                src={meeting.circuit_image}
                alt={meeting.circuit_short_name}
                className="h-32 opacity-80 border-2 border-nb-primary"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            </div>
          )}
        </div>
      )}

      {/* Sessions for current meeting */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-headline font-bold">
            <thead>
              <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                <th className="py-2 px-3 text-left">Session</th>
                <th className="py-2 px-3 text-left">Type</th>
                <th className="py-2 px-3 text-left">Start</th>
                <th className="py-2 px-3 text-left">End</th>
                <th className="py-2 px-3 text-left">Circuit</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.session_key}
                  className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                >
                  <td className="py-2.5 px-3 text-nb-text">{s.session_name}</td>
                  <td className="py-2.5 px-3">
                    <span className={`border-2 border-nb-primary font-headline font-black uppercase text-[10px] px-2 py-0.5 ${s.session_type === "Race" ? "bg-nb-red text-white" : "bg-nb-surface-dim text-nb-text"}`}>
                      {s.session_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-nb-text-muted">{formatDate(s.date_start)}</td>
                  <td className="py-2.5 px-3 text-nb-text-muted">{formatDate(s.date_end)}</td>
                  <td className="py-2.5 px-3 text-nb-text-muted">{s.circuit_short_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Meetings */}
      <div className="border-4 border-nb-primary bg-nb-surface neo-shadow">
        <div className="bg-nb-primary text-white p-4">
          <h2 className="font-headline font-black uppercase text-sm tracking-tighter">All Meetings (2025)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-headline font-bold">
            <thead>
              <tr className="bg-nb-primary text-white font-headline font-black uppercase text-xs">
                <th className="py-2 px-3 text-left">#</th>
                <th className="py-2 px-3 text-left">Meeting</th>
                <th className="py-2 px-3 text-left">Location</th>
                <th className="py-2 px-3 text-left">Circuit</th>
                <th className="py-2 px-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedMeetings.map((m, idx) => (
                <tr
                  key={m.meeting_key}
                  className="border-b-2 border-nb-primary hover:bg-nb-yellow/10"
                >
                  <td className="py-2.5 px-3 text-nb-text-muted">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={m.country_flag || ""}
                        alt={m.country_name || ""}
                        className="h-4 w-6 border border-nb-primary object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                      {m.meeting_name}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-nb-text-muted">
                    {m.location}, {m.country_name}
                  </td>
                  <td className="py-2.5 px-3 text-nb-text-muted">{m.circuit_short_name}</td>
                  <td className="py-2.5 px-3 text-nb-text-muted">
                    {m.date_start ? new Date(m.date_start).toLocaleDateString() : "--"}
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
