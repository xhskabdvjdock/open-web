"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { getProjectSchema } from "@/lib/validation/project";
import { deleteImageByUrl } from "@/lib/storage";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";

function vMsgs(locale: string) {
  return (locale === "en" ? enMessages : arMessages).validation;
}

function toDb(input: ReturnType<ReturnType<typeof getProjectSchema>["parse"]>) {
  return {
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription,
    description: input.description,
    imageUrl: input.imageUrl || null,
    websiteUrl: input.websiteUrl,
    githubUrl: input.githubUrl || null,
    category: input.category,
    technologies: JSON.stringify(input.technologies),
    additionalLinks: JSON.stringify(input.additionalLinks ?? []),
    status: input.status,
    featured: input.featured,
    sortOrder: input.sortOrder,
    theme: input.theme,
    accentColor: input.accentColor,
    cardStyle: input.cardStyle,
    imageAspect: input.imageAspect,
    showTechnologies: input.showTechnologies,
    showCategory: input.showCategory,
    showGithub: input.showGithub,
    showWebsiteButton: input.showWebsiteButton,
    descriptionLength: input.descriptionLength,
    featuredLayout: input.featuredLayout,
  };
}

export type ActionResult = { ok: true; id: string; slug: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseInput(raw: any, locale: string) {
  const v = vMsgs(locale);
  const parsed = getProjectSchema(v).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: { ok: false as const, error: v.fixFields, fieldErrors } };
  }
  return { data: parsed.data };
}

export async function createProjectAction(raw: unknown, locale: string): Promise<ActionResult> {
  await requireSession();
  const v = vMsgs(locale);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = parseInput(raw as any, locale);
  if (error) return error;
  if (!data) return { ok: false, error: v.invalidData };

  const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
  if (existing) return { ok: false, error: v.existsError, fieldErrors: { slug: v.slugInUse } };

  const created = await prisma.project.create({ data: toDb(data) });
  revalidatePath("/");
  revalidatePath("/projects");
  return { ok: true, id: created.id, slug: created.slug };
}

export async function updateProjectAction(id: string, raw: unknown, locale: string): Promise<ActionResult> {
  await requireSession();
  const v = vMsgs(locale);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = parseInput(raw as any, locale);
  if (error) return error;
  if (!data) return { ok: false, error: v.invalidData };

  const current = await prisma.project.findUnique({ where: { id } });
  if (!current) return { ok: false, error: v.notFound };

  const slugOwner = await prisma.project.findUnique({ where: { slug: data.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return { ok: false, error: v.existsError, fieldErrors: { slug: v.slugInUse } };
  }

  const oldImage = current.imageUrl;
  const newImage = data.imageUrl || null;
  const updated = await prisma.project.update({ where: { id }, data: toDb(data) });

  if (oldImage && oldImage !== newImage) {
    await deleteImageByUrl(oldImage);
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${updated.slug}`);
  return { ok: true, id: updated.id, slug: updated.slug };
}

export async function deleteProjectAction(id: string, locale: string): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  const v = vMsgs(locale);
  const current = await prisma.project.findUnique({ where: { id } });
  if (!current) return { ok: false, error: v.notFound };
  await prisma.project.delete({ where: { id } });
  await deleteImageByUrl(current.imageUrl);
  revalidatePath("/");
  revalidatePath("/projects");
  return { ok: true };
}

export async function setProjectStatusAction(id: string, status: "DRAFT" | "PUBLISHED") {
  await requireSession();
  await prisma.project.update({ where: { id }, data: { status } });
  revalidatePath("/");
  revalidatePath("/projects");
  return { ok: true as const };
}

export async function reorderProjectsAction(items: Array<{ id: string; sortOrder: number }>) {
  await requireSession();
  await prisma.$transaction(
    items.map((it) => prisma.project.update({ where: { id: it.id }, data: { sortOrder: it.sortOrder } })),
  );
  revalidatePath("/");
  revalidatePath("/projects");
  return { ok: true as const };
}

export async function updateSiteSettingsAction(settings: Record<string, string>) {
  await requireSession();
  const allowed = ["siteName", "siteTagline", "aboutTitle", "aboutBody", "categories"];
  for (const [key, value] of Object.entries(settings)) {
    if (!allowed.includes(key)) continue;
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: String(value ?? "") },
      create: { key, value: String(value ?? "") },
    });
  }
  revalidatePath("/");
  return { ok: true as const };
}
