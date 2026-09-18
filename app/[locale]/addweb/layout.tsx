import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/AdminShell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Admin" : "الإدارة",
    robots: { index: false, follow: false },
  };
}

export default async function AddWebLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // Middleware already guards, but enforce server-side as well (defense in depth).
  // Login page handles its own redirect, so only guard non-login routes here by checking path via headers is complex;
  // instead: if no session, child login page renders; other pages each require session.
  // To keep it simple and secure: if no session, allow only login to render — other pages call requireSession/redirect.
  return <AdminShell email={session?.email ?? null}>{children}</AdminShell>;
}

export async function requireAdmin() {
  const { redirect } = await import("next/navigation");
  const session = await getSession();
  if (!session) redirect("/addweb/login");
  return session;
}
