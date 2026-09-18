"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  const locale = String(formData.get("locale") ?? "ar");
  const t = (locale === "en" ? enMessages : arMessages).auth;
  const prefix = locale === "en" ? "/en" : "";

  if (!email || !password) return { error: t.required };

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return { error: t.invalid };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: t.invalid };

  await createSession({ sub: user.id, email: user.email });

  const fallback = `${prefix}/addweb/dashboard`;
  const safeNext =
    next.startsWith("/addweb") || next.startsWith("/en/addweb")
      ? next
      : fallback;
  if (safeNext.includes("/addweb/login")) redirect(fallback);
  redirect(safeNext);
}

export async function logoutAction(locale: string): Promise<void> {
  await destroySession();
  redirect(locale === "en" ? "/en/addweb/login" : "/addweb/login");
}
