import { prisma } from "@/lib/db";
import type { AdditionalLink, Project } from "@/types";

type DbProject = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  websiteUrl: string;
  githubUrl: string | null;
  category: string;
  technologies: string;
  additionalLinks: string;
  status: string;
  featured: boolean;
  sortOrder: number;
  theme: string;
  accentColor: string;
  cardStyle: string;
  imageAspect: string;
  showTechnologies: boolean;
  showCategory: boolean;
  showGithub: boolean;
  showWebsiteButton: boolean;
  descriptionLength: string;
  featuredLayout: string;
  createdAt: Date;
  updatedAt: Date;
};

function parseStringArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function parseLinks(raw: string): AdditionalLink[] {
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v.filter(
      (x): x is AdditionalLink =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as AdditionalLink).label === "string" &&
        typeof (x as AdditionalLink).url === "string",
    );
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProject(row: any): Project {
  const r = row as DbProject;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    shortDescription: r.shortDescription,
    description: r.description,
    imageUrl: r.imageUrl,
    websiteUrl: r.websiteUrl,
    githubUrl: r.githubUrl,
    category: r.category,
    technologies: parseStringArray(r.technologies ?? "[]"),
    additionalLinks: parseLinks(r.additionalLinks ?? "[]"),
    status: r.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    featured: Boolean(r.featured),
    sortOrder: r.sortOrder,
    theme: (r.theme as Project["theme"]) ?? "default",
    accentColor: r.accentColor ?? "#2563eb",
    cardStyle: (r.cardStyle as Project["cardStyle"]) ?? "default",
    imageAspect: (r.imageAspect as Project["imageAspect"]) ?? "16/9",
    showTechnologies: r.showTechnologies ?? true,
    showCategory: r.showCategory ?? true,
    showGithub: r.showGithub ?? true,
    showWebsiteButton: r.showWebsiteButton ?? true,
    descriptionLength: (r.descriptionLength as Project["descriptionLength"]) ?? "short",
    featuredLayout: (r.featuredLayout as Project["featuredLayout"]) ?? "standard",
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  };
}

export async function getPublishedProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapProject);
}

export async function getAllProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const row = await prisma.project.findUnique({ where: { slug } });
  return row ? mapProject(row) : null;
}

export async function getPublishedProjectBySlug(slug: string): Promise<Project | null> {
  const row = await prisma.project.findUnique({ where: { slug } });
  if (!row || row.status !== "PUBLISHED") return null;
  return mapProject(row);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const row = await prisma.project.findUnique({ where: { id } });
  return row ? mapProject(row) : null;
}

export async function getDashboardStats() {
  const [total, published, draft, featured] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "PUBLISHED" } }),
    prisma.project.count({ where: { status: "DRAFT" } }),
    prisma.project.count({ where: { status: "PUBLISHED", featured: true } }),
  ]);
  return { total, published, draft, featured };
}

export async function getAvailableCategories(): Promise<string[]> {
  const rows = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category).filter(Boolean);
}

export async function getAvailableTechnologies(): Promise<string[]> {
  const rows = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    select: { technologies: true },
  });
  const set = new Set<string>();
  for (const r of rows) {
    for (const t of parseStringArray(r.technologies)) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export async function getSiteSetting(key: string, fallback = ""): Promise<string> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function getSiteSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string> = {};
  for (const k of keys) map[k] = "";
  for (const r of rows) map[r.key] = r.value;
  return map;
}
