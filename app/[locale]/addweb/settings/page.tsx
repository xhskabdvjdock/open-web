import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/projects";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { EmailForm } from "@/components/admin/EmailForm";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await getSession();
  if (!session) redirect("/addweb/login");
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings" });
  const settings = await getSiteSettings(["siteName", "siteTagline", "aboutTitle", "aboutBody", "categories"]);

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("h1")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("sub")}</p>
      </div>
      <SettingsForm initial={settings} />
      <EmailForm currentEmail={session.email} />
      <PasswordForm />
    </div>
  );
}
