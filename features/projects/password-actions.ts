"use server";

import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, requireSession } from "@/lib/auth/session";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
  locale: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  const t = (locale === "en" ? enMessages : arMessages).pass;
  if (!currentPassword || !newPassword) return { ok: false, error: t.bothRequired };
  if (newPassword.length < 8) return { ok: false, error: t.minLength };

  const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!user) return { ok: false, error: t.noAccount };

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) return { ok: false, error: t.currentWrong };

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  return { ok: true };
}

export async function changeEmailAction(
  currentPassword: string,
  newEmail: string,
  locale: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  const t = (locale === "en" ? enMessages : arMessages).email;
  const clean = newEmail.trim().toLowerCase();
  if (!currentPassword || !clean) return { ok: false, error: t.bothRequired };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) || clean.length > 254) {
    return { ok: false, error: t.invalid };
  }
  if (clean === session.email) return { ok: false, error: t.same };

  const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!user) return { ok: false, error: t.noAccount };

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) return { ok: false, error: t.currentWrong };

  const taken = await prisma.adminUser.findUnique({ where: { email: clean } });
  if (taken && taken.id !== user.id) return { ok: false, error: t.taken };

  await prisma.adminUser.update({ where: { id: user.id }, data: { email: clean } });
  // Refresh the session cookie so the UI shows the new email immediately.
  await createSession({ sub: user.id, email: clean });
  return { ok: true };
}
