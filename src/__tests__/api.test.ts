import { describe, it, expect } from "vitest";
import { f1Api } from "@/lib/api/f1";

describe("f1Api", () => {
  describe("meetings", () => {
    it("returns an array of meetings", async () => {
      const data = await f1Api.meetings.list({ year: 2025 });
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe("sessions", () => {
    it("returns sessions data", async () => {
      const data = await f1Api.sessions.latest();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("drivers", () => {
    it("returns drivers data", async () => {
      const data = await f1Api.drivers.bySession("latest");
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty("name_acronym");
        expect(data[0]).toHaveProperty("team_name");
        expect(data[0]).toHaveProperty("driver_number");
      }
    });
  });

  describe("laps", () => {
    it("returns laps data with correct structure", async () => {
      const data = await f1Api.laps.list({ session_key: 9839 });
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty("lap_number");
        expect(data[0]).toHaveProperty("lap_duration");
        expect(data[0]).toHaveProperty("driver_number");
      }
    });
  });

  describe("weather", () => {
    it("returns weather data with correct structure", async () => {
      const data = await f1Api.weather.bySession(9839);
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty("track_temperature");
        expect(data[0]).toHaveProperty("air_temperature");
      }
    });
  });

  describe("all endpoints return arrays", () => {
    it("intervals returns array", async () => {
      const data = await f1Api.intervals.bySession(9839);
      expect(Array.isArray(data)).toBe(true);
    });

    it("pit returns array", async () => {
      const data = await f1Api.pit.bySession(9839);
      expect(Array.isArray(data)).toBe(true);
    });

    it("race control returns array", async () => {
      const data = await f1Api.raceControl.bySession(9839);
      expect(Array.isArray(data)).toBe(true);
    });

    it("team radio returns array", async () => {
      const data = await f1Api.teamRadio.byDriver(9839, 1);
      expect(Array.isArray(data)).toBe(true);
    });

    it("overtakes returns array", async () => {
      const data = await f1Api.overtakes.bySession(9839);
      expect(Array.isArray(data)).toBe(true);
    });

    it("stints returns array", async () => {
      const data = await f1Api.stints.byDriver(9839, 1);
      expect(Array.isArray(data)).toBe(true);
    });

    it("championship drivers returns array", async () => {
      const data = await f1Api.championshipDrivers.bySession(9839);
      expect(Array.isArray(data)).toBe(true);
    });

    it("championship teams returns array", async () => {
      const data = await f1Api.championshipTeams.bySession(9839);
      expect(Array.isArray(data)).toBe(true);
    });

    it("position returns array", async () => {
      const data = await f1Api.position.list({ session_key: 9839 });
      expect(Array.isArray(data)).toBe(true);
    });

    it("session result returns array", async () => {
      const data = await f1Api.sessionResult.bySession(9839);
      expect(Array.isArray(data)).toBe(true);
    });

    it("starting grid returns array", async () => {
      const data = await f1Api.startingGrid.bySession(9839);
      expect(Array.isArray(data)).toBe(true);
    });

    it("car data returns array", async () => {
      const data = await f1Api.carData.byDriver(9839, 1);
      expect(Array.isArray(data)).toBe(true);
    });

    it("location returns array", async () => {
      const data = await f1Api.location.byDriver(9839, 1);
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
