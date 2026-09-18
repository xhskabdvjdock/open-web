"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { PublicProjectCard } from "@/components/projects/PublicProjectCard";
import { Input, Select } from "@/components/ui/fields";
import type { Project } from "@/types";

export function ProjectGrid({
  projects,
  categories,
  technologies,
}: {
  projects: Project[];
  categories: string[];
  technologies: string[];
}) {
  const t = useTranslations("grid");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tech, setTech] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (tech !== "all" && !p.technologies.includes(tech)) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.shortDescription} ${p.description} ${p.technologies.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [projects, query, category, tech]);

  const showFilters = projects.length > 0;
  const isEmpty = projects.length === 0;

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPh")}
              aria-label={t("searchAria")}
              className="ps-9"
            />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label={t("filterCat")} className="sm:w-48">
            <option value="all">{t("allCats")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={tech} onChange={(e) => setTech(e.target.value)} aria-label={t("filterTech")} className="sm:w-48">
            <option value="all">{t("allTech")}</option>
            {technologies.map((techName) => (
              <option key={techName} value={techName}>
                {techName}
              </option>
            ))}
          </Select>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{isEmpty ? t("emptyTitle") : t("noMatchTitle")}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{isEmpty ? t("emptyHint") : t("noMatchHint")}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400" role="status">
            {t("showing", { shown: filtered.length, total: projects.length })}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PublicProjectCard key={p.id} project={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
