import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSiteSetting } from "@/lib/projects";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { emptyProjectForm } from "@/types";

const FALLBACKS = {
  ar: ["تطبيق ويب", "منصة SaaS", "أداة", "معرض أعمال", "لوحة تحكم", "متجر إلكتروني", "أخرى"],
  en: ["Web App", "SaaS", "Tool", "Portfolio", "Dashboard", "E-commerce", "Other"],
} as const;

function parseCategories(raw: string, locale: string): string[] {
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) {
      const list = v.filter((x): x is string => typeof x === "string");
      if (list.length > 0) return list;
    }
  } catch {
    // ignore
  }
  return [...(locale === "en" ? FALLBACKS.en : FALLBACKS.ar)];
}

export default async function NewProjectPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await getSession();
  if (!session) redirect("/addweb/login");
  const { locale } = await params;
  const fallback = locale === "en" ? FALLBACKS.en : FALLBACKS.ar;
  const raw = await getSiteSetting("categories", JSON.stringify(fallback));

  return <ProjectEditor initial={{ ...emptyProjectForm }} categories={parseCategories(raw, locale)} isNew projectId={undefined} />;
}
