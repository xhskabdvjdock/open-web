import { getTranslations } from "next-intl/server";

export async function SiteFooter({ siteName, locale }: { siteName: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600 sm:px-6 dark:text-gray-400">
        <p>{t("rights", { year, site: siteName })}</p>
      </div>
    </footer>
  );
}
