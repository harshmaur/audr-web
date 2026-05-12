import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("coverage ledger critical content is visible without JavaScript", async ({ page }) => {
  await page.goto("/coverage");
  await expect(page.locator("h1")).toContainText("Audr advisory ledger");
  await expect(page.locator("text=Only rows marked “shipped local check” are detected by Audr today")).toBeVisible();
  await expect(page.locator('[data-section="shipped-checks"] [data-status="shipped"]').first()).toBeVisible();
});
