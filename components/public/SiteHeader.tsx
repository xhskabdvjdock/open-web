import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { localizedPath } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeProvider";

export async function SiteHeader({
  siteName,
  siteTagline,
  locale,
  hasAbout,
}: {
  siteName: string;
  siteTagline: string;
  locale: string;
  hasAbout: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "header" });
  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={localizedPath("/", locale)} className="flex items-baseline gap-2" aria-label={t("homeAria", { site: siteName })}>
          <span className="text-base font-bold text-gray-900 dark:text-gray-100">{siteName}</span>
          {siteTagline && <span className="hidden text-sm text-gray-500 sm:inline dark:text-gray-400">{siteTagline}</span>}
        </Link>
        <nav aria-label={t("navAria")} className="flex items-center gap-1 text-sm">
          <Link href={localizedPath("/", locale)} className="rounded-md px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            {t("navProjects")}
          </Link>
          <Link href={localizedPath("/projects", locale)} className="rounded-md px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            {t("navAll")}
          </Link>
          {hasAbout ? (
            <Link href={localizedPath("/#about", locale)} className="rounded-md px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              {t("navAbout")}
            </Link>
          ) : null}
          <LocaleSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
