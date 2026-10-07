import { test, expect } from "@playwright/test";

test("REQ-OTY-CONTENT-003 — HS Fall Retreat shows confirmed facts and TBD details", async ({
  page,
}) => {
  const response = await page.goto("/retreats-hs-fall");
  expect(response?.status()).toBe(200);
  const main = page.locator("main");
  await expect(
    main.getByRole("heading", { name: "HS Fall Retreat", exact: true }).first(),
  ).toBeVisible();
  await expect(main).toContainText("grades 9th-12th");
  await expect(main).toContainText("October 9-11, 2026");
  await expect(main).toContainText(
    "$125 for registrations before the early-bird deadline",
  );
  await expect(main).toContainText("Early-bird deadline: TBD");
  await expect(main).not.toContainText(
    /Ignite|February|January|winter|Jr\. High|\$115|2027/i,
  );
  await expect(main.locator('a[href*="ultracamp"]')).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Retreats", exact: true })
    .hover();
  await expect(
    page.locator('nav a[href="/retreats-hs-fall"]').first(),
  ).toHaveText("HS Fall Retreat");
  await expect(
    page.locator('nav a[href="/retreats-rooted"]').first(),
  ).toHaveText("Rooted");
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "BOLD Discipleship", exact: true })
    .hover();
  await expect(
    page.locator('nav a[href="/bold-growth-opportunities"]').first(),
  ).toHaveText(/Growth Opportunities/);
  await page.screenshot({
    path: "verification-screenshots/REQ-OTY-CONTENT-003-hs-fall.png",
    fullPage: true,
  });
});

for (const [slug, title, photo] of [
  ["rentals-cabins", "Delaware Lodge", "delaware-lodge-interior.jpg"],
  ["rentals-mingo", "Mingo Cabin", "mingo-cabin-common-area.jpg"],
  ["rentals-seasonal-cabins", "Seasonal Cabins", "seasonal-cabin-interior.jpg"],
]) {
  test(`REQ-OTY-CONTENT-002 — ${title} uses its existing stand-in photo`, async ({
    page,
  }) => {
    const response = await page.goto(`/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(
      page
        .locator("main")
        .getByRole("heading", { name: title, exact: true })
        .first(),
    ).toBeVisible();
    const imageResponse = await page.request.get(`/images/facilities/${photo}`);
    expect(imageResponse.status()).toBe(200);
    expect(imageResponse.headers()["content-type"]).toMatch(/^image\//);
    const heroVideo = page.locator("main video").first();
    await expect(heroVideo).toHaveAttribute(
      "poster",
      `/images/facilities/${photo}`,
    );
    await page.screenshot({
      path: `verification-screenshots/REQ-OTY-CONTENT-002-${slug}.png`,
      fullPage: true,
    });
  });
}

test("REQ-OTY-CONTENT-004 — Rentals links to the corrected rental pages", async ({
  page,
}) => {
  const response = await page.goto("/rentals");
  expect(response?.status()).toBe(200);
  for (const slug of [
    "rentals-cabins",
    "rentals-mingo",
    "rentals-seasonal-cabins",
  ]) {
    await expect(page.locator(`main a[href="/${slug}"]`).first()).toBeVisible();
  }
  await page.screenshot({
    path: "verification-screenshots/REQ-OTY-CONTENT-004-rentals.png",
    fullPage: true,
  });
});
