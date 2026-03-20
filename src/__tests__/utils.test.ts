import { describe, it, expect } from "vitest";
import {
  formatLapTime,
  formatInterval,
  getDrsStatus,
  getTyreColor,
  cn,
} from "@/lib/utils";

describe("formatLapTime", () => {
  it("formats null as --:--.---", () => {
    expect(formatLapTime(null)).toBe("--:--.---");
  });

  it("formats seconds correctly", () => {
    expect(formatLapTime(91.5)).toBe("1:31.500");
  });

  it("formats sub-minute times", () => {
    expect(formatLapTime(45.123)).toBe("0:45.123");
  });

  it("formats times with padding", () => {
    expect(formatLapTime(72.005)).toBe("1:12.005");
  });
});

describe("formatInterval", () => {
  it("formats null as empty string", () => {
    expect(formatInterval(null)).toBe("");
  });

  it("formats number with + prefix", () => {
    expect(formatInterval(1.234)).toBe("+1.234s");
  });

  it("formats string laps as-is", () => {
    expect(formatInterval("+1 LAP")).toBe("+1 LAP");
  });
});

describe("getDrsStatus", () => {
  it("returns Off for 0 or 1", () => {
    expect(getDrsStatus(0)).toBe("Off");
    expect(getDrsStatus(1)).toBe("Off");
  });

  it("returns On for 10, 12, 14", () => {
    expect(getDrsStatus(10)).toBe("On");
    expect(getDrsStatus(12)).toBe("On");
    expect(getDrsStatus(14)).toBe("On");
  });

  it("returns Eligible for 8", () => {
    expect(getDrsStatus(8)).toBe("Eligible");
  });
});

describe("getTyreColor", () => {
  it("returns red for SOFT", () => {
    expect(getTyreColor("SOFT")).toBe("#FF3333");
  });

  it("returns gold for MEDIUM", () => {
    expect(getTyreColor("MEDIUM")).toBe("#FFD700");
  });

  it("returns white for HARD", () => {
    expect(getTyreColor("HARD")).toBe("#FFFFFF");
  });

  it("returns green for INTERMEDIATE", () => {
    expect(getTyreColor("INTERMEDIATE")).toBe("#33CC33");
  });

  it("returns blue for WET", () => {
    expect(getTyreColor("WET")).toBe("#3399FF");
  });

  it("handles case insensitivity", () => {
    expect(getTyreColor("soft")).toBe("#FF3333");
  });

  it("returns gray for unknown", () => {
    expect(getTyreColor("UNKNOWN")).toBe("#888888");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });
});
