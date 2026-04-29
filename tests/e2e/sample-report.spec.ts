import { expect, test } from "@playwright/test";

test("sample report renders and contains zero path leaks", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  const res = await page.goto("/sample-report.html");
  expect(res?.ok()).toBeTruthy();

  const html = await page.content();
  expect(html).not.toMatch(/\/home\//);
  expect(html).not.toMatch(/\/Users\//);
  expect(html).not.toMatch(/\/parallels\//);
  expect(html).not.toMatch(/testdata\//);

  await expect(page.locator("h1.verdict-lead")).toBeVisible();
  expect(errors).toEqual([]);
});
