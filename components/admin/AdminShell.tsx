"use client";

import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { FolderKanban, LayoutDashboard, LogOut, Plus, Settings } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/features/projects/auth-actions";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeProvider";

export function AdminShell({ email, children }: { email: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("shell");
  const isLogin = pathname === "/addweb/login";

  if (isLogin) return <>{children}</>;
  if (!email) return <>{children}</>;

  const NAV = [
    { href: "/addweb/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/addweb/projects", label: t("projects"), icon: FolderKanban },
    { href: "/addweb/new", label: t("new"), icon: Plus },
    { href: "/addweb/settings", label: t("settings"), icon: Settings },
  ];
  const logout = logoutAction.bind(null, locale);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="hidden w-60 shrink-0 flex-col border-e border-gray-200 bg-white md:flex dark:border-gray-800 dark:bg-gray-900" aria-label={t("adminNav")}>
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{t("admin")}</p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400" dir="ltr">{email}</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/addweb/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-gray-200 p-3 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" aria-hidden /> {t("logout")}
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white md:hidden dark:border-gray-800 dark:bg-gray-900">
          <nav className="flex items-center gap-1 overflow-x-auto px-3 py-2 text-sm" aria-label={t("adminNav")}>
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-2 font-medium",
                    active
                      ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="ms-auto flex items-center">
              <LocaleSwitcher />
              <ThemeToggle />
              <form action={logout}>
                <button type="submit" className="whitespace-nowrap rounded-md px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  {t("logoutShort")}
                </button>
              </form>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
