import { test, expect } from "@playwright/test";

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
