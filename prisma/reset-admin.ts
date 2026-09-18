// Reset (or create) the single owner admin account from .env values.
// Usage: npm run admin:reset
// Reads ADMIN_EMAIL + ADMIN_PASSWORD, sets them as the ONLY admin login,
// and removes any other admin accounts so old credentials stop working.
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !email.includes("@")) {
    console.error("Set a valid ADMIN_EMAIL in .env first.");
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error("Set ADMIN_PASSWORD (min 8 chars) in .env first.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    await prisma.adminUser.update({ where: { email }, data: { passwordHash } });
    console.log(`Updated password for admin: ${email}`);
  } else {
    await prisma.adminUser.create({ data: { email, passwordHash } });
    console.log(`Created admin: ${email}`);
  }

  const removed = await prisma.adminUser.deleteMany({ where: { email: { not: email } } });
  if (removed.count > 0) console.log(`Removed ${removed.count} old admin account(s).`);

  const remaining = await prisma.adminUser.findMany({ select: { email: true } });
  console.log("Active admin logins:", remaining.map((a) => a.email).join(", "));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
