"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

function aspectClass(aspect: Project["imageAspect"]): string {
  if (aspect === "4/3") return "aspect-[4/3]";
  if (aspect === "1/1") return "aspect-square";
  return "aspect-video";
}

function themeCardClass(theme: Project["theme"]): string {
  switch (theme) {
    case "dark":
      return "bg-gray-900 text-gray-100 border-gray-800";
    case "minimal":
      return "bg-white border-transparent dark:bg-transparent dark:border-transparent";
    case "editorial":
      return "bg-[#faf9f7] border-gray-200 dark:bg-gray-900 dark:border-gray-800";
    case "tech":
      return "bg-white border-gray-200 font-mono dark:bg-gray-900 dark:border-gray-800";
    default:
      return "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800";
  }
}

function cardStyleClass(style: Project["cardStyle"], theme: Project["theme"]): string {
  if (theme === "minimal") return "border-0 shadow-none p-0";
  if (style === "minimal") return "border-0 shadow-none";
  if (style === "bordered") return "border-2";
  return "border shadow-[0_1px_2px_rgba(0,0,0,0.05)]";
}

export function PublicProjectCard({ project }: { project: Project }) {
  const t = useTranslations("card");
  const showGithub = project.showGithub && !!project.githubUrl;
  const descClass =
    project.descriptionLength === "full"
      ? ""
      : project.descriptionLength === "medium"
        ? "clamp-3"
        : "clamp-2";

  const isDark = project.theme === "dark";
  const isEditorial = project.theme === "editorial";

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg",
        themeCardClass(project.theme),
        cardStyleClass(project.cardStyle, project.theme),
        project.featuredLayout === "wide" && "md:col-span-2 md:flex-row",
      )}
      style={project.theme === "editorial" ? { borderInlineStart: `3px solid ${project.accentColor}` } : undefined}
    >
      <Link
        href={`/projects/${project.slug}`}
        className={cn("relative block w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800", aspectClass(project.imageAspect), project.featuredLayout === "wide" && "md:w-1/2")}
        aria-label={t("open", { name: project.name })}
        tabIndex={-1}
      >
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={t("screenshot", { name: project.name })}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">{t("noImage")}</div>
        )}
      </Link>

      <div className={cn("flex flex-1 flex-col gap-2 p-5", project.theme === "minimal" && "px-0")}>
        <div className="flex items-center gap-2">
          {project.showCategory && (
            <span
              className={cn("inline-flex items-center gap-1.5 text-xs font-medium", isDark ? "text-gray-300" : "text-gray-600 dark:text-gray-400")}
            >
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: project.accentColor }}
              />
              {project.category}
            </span>
          )}
          {project.featured && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: project.accentColor }}
            >
              {t("featured")}
            </span>
          )}
        </div>

        <h3
          className={cn(
            "text-lg leading-snug",
            isDark ? "text-white" : "text-gray-900 dark:text-gray-100",
            isEditorial ? "font-serif text-xl" : "font-bold",
          )}
        >
          <Link href={`/projects/${project.slug}`} className="hover:underline underline-offset-4">
            {project.name}
          </Link>
        </h3>

        <p className={cn("text-sm leading-relaxed", isDark ? "text-gray-300" : "text-gray-600 dark:text-gray-400", descClass)}>
          {project.descriptionLength === "full" ? project.description || project.shortDescription : project.shortDescription}
        </p>

        {project.showTechnologies && project.technologies.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1.5" aria-label={t("techAria")}>
            {project.technologies.slice(0, 6).map((tech) => (
              <li
                key={tech}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs",
                  isDark ? "border-gray-700 bg-gray-800 text-gray-200" : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  project.theme === "tech" && "font-mono uppercase tracking-wide",
                )}
              >
                {tech}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center gap-3 pt-3">
          {project.showWebsiteButton && (
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline underline-offset-4"
              style={{ color: isDark ? "#fff" : project.accentColor }}
            >
              {t("view")} <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
          {showGithub && (
            <a
              href={project.githubUrl as string}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("text-sm underline-offset-4 hover:underline", isDark ? "text-gray-300" : "text-gray-600 dark:text-gray-400")}
              onClick={(e) => e.stopPropagation()}
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
