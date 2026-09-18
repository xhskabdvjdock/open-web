import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProjectById, getSiteSetting } from "@/lib/projects";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import type { ProjectFormState } from "@/types";

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
  return locale === "en"
    ? ["Web App", "SaaS", "Tool", "Portfolio", "Dashboard", "E-commerce", "Other"]
    : ["تطبيق ويب", "منصة SaaS", "أداة", "معرض أعمال", "لوحة تحكم", "متجر إلكتروني", "أخرى"];
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const session = await getSession();
  if (!session) redirect("/addweb/login");
  const { id, locale } = await params;
  const [project, rawCats] = await Promise.all([getProjectById(id), getSiteSetting("categories", "[]")]);
  if (!project) notFound();

  const initial: ProjectFormState = {
    name: project.name,
    slug: project.slug,
    shortDescription: project.shortDescription,
    description: project.description,
    imageUrl: project.imageUrl ?? "",
    websiteUrl: project.websiteUrl,
    githubUrl: project.githubUrl ?? "",
    category: project.category,
    technologies: project.technologies,
    additionalLinks: project.additionalLinks,
    status: project.status,
    featured: project.featured,
    sortOrder: project.sortOrder,
    theme: project.theme,
    accentColor: project.accentColor,
    cardStyle: project.cardStyle,
    imageAspect: project.imageAspect,
    showTechnologies: project.showTechnologies,
    showCategory: project.showCategory,
    showGithub: project.showGithub,
    showWebsiteButton: project.showWebsiteButton,
    descriptionLength: project.descriptionLength,
    featuredLayout: project.featuredLayout,
  };

  return <ProjectEditor initial={initial} projectId={project.id} categories={parseCategories(rawCats, locale)} isNew={false} />;
}
