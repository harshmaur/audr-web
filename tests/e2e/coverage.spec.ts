import { expect, test } from "@playwright/test";

test.describe("coverage ledger", () => {
  test("renders the public advisory ledger without overclaiming detection", async ({ page }) => {
    await page.goto("/coverage");

    await expect(page.locator("h1")).toContainText("Audr advisory ledger");
    await expect(page.locator('[data-section="coverage-hero"]')).toContainText("public snapshot");
    await expect(page.locator("text=Only rows marked “shipped local check” are detected by Audr today")).toBeVisible();
    await expect(page.locator("text=not detection coverage")).toBeVisible();

    await expect(page.locator("text=shipped local checks").first()).toBeVisible();
    await expect(page.locator("text=latest advisory reviewed")).toBeVisible();
    await expect(page.locator("text=agent products represented")).toBeVisible();
    await expect(page.locator("text=public snapshot updated")).toBeVisible();

    await expect(page.locator('[data-section="shipped-checks"] [data-status="shipped"]').first()).toBeVisible();
    const selectedRows = page.locator('[data-section="selected-triage"] [data-status="actionable"], [data-section="selected-triage"] [data-status="investigating"]');
    const clearedState = page.locator('[data-section="selected-triage"] [data-status="cleared"]');
    await expect(selectedRows.first().or(clearedState)).toBeVisible();
    await expect(page.locator('[data-status="irrelevant"], [data-status="duplicate"], [data-status="not_auditable"]')).toHaveCount(0);
    await expect(page.locator('a[href^="https://nvd.nist.gov/vuln/detail/CVE-"]').first()).toBeVisible();
  });

  test("homepage advisory proof links to coverage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-section="advisory-proof"] [data-cve-card]')).toHaveCount(5);
    const link = page.locator('[data-cta="coverage-ledger"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/coverage");
  });
});
