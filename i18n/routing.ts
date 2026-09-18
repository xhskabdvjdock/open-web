import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  // Arabic URLs stay clean (/, /projects, /addweb) — English gets /en prefix.
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];

/** Build a locale-aware href without reading the request (static-safe for Server Components). */
export function localizedPath(path: `/${string}`, locale: string): string {
  if (locale !== "en") return path;
  return path === "/" ? "/en" : `/en${path}`;
}
