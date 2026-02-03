import { list } from "@vercel/blob";
import { parseUploadedAtMsFromKey, type FridgePhoto } from "@/lib/photos";

const UPLOAD_PREFIX = "uploads/";

export async function listFridgePhotos() {
  const results = await list({ prefix: UPLOAD_PREFIX, limit: 2000 });

  const photos: FridgePhoto[] = results.blobs.map((blob) => ({
    key: blob.pathname,
    url: blob.url,
    uploadedAtMs: parseUploadedAtMsFromKey(blob.pathname),
  }));

  // Most recent first.
  photos.sort((a, b) => b.uploadedAtMs - a.uploadedAtMs);
  return photos;
}
