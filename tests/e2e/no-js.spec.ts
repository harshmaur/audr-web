import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("homepage critical content is visible without JavaScript", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator('[data-copy-source]')).toBeVisible();
  await expect(page.locator('[data-cta="sample-report"]')).toBeVisible();
});
