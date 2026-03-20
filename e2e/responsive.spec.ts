import { test, expect } from "@playwright/test";

test.describe("F1 Visualizer - Responsive", () => {
  test("should work on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await expect(page.locator("aside")).toBeVisible();
    await expect(page.locator("h1")).toContainText("F1 Dashboard");
  });

  test("should display sidebar collapse button", async ({ page }) => {
    await page.goto("/");
    const collapseBtn = page.locator("aside button").first();
    await expect(collapseBtn).toBeVisible();
  });

  test("should collapse sidebar on toggle", async ({ page }) => {
    await page.goto("/");
    const collapseBtn = page.locator("aside button").first();
    await collapseBtn.click();
    // After collapse, the sidebar should have w-16 class
    const sidebar = page.locator("aside");
    await expect(sidebar).toHaveClass(/w-16/);
  });
});

test.describe("F1 Visualizer - Accessibility", () => {
  test("should have proper page title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/F1 Visualizer/);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
  });

  test("should have accessible navigation", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });
});

test.describe("F1 Visualizer - API Integration", () => {
  test("should load meetings data", async ({ page }) => {
    await page.goto("/");
    // Wait for data to load
    await page.waitForTimeout(3000);
    // Check if session selector has options loaded
    const selectCount = await page.locator("select option").count();
    expect(selectCount).toBeGreaterThanOrEqual(1);
  });
});
