"use client";

import { useState, createContext, useContext, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/lib/api/f1";
import type { Meeting, Session } from "@/lib/types/f1";
import { ChevronDown, Loader2 } from "lucide-react";

interface SessionContextType {
  meetingKey: number | string;
  sessionKey: number | string;
  setMeetingKey: (key: number | string) => void;
  setSessionKey: (key: number | string) => void;
  meeting: Meeting | undefined;
  session: Session | undefined;
  meetings: Meeting[];
  sessions: Session[];
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [meetingKey, setMeetingKey] = useState<number | string>("latest");
  const [sessionKey, setSessionKey] = useState<number | string>("latest");

  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings", 2026],
    queryFn: () => f1Api.meetings.list({ year: 2026 }),
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions", meetingKey],
    queryFn: () =>
      meetingKey === "latest"
        ? f1Api.sessions.latest()
        : f1Api.sessions.list({ meeting_key: meetingKey }),
    enabled: !!meetingKey,
  });

  const handleSetMeetingKey = useCallback((key: number | string) => {
    setMeetingKey(key);
    setSessionKey("latest");
  }, []);

  useEffect(() => {
    if (meetingKey !== "latest" && sessions.length > 0) {
      const currentSessionExists = sessions.some(
        (s) => s.session_key === sessionKey
      );
      if (sessionKey === "latest" || !currentSessionExists) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSessionKey(sessions[0].session_key);
      }
    }
  }, [meetingKey, sessions, sessionKey]);

  const meeting = meetings.find((m) => m.meeting_key === meetingKey);
  const session = sessions.find((s) => s.session_key === sessionKey);

  return (
    <SessionContext.Provider
      value={{
        meetingKey,
        sessionKey,
        setMeetingKey: handleSetMeetingKey,
        setSessionKey,
        meeting,
        session,
        meetings,
        sessions,
        isLoading,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function SessionSelector() {
  const {
    meetingKey,
    sessionKey,
    setMeetingKey,
    setSessionKey,
    meetings,
    sessions,
    meeting,
    session,
    isLoading,
  } = useSession();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <select
          value={String(meetingKey)}
          onChange={(e) => setMeetingKey(e.target.value)}
          className="appearance-none border-2 border-nb-primary bg-nb-surface px-3 py-1.5 pr-7 text-xs font-headline font-bold uppercase text-nb-text focus:border-nb-blue focus:outline-none shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
        >
          <option value="latest">LATEST MEETING</option>
          {meetings.map((m) => (
            <option key={m.meeting_key} value={m.meeting_key}>
              {m.meeting_name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-nb-text-muted"
        />
      </div>

      <div className="relative">
        <select
          value={String(sessionKey)}
          onChange={(e) => setSessionKey(Number(e.target.value) || e.target.value)}
          className="appearance-none border-2 border-nb-primary bg-nb-surface px-3 py-1.5 pr-7 text-xs font-headline font-bold uppercase text-nb-text focus:border-nb-blue focus:outline-none shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
        >
          {meetingKey === "latest" && (
            <option value="latest">LATEST SESSION</option>
          )}
          {sessions.map((s) => (
            <option key={s.session_key} value={s.session_key}>
              {s.session_name} - {s.country_name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-nb-text-muted"
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-1.5 text-nb-yellow">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-[10px] font-headline font-bold uppercase">Loading...</span>
        </div>
      )}

      {meeting && !isLoading && (
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-headline font-bold uppercase text-nb-text-muted">
          <img
            src={meeting.country_flag}
            alt={meeting.country_name}
            className="h-3 w-5 object-cover border border-nb-primary"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
          <span>
            {meeting.circuit_short_name} &middot; {meeting.location}
          </span>
          {session && (
            <span className="bg-nb-yellow text-nb-primary px-2 py-0.5 text-[9px] font-black">
              {new Date(session.date_start).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
