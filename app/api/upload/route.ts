import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { saveUploadedImage, validateImageFile } from "@/lib/storage";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") === "en" ? "en" : "ar";
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: locale === "en" ? "Session expired. Please sign in again and retry." : "انتهت الجلسة. سجل الدخول مجدداً ثم أعد المحاولة." },
      { status: 401 },
    );
  }
  // Server-side enforcement messages (the editor also validates client-side first).
  const fallbackFail =
    locale === "en" ? enMessages.editor.uploadFail : arMessages.editor.uploadFail;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: fallbackFail }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: fallbackFail }, { status: 400 });
  }

  const validationError = validateImageFile(file, locale);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const saved = await saveUploadedImage(file);
    return NextResponse.json({ url: saved });
  } catch {
    return NextResponse.json({ error: fallbackFail }, { status: 500 });
  }
}
