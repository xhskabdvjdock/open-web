import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { getAllProjects } from "@/lib/projects";
import { ProjectsTable } from "@/components/admin/ProjectsTable";

export default async function AdminProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await getSession();
  if (!session) redirect("/addweb/login");
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminProjects" });
  const projects = await getAllProjects();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("h1")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("sub", { count: projects.length })}</p>
        </div>
        <Link href="/addweb/new" className="inline-flex h-9 items-center gap-2 rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">
          <Plus className="h-4 w-4" aria-hidden /> {t("new")}
        </Link>
      </div>
      <ProjectsTable initial={projects} />
    </div>
  );
}
