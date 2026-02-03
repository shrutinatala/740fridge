import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import { savePhotoMetadata } from "@/lib/blob";

export const runtime = "nodejs";

const UploadSchema = z.object({
  // Enforced in client + rechecked here via file.type.
  // (File object itself comes from formData.)
});

function createUploadKey() {
  return `uploads/${Date.now()}-${crypto.randomUUID()}.webp`;
}

function isAllowedMimeType(mimeType: string) {
  return (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/heic" ||
    mimeType === "image/heif" ||
    mimeType === "image/webp"
  );
}

export async function POST(request: Request) {
  // How uploads work:
  // - Guests POST a multipart/form-data payload with a single "file" field.
  // - We convert to a reasonably sized WebP (auto-rotate using EXIF).
  // - We store the WebP in Vercel Blob under `uploads/`.
  //
  // Where images are stored:
  // - Vercel Blob (public access) so images can be rendered by the fridge wall.
  // - Set `BLOB_READ_WRITE_TOKEN` in your environment for local/dev + deploy.
  try {
    UploadSchema.parse({});

    const formData = await request.formData();
    const file = formData.get("file");
    const name = (formData.get("name") as string | null)?.trim() || undefined;
    const note = (formData.get("note") as string | null)?.trim() || undefined;

    if (!(file instanceof File))
      return NextResponse.json(
        { ok: false, error: "Missing file" },
        { status: 400 }
      );

    if (!isAllowedMimeType(file.type))
      return NextResponse.json(
        { ok: false, error: "Unsupported file type" },
        { status: 415 }
      );

    // 12MB raw cap (before conversion) to keep this tiny and cheap.
    if (file.size > 12 * 1024 * 1024)
      return NextResponse.json(
        { ok: false, error: "File too large (max 12MB)" },
        { status: 413 }
      );

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const webpBuffer = await sharp(inputBuffer, { failOn: "none" })
      .rotate() // apply EXIF orientation
      .resize({
        width: 2000,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();

    const key = createUploadKey();

    const blob = await put(key, webpBuffer, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
    });

    if (name !== undefined || note !== undefined) {
      await savePhotoMetadata({ key: blob.pathname, name, note });
    }

    return NextResponse.json({ ok: true, url: blob.url, key: blob.pathname });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
