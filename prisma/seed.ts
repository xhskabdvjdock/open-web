import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (email && password && password.length >= 8) {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (!existing) {
      const passwordHash = await hashPassword(password);
      await prisma.adminUser.create({ data: { email, passwordHash } });
      console.log(`Seeded admin user: ${email}`);
    } else {
      console.log(`Admin user already exists: ${email}`);
    }
  } else {
    console.log("Skipped admin seed: set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) in .env");
  }

  const defaults: Record<string, string> = {
    siteName: process.env.SITE_NAME ?? "أعمالي",
    siteTagline: "مجموعة مختارة من أعمالي.",
    aboutTitle: "نبذة",
    aboutBody:
      "يجمع هذا الموقع مختارات من المشاريع التي صممتها وبنيتها. تتضمن كل صفحة مشروع وصفاً والتقنيات المستخدمة وروابط للموقع المباشر والكود المصدري عند توفره.",
    categories: JSON.stringify(["تطبيق ويب", "منصة SaaS", "أداة", "معرض أعمال", "لوحة تحكم", "متجر إلكتروني", "أخرى"]),
  };

  for (const [key, value] of Object.entries(defaults)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("Seeded site settings.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
