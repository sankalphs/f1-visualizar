import type {
  Meeting,
  Session,
  Driver,
  CarData,
  Location,
  Lap,
  Interval,
  Stint,
  Pit,
  Position,
  RaceControl,
  SessionResult,
  StartingGrid,
  TeamRadio,
  Weather,
  Overtake,
  ChampionshipDriver,
  ChampionshipTeam,
} from "@/lib/types/f1";

// Use our proxy route to avoid rate limiting
const BASE_URL = "/api/f1";

type QueryParams = Record<string, string | number | boolean | undefined>;

function buildUrl(endpoint: string, params?: QueryParams): string {
  const url = new URL(`${BASE_URL}`, window.location.origin);
  url.searchParams.append("endpoint", endpoint);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    }
  }
  return url.toString();
}

async function fetchApi<T>(endpoint: string, params?: QueryParams): Promise<T> {
  const url = buildUrl(endpoint, params);
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const f1Api = {
  meetings: {
    list: (params?: QueryParams) => fetchApi<Meeting[]>("meetings", params),
    latest: () => fetchApi<Meeting[]>("meetings", { meeting_key: "latest" }),
  },

  sessions: {
    list: (params?: QueryParams) => fetchApi<Session[]>("sessions", params),
    latest: () => fetchApi<Session[]>("sessions", { session_key: "latest" }),
  },

  drivers: {
    list: (params?: QueryParams) => fetchApi<Driver[]>("drivers", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<Driver[]>("drivers", { session_key: sessionKey }),
  },

  carData: {
    list: (params?: QueryParams) => fetchApi<CarData[]>("car_data", params),
    byDriver: (sessionKey: number | string, driverNumber: number) =>
      fetchApi<CarData[]>("car_data", {
        session_key: sessionKey,
        driver_number: driverNumber,
      }),
  },

  location: {
    list: (params?: QueryParams) => fetchApi<Location[]>("location", params),
    byDriver: (sessionKey: number | string, driverNumber: number) =>
      fetchApi<Location[]>("location", {
        session_key: sessionKey,
        driver_number: driverNumber,
      }),
  },

  laps: {
    list: (params?: QueryParams) => fetchApi<Lap[]>("laps", params),
    byDriver: (sessionKey: number | string, driverNumber: number) =>
      fetchApi<Lap[]>("laps", {
        session_key: sessionKey,
        driver_number: driverNumber,
      }),
    byDriverAndLap: (sessionKey: number | string, driverNumber: number, lapNumber: number) =>
      fetchApi<Lap[]>("laps", {
        session_key: sessionKey,
        driver_number: driverNumber,
        lap_number: lapNumber,
      }),
  },

  intervals: {
    list: (params?: QueryParams) => fetchApi<Interval[]>("intervals", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<Interval[]>("intervals", { session_key: sessionKey }),
  },

  stints: {
    list: (params?: QueryParams) => fetchApi<Stint[]>("stints", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<Stint[]>("stints", { session_key: sessionKey }),
    byDriver: (sessionKey: number | string, driverNumber: number) =>
      fetchApi<Stint[]>("stints", {
        session_key: sessionKey,
        driver_number: driverNumber,
      }),
  },

  pit: {
    list: (params?: QueryParams) => fetchApi<Pit[]>("pit", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<Pit[]>("pit", { session_key: sessionKey }),
  },

  position: {
    list: (params?: QueryParams) => fetchApi<Position[]>("position", params),
    byDriver: (sessionKey: number | string, driverNumber: number) =>
      fetchApi<Position[]>("position", {
        session_key: sessionKey,
        driver_number: driverNumber,
      }),
  },

  raceControl: {
    list: (params?: QueryParams) => fetchApi<RaceControl[]>("race_control", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<RaceControl[]>("race_control", { session_key: sessionKey }),
  },

  sessionResult: {
    list: (params?: QueryParams) =>
      fetchApi<SessionResult[]>("session_result", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<SessionResult[]>("session_result", { session_key: sessionKey }),
  },

  startingGrid: {
    list: (params?: QueryParams) =>
      fetchApi<StartingGrid[]>("starting_grid", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<StartingGrid[]>("starting_grid", { session_key: sessionKey }),
  },

  teamRadio: {
    list: (params?: QueryParams) => fetchApi<TeamRadio[]>("team_radio", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<TeamRadio[]>("team_radio", { session_key: sessionKey }),
    byDriver: (sessionKey: number | string, driverNumber: number) =>
      fetchApi<TeamRadio[]>("team_radio", {
        session_key: sessionKey,
        driver_number: driverNumber,
      }),
  },

  weather: {
    list: (params?: QueryParams) => fetchApi<Weather[]>("weather", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<Weather[]>("weather", { session_key: sessionKey }),
  },

  overtakes: {
    list: (params?: QueryParams) => fetchApi<Overtake[]>("overtakes", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<Overtake[]>("overtakes", { session_key: sessionKey }),
  },

  championshipDrivers: {
    list: (params?: QueryParams) =>
      fetchApi<ChampionshipDriver[]>("championship_drivers", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<ChampionshipDriver[]>("championship_drivers", {
        session_key: sessionKey,
      }),
  },

  championshipTeams: {
    list: (params?: QueryParams) =>
      fetchApi<ChampionshipTeam[]>("championship_teams", params),
    bySession: (sessionKey: number | string) =>
      fetchApi<ChampionshipTeam[]>("championship_teams", {
        session_key: sessionKey,
      }),
  },
};
