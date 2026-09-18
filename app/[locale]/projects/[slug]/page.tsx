import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { localizedPath } from "@/i18n/routing";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { PublicProjectCard } from "@/components/projects/PublicProjectCard";
import { getPublishedProjects, getPublishedProjectBySlug, getSiteSettings } from "@/lib/projects";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "projectPage" });
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return { title: t("notFoundMeta") };
  return {
    title: project.name,
    description: project.shortDescription,
    openGraph: {
      title: project.name,
      description: project.shortDescription,
      type: "website",
      images: project.imageUrl ? [{ url: project.imageUrl }] : undefined,
    },
    twitter: {
      card: project.imageUrl ? "summary_large_image" : "summary",
      title: project.name,
      description: project.shortDescription,
      images: project.imageUrl ? [project.imageUrl] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "projectPage" });
  const [project, settings, all] = await Promise.all([
    getPublishedProjectBySlug(slug),
    getSiteSettings(["siteName", "siteTagline"]),
    getPublishedProjects(),
  ]);
  if (!project) notFound();

  const isEn = locale === "en";
  const related = all.filter((p) => p.id !== project.id && p.category === project.category).slice(0, 3);

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader
        siteName={settings.siteName || (isEn ? "Projects" : "أعمالي")}
        siteTagline={settings.siteTagline || (isEn ? "Selected work." : "مجموعة مختارة من أعمالي.")}
        locale={locale}
      />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
          <Link href={localizedPath("/", locale)} className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            <ArrowRight className="h-4 w-4 ltr:-scale-x-100" aria-hidden /> {t("back")}
          </Link>
        </div>
        <ProjectDetailView project={project} />
        {related.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6" aria-label={t("related", { category: project.category })}>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">{t("related", { category: project.category })}</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PublicProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter siteName={settings.siteName || (isEn ? "Projects" : "أعمالي")} locale={locale} />
    </div>
  );
}
