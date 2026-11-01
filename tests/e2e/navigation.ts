import { expect, type Page } from "@playwright/test";

export const testBasePath = (process.env.PAGES_BASE_PATH ?? "").replace(
  /\/$/,
  "",
);

// A leading slash replaces baseURL's path in Playwright, so prefix explicitly.
export function appPath(value: string) {
  return `${testBasePath}${value}`;
}

export async function gotoApp(
  page: Page,
  value: string,
  { waitForIntro = true }: { waitForIntro?: boolean } = {},
) {
  const response = await page.goto(appPath(value));
  if (waitForIntro) {
    // The intro mounts after hydration. An initial hidden check races that mount.
    const intro = page.getByTestId("brand-intro");
    await expect(intro).toBeVisible();
    await expect(intro).toBeHidden();
    await expect(page.locator('[hidden][id^="S:"]')).toHaveCount(0);
  }
  return response;
}

/** Next's trailingSlash also applies before a URL query string. */
export function appHref(value: string) {
  const [pathname, query] = value.split("?");
  return `${appPath(pathname.endsWith("/") ? pathname : `${pathname}/`)}${query === undefined ? "" : `?${query}`}`;
}
