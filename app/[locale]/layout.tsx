import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getSiteSetting } from "@/lib/projects";
import { ThemeProvider } from "@/components/ThemeProvider";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  let siteName = locale === "en" ? "Projects" : "أعمالي";
  try {
    siteName = await getSiteSetting("siteName", siteName);
  } catch {
    // DB may not exist at build time — fall back safely
  }
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: locale === "en" ? `${siteName} — Selected Work` : `${siteName} — أعمال مختارة`,
      template: `%s — ${siteName}`,
    },
    description:
      locale === "en"
        ? "A curated collection of projects: descriptions, technologies, live sites and source code."
        : "مجموعة مختارة من المشاريع: الوصف والتقنيات المستخدمة والمواقع المباشرة والكود المصدري.",
  };
}

export function generateViewport(): Viewport {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#030712" },
    ],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Static import keeps this layout prerenderable (no request headers read).
  const messages = locale === "en" ? enMessages : arMessages;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@dawod/thmanyah-font-web/sans.css"
        />
        {/* Pre-paint theme: applies saved mode before first paint (no flash, no hydration mismatch) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ow-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
