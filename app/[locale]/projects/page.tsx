import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { getAvailableCategories, getAvailableTechnologies, getPublishedProjects, getSiteSettings } from "@/lib/projects";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectsPage" });
  const s = await getSiteSettings(["siteName"]);
  return { title: t("meta", { site: s.siteName || (locale === "en" ? "Projects" : "أعمالي") }) };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectsPage" });
  const [projects, settings, categories, technologies] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings(["siteName", "siteTagline", "aboutTitle", "aboutBody"]),
    getAvailableCategories(),
    getAvailableTechnologies(),
  ]);
  const isEn = locale === "en";

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader
        siteName={settings.siteName || (isEn ? "Projects" : "أعمالي")}
        siteTagline={settings.siteTagline || ""}
        locale={locale}
        hasAbout={Boolean(settings.aboutTitle || settings.aboutBody)}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("h1")}</h1>
        <p className="mt-1 text-[15px] text-gray-600 dark:text-gray-400">{t("sub")}</p>
        <div className="mt-6">
          <ProjectGrid projects={projects} categories={categories} technologies={technologies} />
        </div>
      </main>
      <SiteFooter siteName={settings.siteName || (isEn ? "Projects" : "أعمالي")} locale={locale} />
    </div>
  );
}
