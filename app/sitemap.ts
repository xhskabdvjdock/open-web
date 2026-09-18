import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  let projects: Awaited<ReturnType<typeof getPublishedProjects>> = [];
  try {
    projects = await getPublishedProjects();
  } catch {
    projects = [];
  }
  // NOTE: /addweb is intentionally excluded — it is a hidden admin area.
  const paths = ["", "/projects", ...projects.map((p) => `/projects/${p.slug}`)];
  const lastModified = new Date();
  return [
    ...paths.map((p) => ({ url: `${base}${p || "/"}`, lastModified })),
    ...paths.map((p) => ({ url: `${base}/en${p}`, lastModified })),
  ];
}
