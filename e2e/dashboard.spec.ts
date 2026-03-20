import { test, expect } from "@playwright/test";

test.describe("F1 Visualizer - Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display session selector", async ({ page }) => {
    await expect(page.locator("select")).toHaveCount(2);
  });

  test("should display quick stats cards", async ({ page }) => {
    await expect(page.getByText("Drivers")).toBeVisible();
    await expect(page.getByText("Laps Recorded")).toBeVisible();
    await expect(page.getByText("Pit Stops")).toBeVisible();
    await expect(page.getByText("RC Events")).toBeVisible();
    await expect(page.getByText("Overtakes")).toBeVisible();
    await expect(page.getByText("Radio Clips")).toBeVisible();
  });

  test("should display weather section", async ({ page }) => {
    await expect(page.getByText("Weather")).toBeVisible();
  });

  test("should display current positions table", async ({ page }) => {
    await expect(page.getByText("Current Positions")).toBeVisible();
  });

  test("should display best lap times section", async ({ page }) => {
    await expect(page.getByText("Best Lap Times")).toBeVisible();
  });

  test("should display race control section", async ({ page }) => {
    await expect(page.getByText("Recent Race Control")).toBeVisible();
  });

  test("should display pit stops section", async ({ page }) => {
    await expect(page.getByText("Pit Stops")).toBeVisible();
  });
});

test.describe("F1 Visualizer - Telemetry Page", () => {
  test("should display driver selection buttons", async ({ page }) => {
    await page.goto("/telemetry");
    await expect(page.getByText("Select Drivers")).toBeVisible();
  });

  test("should display speed chart title", async ({ page }) => {
    await page.goto("/telemetry");
    await expect(page.getByText("Speed (km/h)")).toBeVisible();
  });
});

test.describe("F1 Visualizer - Strategy Page", () => {
  test("should display tire strategy timeline", async ({ page }) => {
    await page.goto("/strategy");
    await expect(page.getByText("Tire Strategy Timeline")).toBeVisible();
  });

  test("should display stint details table", async ({ page }) => {
    await page.goto("/strategy");
    await expect(page.getByText("Stint Details")).toBeVisible();
  });
});

test.describe("F1 Visualizer - Weather Page", () => {
  test("should display weather charts", async ({ page }) => {
    await page.goto("/weather");
    await expect(page.getByText("Temperature Over Time")).toBeVisible();
    await expect(page.getByText("Humidity & Wind")).toBeVisible();
  });

  test("should display weather history table", async ({ page }) => {
    await page.goto("/weather");
    await expect(page.getByText("Weather History")).toBeVisible();
  });
});
