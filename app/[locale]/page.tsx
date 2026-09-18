import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { localizedPath } from "@/i18n/routing";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { PublicProjectCard } from "@/components/projects/PublicProjectCard";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { getAvailableCategories, getAvailableTechnologies, getPublishedProjects, getSiteSettings } from "@/lib/projects";

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const [projects, settings, categories, technologies] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings(["siteName", "siteTagline", "aboutTitle", "aboutBody"]),
    getAvailableCategories(),
    getAvailableTechnologies(),
  ]);

  const isEn = locale === "en";
  const featured = projects.filter((p) => p.featured);
  const siteName = settings.siteName || (isEn ? "Projects" : "أعمالي");
  const siteTagline = settings.siteTagline || "";
  const aboutTitle = settings.aboutTitle || "";
  const aboutBody = settings.aboutBody || "";
  const hasAbout = Boolean(aboutTitle || aboutBody);

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader siteName={siteName} siteTagline={siteTagline} locale={locale} hasAbout={hasAbout} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <section aria-labelledby="projects-heading" className="space-y-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("eyebrow")}</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 id="projects-heading" className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("title")}
            </h1>
            {projects.length > 6 && (
              <Link href={localizedPath("/projects", locale)} className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 underline underline-offset-4 dark:text-gray-100">
                {t("viewAll")} <ArrowLeft className="h-4 w-4 ltr:-scale-x-100" aria-hidden />
              </Link>
            )}
          </div>
          <p className="max-w-2xl text-[15px] leading-8 text-gray-600 dark:text-gray-400">
            {siteTagline ? `${siteTagline} ` : ""}{t("taglineSuffix")}
          </p>
        </section>

        {featured.length > 0 && (
          <section aria-labelledby="featured-heading" className="mt-10">
            <h2 id="featured-heading" className="text-sm font-bold text-gray-500 dark:text-gray-400">
              {t("featured")}
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PublicProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}

        <section aria-label={t("allLabel")} className="mt-10">
          <ProjectGrid projects={projects} categories={categories} technologies={technologies} />
        </section>

        {hasAbout && (
          <section
            id="about"
            {...(aboutTitle ? { "aria-labelledby": "about-heading" } : {})}
            className="mt-16 border-t border-gray-200 pt-10 dark:border-gray-800"
          >            {aboutTitle && (
              <h2 id="about-heading" className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {aboutTitle}
              </h2>
            )}
            {aboutBody.split("\n").map((para, i) => (
              <p key={i} className="mt-3 max-w-3xl text-[15px] leading-8 text-gray-600 dark:text-gray-400">
                {para}
              </p>
            ))}
          </section>
        )}
      </main>

      <SiteFooter siteName={siteName} locale={locale} />
    </div>
  );
}
