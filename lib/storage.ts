import { promises as fs } from "fs";
import path from "path";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export function validateImageFile(file: File, locale: string = "ar"): string | null {
  const t = (locale === "en" ? enMessages : arMessages).storage;
  if (!ALLOWED_MIME.has(file.type)) {
    return t.typeErr;
  }
  if (file.size <= 0) return t.empty;
  if (file.size > MAX_BYTES) return t.sizeErr;
  return null;
}

export async function saveUploadedImage(file: File): Promise<string> {
  await ensureUploadDir();
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, name), bytes);
  return `/uploads/${name}`;
}

export async function deleteImageByUrl(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;
  // Prevent path traversal
  const base = path.basename(imageUrl);
  if (base.includes("..")) return;
  const full = path.join(UPLOAD_DIR, base);
  // Ensure the resolved path stays inside the upload dir
  if (!full.startsWith(UPLOAD_DIR)) return;
  try {
    await fs.unlink(full);
  } catch {
    // File already gone — not an error for our purposes
  }
}
