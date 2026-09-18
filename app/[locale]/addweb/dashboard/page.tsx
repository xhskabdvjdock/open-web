import { redirect } from "next/navigation";
import { Eye, FileText, Plus, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { getAllProjects, getDashboardStats } from "@/lib/projects";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await getSession();
  if (!session) redirect("/addweb/login");
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });

  const [stats, projects] = await Promise.all([getDashboardStats(), getAllProjects()]);
  const recent = projects.slice(0, 5);

  const cards = [
    { label: t("total"), value: stats.total, icon: FileText },
    { label: t("published"), value: stats.published, icon: Eye },
    { label: t("drafts"), value: stats.draft, icon: FileText },
    { label: t("featured"), value: stats.featured, icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("h1")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("sub")}</p>
        </div>
        <Link href="/addweb/new" className="inline-flex h-9 items-center gap-2 rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">
          <Plus className="h-4 w-4" aria-hidden /> {t("new")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Icon className="h-4 w-4" aria-hidden /> {c.label}
              </div>
              <p className="mt-1 text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100" role="status">
                {c.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{t("recent")}</h2>
          <Link href="/addweb/projects" className="text-sm font-medium text-gray-900 underline underline-offset-4 dark:text-gray-100">
            {t("manageAll")}
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("emptyTitle")}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("emptyHint")}</p>
            <Link href="/addweb/new" className="mt-4 inline-flex h-9 items-center rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">
              {t("add")}
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {p.status === "PUBLISHED" ? t("stPublished") : t("stDraft")} · {p.category} · {new Date(p.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <Link href={`/addweb/${p.id}/edit`} className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                  {t("edit")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
