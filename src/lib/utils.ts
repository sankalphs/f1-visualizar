import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLapTime(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "--:--.---";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toFixed(3).padStart(6, "0")}`;
}

export function formatInterval(interval: number | string | null): string {
  if (interval === null || interval === undefined) return "";
  if (typeof interval === "string") return interval;
  return `+${interval.toFixed(3)}s`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString();
}

export function getDrsStatus(drs: number): string {
  switch (drs) {
    case 0:
    case 1:
      return "Off";
    case 8:
      return "Eligible";
    case 10:
    case 12:
    case 14:
      return "On";
    default:
      return "Unknown";
  }
}

export function getTyreColor(compound: string): string {
  switch (compound?.toUpperCase()) {
    case "SOFT":
      return "#FF3333";
    case "MEDIUM":
      return "#FFD700";
    case "HARD":
      return "#FFFFFF";
    case "INTERMEDIATE":
      return "#33CC33";
    case "WET":
      return "#3399FF";
    default:
      return "#888888";
  }
}

export function getFlagEmoji(flag: string | null): string {
  switch (flag) {
    case "GREEN":
      return "🟢";
    case "YELLOW":
      return "🟡";
    case "DOUBLE YELLOW":
      return "🟡🟡";
    case "RED":
      return "🔴";
    case "BLUE":
      return "🔵";
    case "BLACK AND WHITE":
      return "⬛⬜";
    case "BLACK":
      return "⬛";
    case "CHEQUERED":
      return "🏁";
    default:
      return "🏳️";
  }
}
