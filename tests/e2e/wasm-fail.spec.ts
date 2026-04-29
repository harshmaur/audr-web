import { expect, test } from "@playwright/test";

test("WASM blob blocked → graceful fallback panel", async ({ page }) => {
  await page.route("**/wasm/audr.wasm", (route) => route.abort());
  await page.goto("/");
  // Wait for the demo island to hydrate and try to boot WASM.
  const demo = page.locator('[data-testid="scan-demo"], [data-testid="wasm-error"]');
  await demo.first().waitFor({ state: "visible", timeout: 10_000 });
  await page.click('[data-testid="scan-button"]', { trial: false }).catch(() => {});
  // Either the error panel is shown OR the demo's chrome bar still renders without findings.
  const errorPanel = page.locator('[data-testid="wasm-error"]');
  await expect(errorPanel).toBeVisible({ timeout: 10_000 });
  await expect(errorPanel).toContainText(/curl -fsSL https:\/\/audr\.dev\/install\.sh/);
});
