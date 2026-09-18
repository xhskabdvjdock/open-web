"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { changePasswordAction } from "@/features/projects/password-actions";
import { Field, Input } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";

export function PasswordForm() {
  const t = useTranslations("password");
  const locale = useLocale();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setMessage("");
    setIsError(false);
    startTransition(async () => {
      const res = await changePasswordAction(current, next, locale);
      if (!res.ok) {
        setIsError(true);
        setMessage(res.error ?? t("failed"));
        return;
      }
      setCurrent("");
      setNext("");
      setMessage(t("changed"));
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">{t("title")}</h2>
      <Field label={t("current")} htmlFor="cur">
        <Input id="cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </Field>
      <Field label={t("new")} htmlFor="nxt">
        <Input id="nxt" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      {message && (
        <p
          role={isError ? "alert" : "status"}
          className={
            isError
              ? "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              : "rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
          }
        >
          {message}
        </p>
      )}
      <Button onClick={save} disabled={pending || !current || next.length < 8}>
        {pending ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
