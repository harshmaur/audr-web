import { expect, test } from "@playwright/test";

test("security page loads", async ({ page }) => {
  await page.goto("/security");
  await expect(page.locator("h1")).toContainText("/security");
});

test("security.txt is reachable", async ({ request }) => {
  const res = await request.get("/.well-known/security.txt");
  expect(res.ok()).toBeTruthy();
  expect(await res.text()).toMatch(/Contact: mailto:harsh@saasalerts\.com/);
});

test("robots.txt allows AI scrapers", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.ok()).toBeTruthy();
  const body = await res.text();
  expect(body).toMatch(/User-agent: GPTBot/);
  expect(body).toMatch(/User-agent: ClaudeBot/);
});
