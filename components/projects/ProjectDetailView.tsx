"use client";

import Image from "next/image";
import { ArrowUpRight, CodeXml } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

export function ProjectDetailView({ project }: { project: Project }) {
  const t = useTranslations("detail");
  const locale = useLocale();
  const showGithub = project.showGithub && !!project.githubUrl;
  const isDark = project.theme === "dark";
  const isEditorial = project.theme === "editorial";

  return (
    <div className={cn(isDark ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100")}>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {project.showCategory && (
            <span className={cn("inline-flex items-center gap-1.5 font-medium", isDark ? "text-gray-300" : "text-gray-600 dark:text-gray-400")}>
              <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: project.accentColor }} />
              {project.category}
            </span>
          )}
          {project.featured && (
            <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: project.accentColor }}>
              {t("featured")}
            </span>
          )}
          <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500 dark:text-gray-400")}>
            {t("updated", { date: new Date(project.updatedAt).toLocaleDateString(locale) })}
          </span>
        </div>

        <h1 className={cn("mt-3", isEditorial ? "font-serif text-4xl" : "text-3xl font-bold")}>
          {project.name}
        </h1>
        <p className={cn("mt-2 text-lg", isDark ? "text-gray-300" : "text-gray-600 dark:text-gray-400")}>{project.shortDescription}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          {project.showWebsiteButton && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium text-white"
              style={{ backgroundColor: project.accentColor }}
            >
              {t("visit")} <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          )}
          {showGithub && (
            <a
              href={project.githubUrl as string}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium",
                isDark ? "border-gray-700 text-gray-100 hover:bg-gray-800" : "border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800",
              )}
            >
              <CodeXml className="h-4 w-4" aria-hidden /> GitHub
            </a>
          )}
        </div>

        {project.imageUrl && (
          <div
            className={cn(
              "relative mt-8 overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-800",
              project.imageAspect === "1/1" ? "aspect-square" : project.imageAspect === "4/3" ? "aspect-[4/3]" : "aspect-video",
              isDark ? "border-gray-800" : "border-gray-200 dark:border-gray-800",
            )}
          >
            <Image src={project.imageUrl} alt={t("screenshot", { name: project.name })} fill className="object-cover" sizes="100vw" priority={false} />
          </div>
        )}

        {project.showTechnologies && project.technologies.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">{t("tech")}</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li
                  key={tech}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-sm",
                    isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900",
                    project.theme === "tech" && "font-mono uppercase",
                  )}
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">{t("about")}</h2>
          <div className={cn("mt-2 space-y-4 text-[15px] leading-8", isDark ? "text-gray-200" : "text-gray-700 dark:text-gray-300")}>
            {project.description.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {project.additionalLinks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">{t("links")}</h2>
            <ul className="mt-2 space-y-2">
              {project.additionalLinks.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
                    style={{ color: project.accentColor }}
                  >
                    {l.label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
