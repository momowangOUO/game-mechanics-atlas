import type { Page } from "@playwright/test";

export const testBasePath = (process.env.PAGES_BASE_PATH ?? "").replace(
  /\/$/,
  "",
);

// A leading slash replaces baseURL's path in Playwright, so prefix explicitly.
export function appPath(value: string) {
  return `${testBasePath}${value}`;
}

export function gotoApp(page: Page, value: string) {
  return page.goto(appPath(value));
}

/** Next's trailingSlash also applies before a URL query string. */
export function appHref(value: string) {
  const [pathname, query] = value.split("?");
  return `${appPath(pathname.endsWith("/") ? pathname : `${pathname}/`)}${query === undefined ? "" : `?${query}`}`;
}
