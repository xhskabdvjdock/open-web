"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Eye, Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/types";
import { deleteProjectAction, reorderProjectsAction, setProjectStatusAction } from "@/features/projects/actions";

export function ProjectsTable({ initial }: { initial: Project[] }) {
  const t = useTranslations("table");
  const locale = useLocale();
  const [projects, setProjects] = useState<Project[]>(initial);
  const [pending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  function move(id: string, dir: -1 | 1) {
    const idx = projects.findIndex((p) => p.id === id);
    const next = [...projects];
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= next.length) return;
    const [item] = next.splice(idx, 1);
    next.splice(j, 0, item);
    const withOrder = next.map((p, i) => ({ ...p, sortOrder: i }));
    setProjects(withOrder);
    setError("");
    startTransition(async () => {
      try {
        await reorderProjectsAction(withOrder.map((p) => ({ id: p.id, sortOrder: p.sortOrder })));
      } catch {
        setError(t("errOrder"));
      }
    });
  }

  function toggleStatus(p: Project) {
    setError("");
    startTransition(async () => {
      try {
        await setProjectStatusAction(p.id, p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED");
        setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: x.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" } : x)));
      } catch {
        setError(t("errStatus"));
      }
    });
  }

  function remove(id: string) {
    setError("");
    startTransition(async () => {
      const res = await deleteProjectAction(id, locale);
      if (!res.ok) {
        setError(res.error ?? t("errDelete"));
        return;
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setConfirmId(null);
    });
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("emptyTitle")}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("emptyHint")}</p>
        <Link href="/addweb/new" className="mt-4 inline-flex h-9 items-center rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">
          {t("add")}
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {error && (
        <p role="alert" className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-start text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">{t("thProject")}</th>
              <th className="px-4 py-3 font-medium">{t("thStatus")}</th>
              <th className="px-4 py-3 font-medium">{t("thCategory")}</th>
              <th className="px-4 py-3 font-medium">{t("thCreated")}</th>
              <th className="px-4 py-3 font-medium">{t("thOrder")}</th>
              <th className="px-4 py-3 text-end font-medium">{t("thActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {projects.map((p, i) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt="" width={64} height={40} className="h-10 w-16 rounded border border-gray-200 object-cover dark:border-gray-700" />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded border border-dashed border-gray-300 text-[11px] text-gray-400 dark:border-gray-700 dark:text-gray-500">
                        {t("noImg")}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400" dir="ltr">/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStatus(p)}
                    disabled={pending}
                    title={p.status === "PUBLISHED" ? t("toUnpublish") : t("toPublish")}
                    className={
                      p.status === "PUBLISHED"
                        ? "rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 hover:bg-green-200 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
                        : "rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }
                  >
                    {p.status === "PUBLISHED" ? t("published") : t("draft")}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.category}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString(locale)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => move(p.id, -1)}
                      disabled={i === 0 || pending}
                      aria-label={t("moveUp", { name: p.name })}
                      className="rounded border border-gray-200 p-1 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      onClick={() => move(p.id, 1)}
                      disabled={i === projects.length - 1 || pending}
                      aria-label={t("moveDown", { name: p.name })}
                      className="rounded border border-gray-200 p-1 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <span className="ms-1 text-xs tabular-nums text-gray-400 dark:text-gray-500">{p.sortOrder}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/addweb/${p.id}/edit`}
                      aria-label={t("edit", { name: p.name })}
                      className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </Link>
                    {p.status === "PUBLISHED" ? (
                      <Link
                        href={`/projects/${p.slug}`}
                        target="_blank"
                        aria-label={t("preview", { name: p.name })}
                        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                      >
                        <Eye className="h-4 w-4" aria-hidden />
                      </Link>
                    ) : (
                      <Link
                        href={`/addweb/${p.id}/edit?preview=1`}
                        aria-label={t("previewDraft", { name: p.name })}
                        title={t("previewDraftTitle")}
                        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                      >
                        <Eye className="h-4 w-4" aria-hidden />
                      </Link>
                    )}
                    <button
                      onClick={() => setConfirmId(p.id)}
                      aria-label={t("del", { name: p.name })}
                      className="rounded-md p-2 text-gray-600 hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmId && (
        <div role="dialog" aria-modal="true" aria-label={t("confirmAria")} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg dark:bg-gray-900 dark:border dark:border-gray-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{t("confirmTitle")}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {projects.find((p) => p.id === confirmId)?.imageUrl ? t("confirmBodyWithImage") : t("confirmBody")}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setConfirmId(null)} className="h-9 rounded-md border border-gray-300 px-3 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                {t("cancel")}
              </button>
              <button
                onClick={() => confirmId && remove(confirmId)}
                disabled={pending}
                className="h-9 rounded-md bg-red-600 px-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-400"
              >
                {pending ? t("deleting") : t("delBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
