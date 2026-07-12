import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test("renders category-led agent posture H1", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("AI coding agents");
    await expect(h1).toContainText("local config risk");
    await expect(h1).not.toContainText("CVE-");
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

  test("homepage repositioning proof copy is visible", async ({ page }) => {
    await page.goto("/");

    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /AI-agent configuration/);
    await expect(metaDescription).not.toHaveAttribute("content", /detected on the first run/);

    await expect(page.locator("text=fresh local posture checks")).toBeVisible();
    await expect(page.locator("text=live: CVE-")).toHaveCount(0);
    await expect(page.locator("text=Paste a redacted config to preview supported file-level checks.")).toBeVisible();
    await expect(page.locator("text=Signed release. SHA-256 verified. No telemetry.")).toBeVisible();
    await expect(page.locator("text=Then run audr scan")).toBeVisible();
  });

  test("buyer conversion sections are visible", async ({ page }) => {
    await page.goto("/");

    const fleetCta = page.locator('[data-cta="fleet-risk-review"]');
    await expect(fleetCta).toBeVisible();
    await expect(fleetCta).toHaveAttribute("href", "#fleet-pilot");

    await expect(page.locator("text=Install → scan → share a local report")).toBeVisible();
    await expect(page.locator("text=No account, no SaaS tenant, no background daemon.")).toBeVisible();
    await expect(page.locator("text=Built for a security-team pilot, not a growth funnel.")).toBeVisible();
    await expect(page.locator("text=Offline by default")).toBeVisible();
    await expect(page.locator('[data-cta="mail-fleet-review"]')).toHaveAttribute(
      "href",
      /mailto:harshmaur@gmail\.com/,
    );
  });

  test("demo results include conversion CTAs", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-format="claude"]');
    await page.click('[data-testid="scan-button"]');

    const panel = page.locator('[data-testid="demo-cta-panel"]');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Run this on your real laptop");
    await expect(page.locator('[data-cta="demo-sample-report"]')).toHaveAttribute(
      "href",
      "/sample-report",
    );
    await expect(page.locator('[data-cta="demo-design-partner"]')).toHaveAttribute(
      "href",
      "#fleet-pilot",
    );
    await expect(page.locator("text=Evidence").first()).toBeVisible();
    await expect(page.locator("text=Fleet relevance").first()).toBeVisible();
  });

  test("sample report teaser is attack-path oriented", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator("text=Top 3 ways your AI-agent setup can currently be abused."),
    ).toBeVisible();
    await expect(page.locator("text=Attacker gets").first()).toBeVisible();
    await expect(page.locator("text=Business impact").first()).toBeVisible();
  });

  test("CVE strip shows latest five advisory proof cards", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator('[data-section="advisory-proof"] [data-cve-card]');
    await expect(cards).toHaveCount(5);
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
