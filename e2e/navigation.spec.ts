import { test, expect } from "@playwright/test";

test.describe("F1 Visualizer - Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the dashboard", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("F1 Dashboard");
  });

  test("should have sidebar navigation", async ({ page }) => {
    await expect(page.locator("aside")).toBeVisible();
    await expect(page.getByText("F1 Visualizer")).toBeVisible();
  });

  test("should navigate to Lap Times page", async ({ page }) => {
    await page.click('a[href="/laps"]');
    await expect(page.locator("h1")).toContainText("Lap Times");
  });

  test("should navigate to Telemetry page", async ({ page }) => {
    await page.click('a[href="/telemetry"]');
    await expect(page.locator("h1")).toContainText("Telemetry");
  });

  test("should navigate to Strategy page", async ({ page }) => {
    await page.click('a[href="/strategy"]');
    await expect(page.locator("h1")).toContainText("Strategy");
  });

  test("should navigate to Standings page", async ({ page }) => {
    await page.click('a[href="/standings"]');
    await expect(page.locator("h1")).toContainText("Standings");
  });

  test("should navigate to Session page", async ({ page }) => {
    await page.click('a[href="/session"]');
    await expect(page.locator("h1")).toContainText("Sessions & Meetings");
  });

  test("should navigate to Drivers page", async ({ page }) => {
    await page.click('a[href="/drivers"]');
    await expect(page.locator("h1")).toContainText("Drivers");
  });

  test("should navigate to Intervals page", async ({ page }) => {
    await page.click('a[href="/intervals"]');
    await expect(page.locator("h1")).toContainText("Intervals");
  });

  test("should navigate to Pit Stops page", async ({ page }) => {
    await page.click('a[href="/pit"]');
    await expect(page.locator("h1")).toContainText("Pit Stops");
  });

  test("should navigate to Race Control page", async ({ page }) => {
    await page.click('a[href="/race-control"]');
    await expect(page.locator("h1")).toContainText("Race Control");
  });

  test("should navigate to Weather page", async ({ page }) => {
    await page.click('a[href="/weather"]');
    await expect(page.locator("h1")).toContainText("Weather");
  });

  test("should navigate to Team Radio page", async ({ page }) => {
    await page.click('a[href="/team-radio"]');
    await expect(page.locator("h1")).toContainText("Team Radio");
  });

  test("should navigate to Overtakes page", async ({ page }) => {
    await page.click('a[href="/overtakes"]');
    await expect(page.locator("h1")).toContainText("Overtakes");
  });
});
