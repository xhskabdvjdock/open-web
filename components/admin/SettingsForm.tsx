"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { updateSiteSettingsAction } from "@/features/projects/actions";
import { Field, Input, Textarea } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const isEn = locale === "en";
  const [form, setForm] = useState({
    siteName: initial.siteName || (isEn ? "Projects" : "أعمالي"),
    siteTagline: initial.siteTagline || "",
    aboutTitle: initial.aboutTitle || (isEn ? "About" : "نبذة"),
    aboutBody: initial.aboutBody || "",
    categories: (() => {
      try {
        const v = JSON.parse(initial.categories || "[]");
        return Array.isArray(v) ? (v as string[]).join(isEn ? ", " : "، ") : "";
      } catch {
        return "";
      }
    })(),
  });
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    setMessage("");
    const categories = form.categories
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
    startTransition(async () => {
      try {
        await updateSiteSettingsAction({
          siteName: form.siteName.trim() || (isEn ? "Projects" : "أعمالي"),
          siteTagline: form.siteTagline.trim(),
          aboutTitle: form.aboutTitle.trim() || (isEn ? "About" : "نبذة"),
          aboutBody: form.aboutBody,
          categories: JSON.stringify(categories.length > 0 ? categories : [t("otherFallback")]),
        });
        setMessage(t("saved"));
      } catch {
        setMessage(t("failed"));
      }
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <Field label={t("siteName")} htmlFor="siteName">
        <Input id="siteName" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
      </Field>
      <Field label={t("tagline")} htmlFor="tagline">
        <Input id="tagline" value={form.siteTagline} onChange={(e) => setForm({ ...form, siteTagline: e.target.value })} />
      </Field>
      <Field label={t("aboutTitle")} htmlFor="aboutTitle">
        <Input id="aboutTitle" value={form.aboutTitle} onChange={(e) => setForm({ ...form, aboutTitle: e.target.value })} />
      </Field>
      <Field label={t("aboutBody")} htmlFor="aboutBody">
        <Textarea id="aboutBody" rows={5} value={form.aboutBody} onChange={(e) => setForm({ ...form, aboutBody: e.target.value })} />
      </Field>
      <Field label={t("categories")} htmlFor="cats" hint={t("categoriesHint")}>
        <Input id="cats" value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} />
      </Field>
      {message && (
        <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          {message}
        </p>
      )}
      <Button onClick={save} disabled={pending}>
        {pending ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
