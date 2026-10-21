import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function ensureParam(url: string, key: string, value: string): string {
  if (new RegExp(`[?&]${key}=`).test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${key}=${value}`;
}

// Small default pools (host-dependent) exhaust during static prerendering of
// many pages with concurrent queries (Prisma error P2024). Raise the pool
// unless the URL already specifies these params.
function withPoolParams(url: string | undefined): string | undefined {
  if (!url) return url;
  return ensureParam(ensureParam(url, "connection_limit", "10"), "pool_timeout", "30");
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: withPoolParams(process.env.DATABASE_URL) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
