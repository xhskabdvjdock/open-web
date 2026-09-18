import { getTranslations } from "next-intl/server";
import { NotFoundContent } from "@/components/NotFoundContent";

// Catches mistyped URLs under a known locale (e.g. /en/typo) and renders a
// localized 404 page. Explicit routes always take precedence over this catch-all.
export default async function CatchAllPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notFound" });
  return (
    <NotFoundContent
      title={t("title")}
      body={t("body")}
      back={t("back")}
      backHref={locale === "en" ? "/en" : "/"}
      dir={locale === "en" ? "ltr" : "rtl"}
    />
  );
}
