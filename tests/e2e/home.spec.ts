import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const cveCount = JSON.parse(readFileSync("src/data/cves.json", "utf8")).length;

test.describe("homepage", () => {
  test("renders H1 with the hero CVE id", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("CVE-");
  });

  test("install curl block is copyable", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permission needs chromium");
    await page.goto("/");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.click("[data-copy-button]");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe("curl -fsSL https://audr.dev/install.sh | sh");
  });

  test("View sample report → /sample-report", async ({ page }) => {
    await page.goto("/");
    const link = page.locator('[data-cta="sample-report"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/sample-report");
  });

  test("CVE strip shows the full CVE store", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("article", { has: page.locator(".text-sev-ok") });
    await expect(cards).toHaveCount(cveCount);
  });

  test("theme toggle persists across reload", async ({ page }) => {
    await page.goto("/");
    await page.click("[data-theme-toggle]");
    const themeAfterClick = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(themeAfterClick).toBe("light");
    await page.reload();
    const themeAfterReload = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(themeAfterReload).toBe("light");
  });
});
