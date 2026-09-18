"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Eye, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { getProjectSchema, slugify, THEMES, CARD_STYLES, IMAGE_ASPECTS, DESCRIPTION_LENGTHS, FEATURED_LAYOUTS, type ValidationMessages } from "@/lib/validation/project";
import { createProjectAction, updateProjectAction } from "@/features/projects/actions";
import { PublicProjectCard } from "@/components/projects/PublicProjectCard";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { Field, Input, Textarea, Select } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";
import type { ProjectFormState } from "@/types";

type SaveState = "saved" | "saving" | "unsaved" | "error";
type PreviewMode = "card" | "page" | "home";

const THEME_LABELS = ["themeDefault", "themeMinimal", "themeDark", "themeEditorial", "themeTech"] as const;
const CARD_LABELS = ["cardDefault", "cardMinimal", "cardBordered"] as const;
const LEN_LABELS = ["lenShort", "lenMedium", "lenFull"] as const;
const LAYOUT_LABELS = ["layoutStandard", "layoutWide"] as const;

export function ProjectEditor({
  initial,
  projectId,
  categories,
  isNew,
}: {
  initial: ProjectFormState;
  projectId?: string;
  categories: string[];
  isNew: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("editor");
  const tv = useTranslations("validation");
  const locale = useLocale();
  const [form, setForm] = useState<ProjectFormState>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>(isNew ? "unsaved" : "saved");
  const [message, setMessage] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("card");
  const [techInput, setTechInput] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dirtyRef = useRef(isNew);
  const initialJson = useMemo(() => JSON.stringify(initial), [initial]);

  const vMessages: ValidationMessages = useMemo(
    () => ({
      urlTooLong: tv("urlTooLong"),
      urlInvalid: tv("urlInvalid"),
      labelRequired: tv("labelRequired"),
      urlBad: tv("urlBad"),
      name: tv("name"),
      slugRequired: tv("slugRequired"),
      slugFormat: tv("slugFormat"),
      shortDesc: tv("shortDesc"),
      description: tv("description"),
      website: tv("website"),
      category: tv("category"),
      tech: tv("tech"),
      accent: tv("accent"),
    }),
    [tv],
  );

  const previewProject = useMemo(
    () => ({
      id: projectId ?? "preview",
      slug: form.slug || "preview-slug",
      name: form.name || t("untitled"),
      shortDescription: form.shortDescription || t("shortPreviewPh"),
      description: form.description || t("descPreviewPh"),
      imageUrl: form.imageUrl || null,
      websiteUrl: form.websiteUrl || "https://example.com",
      githubUrl: form.githubUrl || null,
      category: form.category || t("catFallback"),
      technologies: form.technologies,
      additionalLinks: form.additionalLinks,
      status: form.status,
      featured: form.featured,
      sortOrder: form.sortOrder,
      theme: form.theme,
      accentColor: form.accentColor,
      cardStyle: form.cardStyle,
      imageAspect: form.imageAspect,
      showTechnologies: form.showTechnologies,
      showCategory: form.showCategory,
      showGithub: form.showGithub,
      showWebsiteButton: form.showWebsiteButton,
      descriptionLength: form.descriptionLength,
      featuredLayout: form.featuredLayout,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    [form, projectId, t],
  );

  const set = useCallback(<K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaveState("unsaved");
    dirtyRef.current = true;
  }, []);

  // Unsaved-changes warning (real browser guard)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    dirtyRef.current = JSON.stringify({ ...form }) !== initialJson ? true : isNew ? true : saveState === "unsaved";
  }, [form, initialJson, isNew, saveState]);

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugTouched ? f.slug : slugify(name),
    }));
    setSaveState("unsaved");
    dirtyRef.current = true;
  }

  function addTech() {
    const tech = techInput.trim();
    if (!tech) return;
    if (form.technologies.includes(tech)) {
      setTechInput("");
      return;
    }
    if (form.technologies.length >= 20) return;
    set("technologies", [...form.technologies, tech]);
    setTechInput("");
  }

  function addLink() {
    if (!linkLabel.trim() || !linkUrl.trim()) return;
    try {
      new URL(linkUrl.trim());
    } catch {
      setErrors((e) => ({ ...e, additionalLinks: t("badLinkUrl") }));
      return;
    }
    set("additionalLinks", [...form.additionalLinks, { label: linkLabel.trim(), url: linkUrl.trim() }]);
    setLinkLabel("");
    setLinkUrl("");
    setErrors((e) => {
      const n = { ...e };
      delete n.additionalLinks;
      return n;
    });
  }

  async function handleFile(file: File) {
    setUploadError("");
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setUploadError(t("uploadTypeErr"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t("uploadSizeErr"));
      return;
    }
    // Instant local preview (real file, before upload finishes)
    const localUrl = URL.createObjectURL(file);
    const prev = form.imageUrl;
    setForm((f) => ({ ...f, imageUrl: localUrl }));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/upload?locale=${locale}`, { method: "POST", body: fd });
      let data: { url?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // Non-JSON error page (proxy / server crash) — fall through to status message
      }
      if (!res.ok || !data.url) {
        throw new Error(data.error ? `${data.error} (${res.status})` : `${t("uploadFail")} (${res.status})`);
      }
      URL.revokeObjectURL(localUrl);
      setForm((f) => ({ ...f, imageUrl: data.url as string }));
      setSaveState("unsaved");
      dirtyRef.current = true;
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setForm((f) => ({ ...f, imageUrl: prev }));
      setUploadError(err instanceof Error ? err.message : t("uploadFail"));
    } finally {
      setUploading(false);
    }
  }

  async function save(statusOverride?: "DRAFT" | "PUBLISHED"): Promise<boolean> {
    setMessage("");
    const payload = { ...form, status: statusOverride ?? form.status };
    const parsed = getProjectSchema(vMessages).safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setSaveState("error");
      setMessage(t("fixMsg"));
      return false;
    }
    setErrors({});
    setSaveState("saving");
    try {
      const res = isNew
        ? await createProjectAction(parsed.data, locale)
        : await updateProjectAction(projectId as string, parsed.data, locale);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setMessage(res.error);
        setSaveState("error");
        return false;
      }
      setSaveState("saved");
      dirtyRef.current = false;
      setMessage(statusOverride === "PUBLISHED" ? t("publishedMsg") : t("savedMsg"));
      if (isNew) {
        router.replace(`/addweb/${res.id}/edit`);
      } else {
        router.refresh();
      }
      return true;
    } catch {
      setMessage(t("saveFail"));
      setSaveState("error");
      return false;
    }
  }

  const saveLabel = saveState === "saving" ? t("saving") : saveState === "saved" ? t("saved") : saveState === "error" ? t("fixErrors") : t("unsaved");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => {
          if (dirtyRef.current && !window.confirm(t("leaveConfirm"))) return;
          router.push("/addweb/projects");
        }}>
          <ArrowRight className="h-4 w-4 ltr:-scale-x-100" aria-hidden /> {t("projects")}
        </Button>
        <h1 className="text-xl font-bold">{isNew ? t("addTitle") : t("editTitle")}</h1>
        <div className="ms-auto flex items-center gap-2 text-sm">
          <span role="status" className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            saveState === "saved" && "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
            saveState === "saving" && "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
            saveState === "unsaved" && "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
            saveState === "error" && "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
          )}>
            {saveState === "saving" && <Loader2 className="h-3 w-3 animate-spin" aria-hidden />}
            <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full",
              saveState === "saved" ? "bg-green-500" : saveState === "unsaved" ? "bg-amber-500" : saveState === "error" ? "bg-red-500" : "bg-gray-400")} />
            {saveLabel}
          </span>
        </div>
      </div>

      {message && (
        <p role={saveState === "error" ? "alert" : "status"} className={cn(
          "rounded-md border px-3 py-2 text-sm",
          saveState === "error" ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300" : "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
        )}>
          {message}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ---- Form ---- */}
        <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <section aria-labelledby="basic" className="space-y-4">
            <h2 id="basic" className="text-sm font-bold text-gray-500 dark:text-gray-400">{t("secBasic")}</h2>
            <Field label={t("name")} htmlFor="name" error={errors.name}>
              <Input id="name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder={t("namePh")} />
            </Field>
            <Field label={t("slug")} htmlFor="slug" hint={t("slugHint")} error={errors.slug}>
              <Input id="slug" dir="ltr" value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} placeholder="my-awesome-project" />
            </Field>
            <Field label={t("shortDesc")} htmlFor="short" error={errors.shortDescription}>
              <Textarea id="short" rows={2} maxLength={220} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder={t("shortPh")} />
            </Field>
            <Field label={t("fullDesc")} htmlFor="desc" error={errors.description}>
              <Textarea id="desc" rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={t("fullPh")} />
            </Field>
          </section>

          <section aria-labelledby="image" className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <h2 id="image" className="text-sm font-bold text-gray-500 dark:text-gray-400">{t("secImage")}</h2>
            {form.imageUrl ? (
              <div className="relative overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt={t("coverAlt")} className="aspect-video w-full object-cover" />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
                {t("noImage")}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              aria-label={t("uploadAria")}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                <ImagePlus className="h-4 w-4" aria-hidden /> {uploading ? t("uploading") : form.imageUrl ? t("replace") : t("upload")}
              </Button>
              {form.imageUrl && (
                <Button type="button" variant="ghost" size="sm" disabled={uploading} onClick={() => set("imageUrl", "")}>
                  <Trash2 className="h-4 w-4" aria-hidden /> {t("remove")}
                </Button>
              )}
            </div>
            {uploadError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>}
            {errors.imageUrl && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{errors.imageUrl}</p>}
          </section>

          <section aria-labelledby="links" className="space-y-4 border-t border-gray-100 pt-5 dark:border-gray-800">
            <h2 id="links" className="text-sm font-bold text-gray-500 dark:text-gray-400">{t("secLinks")}</h2>
            <Field label={t("website")} htmlFor="website" error={errors.websiteUrl}>
              <Input id="website" dir="ltr" inputMode="url" value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://example.com" />
            </Field>
            <Field label={t("github")} htmlFor="github" hint={t("githubHint")} error={errors.githubUrl}>
              <Input id="github" dir="ltr" inputMode="url" value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} placeholder="https://github.com/you/repo" />
            </Field>
            <div>
              <p className="text-sm font-medium">{t("addLinks")}</p>
              <ul className="mt-2 space-y-2">
                {form.additionalLinks.map((l, i) => (
                  <li key={`${l.url}-${i}`} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{l.label}</span>
                    <span className="truncate text-gray-500 dark:text-gray-400" dir="ltr">{l.url}</span>
                    <button
                      type="button"
                      aria-label={t("removeLink", { label: l.label })}
                      className="ms-auto rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => set("additionalLinks", form.additionalLinks.filter((_, j) => j !== i))}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder={t("linkLabelPh")} aria-label={t("linkLabelAria")} />
                <Input value={linkUrl} dir="ltr" onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" aria-label={t("linkUrlAria")} />
                <Button type="button" variant="secondary" size="sm" onClick={addLink} className="shrink-0">
                  <Plus className="h-4 w-4" aria-hidden /> {t("add")}
                </Button>
              </div>
              {errors.additionalLinks && <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.additionalLinks}</p>}
            </div>
          </section>

          <section aria-labelledby="tech" className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <h2 id="tech" className="text-sm font-bold text-gray-500 dark:text-gray-400">{t("secTech")}</h2>
            <div className="flex flex-wrap gap-1.5">
              {form.technologies.map((tech) => (
                <span key={tech} className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {tech}
                  <button type="button" aria-label={t("removeTech", { t: tech })} className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => set("technologies", form.technologies.filter((x) => x !== tech))}>
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                </span>
              ))}
              {form.technologies.length === 0 && <span className="text-sm text-gray-400 dark:text-gray-500">{t("techEmpty")}</span>}
            </div>
            <div className="flex gap-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
                placeholder={t("techPh")}
                aria-label={t("techAria")}
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTech} className="shrink-0">
                <Plus className="h-4 w-4" aria-hidden /> {t("add")}
              </Button>
            </div>
            {errors.technologies && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{errors.technologies}</p>}
          </section>

          <section aria-labelledby="meta" className="grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 dark:border-gray-800">
            <h2 id="meta" className="text-sm font-bold text-gray-500 sm:col-span-2 dark:text-gray-400">{t("secClass")}</h2>
            <Field label={t("category")} htmlFor="category" error={errors.category}>
              <Input id="category" list="categories" value={form.category} onChange={(e) => set("category", e.target.value)} />
              <datalist id="categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label={t("order")} htmlFor="order" hint={t("orderHint")}>
              <Input id="order" type="number" min={0} max={9999} value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value) || 0)} />
            </Field>
            <Field label={t("status")} htmlFor="status">
              <Select id="status" value={form.status} onChange={(e) => set("status", e.target.value as ProjectFormState["status"])}>
                <option value="DRAFT">{t("draftOpt")}</option>
                <option value="PUBLISHED">{t("pubOpt")}</option>
              </Select>
            </Field>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-gray-900" />
                {t("featured")}
              </label>
            </div>
          </section>

          <section aria-labelledby="appearance" className="grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 dark:border-gray-800">
            <h2 id="appearance" className="text-sm font-bold text-gray-500 sm:col-span-2 dark:text-gray-400">
              {t("secAppearance")}
            </h2>
            <Field label={t("theme")} htmlFor="theme">
              <Select id="theme" value={form.theme} onChange={(e) => set("theme", e.target.value as ProjectFormState["theme"])}>
                {THEMES.map((value, i) => (
                  <option key={value} value={value}>{t(THEME_LABELS[i])}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("accent")} htmlFor="accent">
              <div className="flex gap-2">
                <input id="accent" type="color" value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800" aria-label={t("pickAccent")} />
                <Input value={form.accentColor} dir="ltr" onChange={(e) => set("accentColor", e.target.value)} aria-label={t("hexAccent")} />
              </div>
            </Field>
            <Field label={t("cardStyle")} htmlFor="cardStyle">
              <Select id="cardStyle" value={form.cardStyle} onChange={(e) => set("cardStyle", e.target.value as ProjectFormState["cardStyle"])}>
                {CARD_STYLES.map((value, i) => (
                  <option key={value} value={value}>{t(CARD_LABELS[i])}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("imageAspect")} htmlFor="aspect">
              <Select id="aspect" value={form.imageAspect} onChange={(e) => set("imageAspect", e.target.value as ProjectFormState["imageAspect"])}>
                {IMAGE_ASPECTS.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("descLen")} htmlFor="desclen">
              <Select id="desclen" value={form.descriptionLength} onChange={(e) => set("descriptionLength", e.target.value as ProjectFormState["descriptionLength"])}>
                {DESCRIPTION_LENGTHS.map((value, i) => (
                  <option key={value} value={value}>{t(LEN_LABELS[i])}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("featLayout")} htmlFor="flayout">
              <Select id="flayout" value={form.featuredLayout} onChange={(e) => set("featuredLayout", e.target.value as ProjectFormState["featuredLayout"])}>
                {FEATURED_LAYOUTS.map((value, i) => (
                  <option key={value} value={value}>{t(LAYOUT_LABELS[i])}</option>
                ))}
              </Select>
            </Field>
            <div className="space-y-2 text-sm sm:col-span-2">
              {(
                [
                  ["showTechnologies", t("showTech")],
                  ["showCategory", t("showCat")],
                  ["showGithub", t("showGithub")],
                  ["showWebsiteButton", t("showWebsite")],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 font-medium">
                  <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="h-4 w-4 accent-gray-900" />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-5 dark:border-gray-800">
            <Button type="button" variant="secondary" onClick={() => void save("DRAFT")}>
              <Save className="h-4 w-4" aria-hidden /> {t("saveDraft")}
            </Button>
            {form.status === "PUBLISHED" ? (
              <Button type="button" variant="secondary" onClick={() => void save("DRAFT")}>
                {t("unpublish")}
              </Button>
            ) : (
              <Button type="button" onClick={() => void save("PUBLISHED")}>
                {t("publish")}
              </Button>
            )}
            {!isNew && form.status === "PUBLISHED" && previewProject.slug !== "preview-slug" && (
              <Link href={`/projects/${form.slug}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                <Eye className="h-4 w-4" aria-hidden /> {t("viewLive")}
              </Link>
            )}
          </div>
        </div>

        {/* ---- Live preview (same components as public site) ---- */}
        <div className="space-y-3 xl:sticky xl:top-6 xl:self-start">
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 text-sm dark:border-gray-800 dark:bg-gray-900" role="tablist" aria-label={t("tabsAria")}>
            {(
              [
                ["card", t("tabCard")],
                ["page", t("tabPage")],
                ["home", t("tabHome")],
              ] as Array<[PreviewMode, string]>
            ).map(([mode, label]) => (
              <button
                key={mode}
                role="tab"
                aria-selected={previewMode === mode}
                onClick={() => setPreviewMode(mode)}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 font-medium",
                  previewMode === mode ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("previewNote")}</p>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {previewMode === "card" && (
              <div className="max-w-sm p-4">
                <PublicProjectCard project={previewProject} />
              </div>
            )}
            {previewMode === "page" && (
              <div className="max-h-[720px] overflow-auto">
                <ProjectDetailView project={previewProject} />
              </div>
            )}
            {previewMode === "home" && (
              <div className="space-y-4 p-4">
                <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("homeEyebrow")}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("homeTitle")}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <PublicProjectCard project={previewProject} />
                  <div className="hidden rounded-lg border border-dashed border-gray-200 p-4 text-xs text-gray-400 sm:block dark:border-gray-700 dark:text-gray-500">
                    {t("homeNote")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
