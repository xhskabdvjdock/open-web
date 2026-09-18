import { prisma } from "@/lib/db";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
// Uploads saved with a project are linked via Project.imageId; anything older
// than this without a link is an abandoned upload and gets swept.
const ORPHAN_AFTER_MS = 24 * 60 * 60 * 1000;

export function validateImageFile(file: File, locale: string = "ar"): string | null {
  const t = (locale === "en" ? enMessages : arMessages).storage;
  if (!ALLOWED_MIME.has(file.type)) {
    return t.typeErr;
  }
  if (file.size <= 0) return t.empty;
  if (file.size > MAX_BYTES) return t.sizeErr;
  return null;
}

/** Extract a ProjectImage id from a serving URL (/api/images/<id>). */
export function imageIdFromUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const m = /^\/api\/images\/([a-z0-9]+)$/.exec(imageUrl.trim());
  return m ? m[1] : null;
}

/** Store image bytes in PostgreSQL and return the public serving URL. */
export async function saveUploadedImage(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const created = await prisma.projectImage.create({
    data: { data: bytes, mime: file.type, size: file.size },
    select: { id: true },
  });
  return `/api/images/${created.id}`;
}

/** Delete the ProjectImage row behind a serving URL (no-op for anything else). */
export async function deleteImageByUrl(imageUrl: string | null | undefined): Promise<void> {
  const id = imageIdFromUrl(imageUrl);
  if (!id) return;
  try {
    // deleteMany: missing rows are fine (already gone), real failures still surface.
    await prisma.projectImage.deleteMany({ where: { id } });
  } catch (err) {
    console.error(`Failed to delete project image ${id}:`, err);
  }
}

/** Remove uploaded images that were never attached to a project (abandoned uploads). */
export async function cleanupOrphanImages(): Promise<number> {
  try {
    const res = await prisma.projectImage.deleteMany({
      where: {
        project: null,
        createdAt: { lt: new Date(Date.now() - ORPHAN_AFTER_MS) },
      },
    });
    return res.count;
  } catch (err) {
    console.error("Failed to clean up orphan images:", err);
    return 0;
  }
}
