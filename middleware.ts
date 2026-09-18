import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const SESSION_COOKIE = "ow_session";
const LOCALES = routing.locales as unknown as string[];

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || (process.env.SESSION_SECRET ?? "").length < 32) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

/** Split an optional locale prefix (only non-default locales are prefixed). */
function splitLocale(pathname: string): { prefix: string; rest: string } {
  for (const l of LOCALES) {
    if (l === routing.defaultLocale) continue;
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) {
      return { prefix: `/${l}`, rest: pathname.slice(l.length + 1) || "/" };
    }
  }
  return { prefix: "", rest: pathname };
}

function isAdminPath(rest: string): boolean {
  return rest === "/addweb" || rest.startsWith("/addweb/");
}

function isLoginPath(rest: string): boolean {
  return rest === "/addweb/login" || rest.startsWith("/addweb/login/");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { prefix, rest } = splitLocale(pathname);

  // Public login page inside hidden admin area
  if (isLoginPath(rest)) {
    if (await isAuthenticated(req)) {
      return NextResponse.redirect(new URL(`${prefix}/addweb/dashboard`, req.url));
    }
    return intlMiddleware(req);
  }

  // Every other /addweb route requires a real session (server-side, prefix-aware)
  if (isAdminPath(rest)) {
    if (!(await isAuthenticated(req))) {
      const login = new URL(`${prefix}/addweb/login`, req.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|uploads|.*\\..*).*)"],
};
