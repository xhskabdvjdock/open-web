"use client";

import { Suspense } from "react";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

function SwitcherLink({ query }: { query: Record<string, string> }) {
  const locale = useLocale();
  const t = useTranslations("switcher");
  const pathname = usePathname();
  const other = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={{ pathname, query }}
      locale={other}
      aria-label={t("label")}
      className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      <Globe className="h-4 w-4" aria-hidden />
      {other === "en" ? t("toEnglish") : t("toArabic")}
    </Link>
  );
}

function SwitcherWithQuery() {
  const searchParams = useSearchParams();
  const query: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    query[k] = v;
  });
  return <SwitcherLink query={query} />;
}

export function LocaleSwitcher() {
  const locale = useLocale();
  const other = locale === "ar" ? "en" : "ar";
  return (
    <Suspense
      fallback={
        <span className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300" aria-hidden>
          <Globe className="h-4 w-4" aria-hidden />
          {other === "en" ? "EN" : "عربي"}
        </span>
      }
    >
      <SwitcherWithQuery />
    </Suspense>
  );
}
