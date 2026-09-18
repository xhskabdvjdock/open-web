"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { changeEmailAction } from "@/features/projects/password-actions";
import { Field, Input } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const t = useTranslations("email");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setMessage("");
    setIsError(false);
    startTransition(async () => {
      const res = await changeEmailAction(password, email, locale);
      if (!res.ok) {
        setIsError(true);
        setMessage(res.error ?? t("failed"));
        return;
      }
      setEmail("");
      setPassword("");
      setMessage(t("changed"));
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">{t("title")}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t("current")}: <span className="font-medium text-gray-900 dark:text-gray-100" dir="ltr">{currentEmail}</span>
      </p>
      <Field label={t("new")} htmlFor="new-email">
        <Input
          id="new-email"
          type="email"
          autoComplete="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
        />
      </Field>
      <Field label={t("confirm")} htmlFor="email-confirm-pass">
        <Input
          id="email-confirm-pass"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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
      <Button onClick={save} disabled={pending || !email.includes("@") || !password}>
        {pending ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
