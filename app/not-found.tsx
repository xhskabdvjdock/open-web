import { NotFoundContent } from "@/components/NotFoundContent";
import ar from "@/messages/ar.json";

// Static Arabic fallback (default locale). Locale-prefixed typos are handled
// by app/[locale]/[...rest]/page.tsx with fully localized content.
export default function NotFound() {
  const t = ar.notFound;
  return <NotFoundContent title={t.title} body={t.body} back={t.back} backHref="/" dir="rtl" />;
}
