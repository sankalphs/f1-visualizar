import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const mockMeeting = {
  circuit_key: 61,
  circuit_info_url: "",
  circuit_image: "",
  circuit_short_name: "Bahrain",
  circuit_type: "Permanent",
  country_code: "BHR",
  country_flag: "",
  country_key: 4,
  country_name: "Bahrain",
  date_end: "2025-03-02T18:00:00+00:00",
  date_start: "2025-02-28T11:30:00+00:00",
  gmt_offset: "03:00:00",
  location: "Sakhir",
  meeting_key: 1269,
  meeting_name: "Bahrain Grand Prix",
  meeting_official_name: "FORMULA 1 GULF AIR BAHRAIN GRAND PRIX 2025",
  year: 2025,
};

const mockSession = {
  circuit_key: 61,
  circuit_short_name: "Bahrain",
  country_code: "BHR",
  country_key: 4,
  country_name: "Bahrain",
  date_end: "2025-03-02T18:00:00+00:00",
  date_start: "2025-03-02T16:00:00+00:00",
  gmt_offset: "03:00:00",
  location: "Sakhir",
  meeting_key: 1269,
  session_key: 9839,
  session_name: "Race",
  session_type: "Race",
  year: 2025,
};

const mockDriver = {
  broadcast_name: "M VERSTAPPEN",
  driver_number: 1,
  first_name: "Max",
  full_name: "Max VERSTAPPEN",
  headshot_url: "",
  last_name: "Verstappen",
  meeting_key: 1269,
  name_acronym: "VER",
  session_key: 9839,
  team_colour: "3671C6",
  team_name: "Red Bull Racing",
};

const mockLap = {
  date_start: "2025-03-02T16:05:00.000Z",
  driver_number: 1,
  duration_sector_1: 28.5,
  duration_sector_2: 35.2,
  duration_sector_3: 27.8,
  i1_speed: 290,
  i2_speed: 275,
  is_pit_out_lap: false,
  lap_duration: 91.5,
  lap_number: 1,
  meeting_key: 1269,
  segments_sector_1: [],
  segments_sector_2: [],
  segments_sector_3: [],
  session_key: 9839,
  st_speed: 310,
};

const mockWeather = {
  air_temperature: 25.0,
  date: "2025-03-02T16:00:00.000Z",
  humidity: 45,
  meeting_key: 1269,
  pressure: 1013.0,
  rainfall: 0,
  session_key: 9839,
  track_temperature: 35.0,
  wind_direction: 180,
  wind_speed: 3.0,
};

export const handlers = [
  http.get("https://api.openf1.org/v1/meetings", () => {
    return HttpResponse.json([mockMeeting]);
  }),
  http.get("https://api.openf1.org/v1/sessions", () => {
    return HttpResponse.json([mockSession]);
  }),
  http.get("https://api.openf1.org/v1/drivers", () => {
    return HttpResponse.json([mockDriver]);
  }),
  http.get("https://api.openf1.org/v1/laps", () => {
    return HttpResponse.json([mockLap]);
  }),
  http.get("https://api.openf1.org/v1/weather", () => {
    return HttpResponse.json([mockWeather]);
  }),
  http.get("https://api.openf1.org/v1/car_data", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/location", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/intervals", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/stints", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/pit", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/position", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/race_control", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/session_result", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/starting_grid", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/team_radio", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/overtakes", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/championship_drivers", () => HttpResponse.json([])),
  http.get("https://api.openf1.org/v1/championship_teams", () => HttpResponse.json([])),
];

export const server = setupServer(...handlers);
