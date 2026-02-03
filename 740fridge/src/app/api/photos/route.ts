import { NextResponse } from "next/server";
import { listFridgePhotos } from "@/lib/blob";

export const runtime = "nodejs";

export async function GET() {
  // Public endpoint that returns photo URLs + metadata.
  // The "password gate" is intentionally client-side only (per requirements),
  // so this endpoint is not protected.
  const photos = await listFridgePhotos();
  return NextResponse.json({ ok: true, photos });
}
