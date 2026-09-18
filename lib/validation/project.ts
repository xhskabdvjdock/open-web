import { z } from "zod";

export const DEFAULT_CATEGORIES = [
  "تطبيق ويب",
  "منصة SaaS",
  "أداة",
  "معرض أعمال",
  "لوحة تحكم",
  "متجر إلكتروني",
  "أخرى",
] as const;

export const THEMES = ["default", "minimal", "dark", "editorial", "tech"] as const;
export const CARD_STYLES = ["default", "minimal", "bordered"] as const;
export const IMAGE_ASPECTS = ["16/9", "4/3", "1/1"] as const;
export const DESCRIPTION_LENGTHS = ["short", "medium", "full"] as const;
export const FEATURED_LAYOUTS = ["standard", "wide"] as const;
export const STATUSES = ["DRAFT", "PUBLISHED"] as const;

export type ValidationMessages = {
  urlTooLong: string;
  urlInvalid: string;
  labelRequired: string;
  urlBad: string;
  name: string;
  slugRequired: string;
  slugFormat: string;
  shortDesc: string;
  description: string;
  website: string;
  category: string;
  tech: string;
  accent: string;
};

export function getProjectSchema(m: ValidationMessages) {
  const urlField = z
    .string()
    .trim()
    .max(2048, m.urlTooLong)
    .refine((v) => v === "" || /^https?:\/\/.+\..+/.test(v), {
      message: m.urlInvalid,
    });

  const additionalLinkSchema = z.object({
    label: z.string().trim().min(1, m.labelRequired).max(60),
    url: z.string().trim().url(m.urlBad).max(2048),
  });

  return z.object({
    name: z.string().trim().min(2, m.name).max(80),
    slug: z
      .string()
      .trim()
      .min(2, m.slugRequired)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, m.slugFormat),
    shortDescription: z.string().trim().min(10, m.shortDesc).max(220),
    description: z.string().trim().min(20, m.description).max(8000),
    imageUrl: z.string().trim().max(2048).optional().or(z.literal("")),
    websiteUrl: z.string().trim().url(m.website).max(2048),
    githubUrl: urlField.optional().or(z.literal("")),
    category: z.string().trim().min(1, m.category).max(40),
    technologies: z.array(z.string().trim().min(1).max(30)).min(1, m.tech).max(20),
    additionalLinks: z.array(additionalLinkSchema).max(10).default([]),
    status: z.enum(STATUSES).default("DRAFT"),
    featured: z.boolean().default(false),
    sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
    theme: z.enum(THEMES).default("default"),
    accentColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, m.accent),
    cardStyle: z.enum(CARD_STYLES).default("default"),
    imageAspect: z.enum(IMAGE_ASPECTS).default("16/9"),
    showTechnologies: z.boolean().default(true),
    showCategory: z.boolean().default(true),
    showGithub: z.boolean().default(true),
    showWebsiteButton: z.boolean().default(true),
    descriptionLength: z.enum(DESCRIPTION_LENGTHS).default("short"),
    featuredLayout: z.enum(FEATURED_LAYOUTS).default("standard"),
  });
}

export type ProjectInput = z.infer<ReturnType<typeof getProjectSchema>>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
