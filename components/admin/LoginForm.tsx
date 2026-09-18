"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogIn } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { loginAction, type LoginState } from "@/features/projects/auth-actions";
import { Input, Field } from "@/components/ui/fields";

function Submit() {
  const { pending } = useFormStatus();
  const t = useTranslations("login");
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-gray-900 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
    >
      <LogIn className="h-4 w-4" aria-hidden />
      {pending ? t("pending") : t("submit")}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});
  const t = useTranslations("login");
  const locale = useLocale();
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="locale" value={locale} />
      <Field label={t("email")} htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="admin@example.com" dir="ltr" />
      </Field>
      <Field label={t("password")} htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      <Submit />
    </form>
  );
}
