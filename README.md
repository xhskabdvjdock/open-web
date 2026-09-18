# Personal Project Showcase

A real Next.js + React + TypeScript application: a public project showcase with a hidden,
fully authenticated admin area for managing projects.

## Stack

- Next.js (App Router, Server Components, Server Actions, Route Handlers)
- React + TypeScript
- Prisma ORM + PostgreSQL (real database, no fake data; Supabase-ready)
- Cookie session auth with `bcryptjs` + `jose` (single admin account, no public registration)
- Local file storage under `public/uploads` (real uploads with type/size validation)
- Tailwind CSS + `lucide-react` icons only (no emoji)
- Arabic-first RTL interface using the Thmanyah Sans webfont (loaded from CDN; no font files are hosted in this repo per the font license)
- Bilingual UI (Arabic default, English secondary) via `next-intl` with `as-needed` locale prefix
- Site-wide dark mode (toggle in header/admin, saved in localStorage, follows OS preference by default)

## Routes

Public (no login required). Arabic is the default with clean URLs; English lives under `/en`.
A language switcher in the header (and in the admin shell) toggles between them:

- `/` — showcase, featured section, search + category/technology filters, about (`/en` for English)
- `/projects` — full archive with the same real search/filters
- `/projects/[slug]` — per-project page with real SEO/OpenGraph metadata

Hidden admin (never linked from public UI, sitemap, or robots — but protected server-side).
In English mode the same pages live under `/en/addweb/*`:

- `/addweb` → redirects to `/addweb/dashboard`
- `/addweb/login` — owner sign-in
- `/addweb/dashboard` — real counts from the database
- `/addweb/projects` — list with edit / preview / delete / publish toggle / reorder (saved to DB)
- `/addweb/new` — editor with live preview (same components as the public site)
- `/addweb/[id]/edit` — same editor with existing data
- `/addweb/settings` — site name, tagline, about, categories, change email, change password

## Setup

```bash
npm install
cp .env.example .env   # then edit ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET / DATABASE_URL
npx prisma db push     # use DIRECT_URL (port 5432) for this step, not the pooler
npm run db:seed
npm run dev
```

Seed creates the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` and default site settings.
Open `http://localhost:3000` for the public site and `http://localhost:3000/addweb` for admin.

## Changing the admin login later

`.env` is only read on first seed — editing it afterwards does not change the stored login.
To apply new values: update `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`, then run:

```bash
npm run admin:reset
```

(Changing just the password is also possible anytime from `/addweb/settings` → Change password.)

## Internationalization

- `i18n/routing.ts` — locales `ar` (default, no URL prefix) and `en` (`/en` prefix)
- `messages/ar.json`, `messages/en.json` — every UI string, including validation and server-action messages; keep keys in sync
- Public pages are statically generated per locale with ISR; admin pages are dynamic (session-based)

## Environment

| Variable           | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `DATABASE_URL`     | Prisma connection string (Supabase pooler `...:6543/postgres?pgbouncer=true`; encode `@` in the password as `%40`)|
| `SESSION_SECRET`   | Min 32 chars, signs the admin session cookie         |
| `ADMIN_EMAIL`      | Seeded admin login                                   |
| `ADMIN_PASSWORD`   | Seeded admin password (min 8 chars, bcrypt-hashed)   |
| `SITE_NAME`        | Default site name used by the seed                   |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used for sitemap/OG tags           |

## Notes

- Draft projects are invisible to visitors; only `PUBLISHED` projects render publicly.
- Every admin route is guarded twice: `middleware.ts` redirects logged-out users to login,
  and each page also checks the session server-side.
- Deleting a project also deletes its uploaded image when it is safe to do so.
- Every appearance setting in the editor (theme, accent, card style, aspect, toggles,
  description length, featured layout) is applied by the public components — there are
  no decorative settings.
