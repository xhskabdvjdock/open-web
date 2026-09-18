import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]+$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }
  const img = await prisma.projectImage.findUnique({ where: { id } });
  if (!img) {
    return new Response("Not found", { status: 404 });
  }
  // Bytes are immutable (a new upload always creates a new row), so cache hard.
  return new Response(img.data, {
    headers: {
      "Content-Type": img.mime,
      "Content-Length": String(img.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
