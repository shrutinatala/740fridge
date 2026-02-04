import { list, put } from "@vercel/blob";
import { parseUploadedAtMsFromKey, type FridgePhoto } from "@/lib/photos";

const UPLOAD_PREFIX = "uploads/";
const META_PREFIX = `${UPLOAD_PREFIX}meta/`;

/** Canonical key for metadata lookups (strip leading slash if present). */
function normalizeKey(key: string): string {
  return key.replace(/^\/+/, "");
}

function getMetadataKey(photoKey: string): string {
  const canonical = normalizeKey(photoKey);
  const withoutPrefix = canonical.startsWith(UPLOAD_PREFIX)
    ? canonical.slice(UPLOAD_PREFIX.length)
    : canonical;
  return `${META_PREFIX}${withoutPrefix}.json`;
}

export interface PhotoMetadataEntry {
  key: string;
  name?: string;
  note?: string;
}

export async function listFridgePhotos() {
  const results = await list({ prefix: UPLOAD_PREFIX, limit: 2000 });

  const metadataMap = await getMetadataMap(results.blobs);

  const photos: FridgePhoto[] = results.blobs
    .filter((blob) => {
      const path = normalizeKey(blob.pathname);
      if (path.endsWith("_metadata.json")) return false;
      if (path.startsWith(normalizeKey(META_PREFIX))) return false;
      return true;
    })
    .map((blob) => {
      const canonicalKey = normalizeKey(blob.pathname);
      const meta = metadataMap[canonicalKey];
      return {
        key: blob.pathname,
        url: blob.url,
        uploadedAtMs: parseUploadedAtMsFromKey(blob.pathname),
        name: meta?.name,
        note: meta?.note,
      };
    });

  photos.sort((a, b) => b.uploadedAtMs - a.uploadedAtMs);
  return photos;
}

async function getMetadataMap(
  blobs: { pathname: string; url: string }[],
): Promise<Record<string, PhotoMetadataEntry>> {
  const map: Record<string, PhotoMetadataEntry> = {};
  const metaBlobs = blobs.filter((blob) =>
    normalizeKey(blob.pathname).startsWith(normalizeKey(META_PREFIX)),
  );

  for (const blob of metaBlobs) {
    try {
      const res = await fetch(blob.url);
      if (!res.ok) continue;
      const entry = (await res.json()) as PhotoMetadataEntry;
      if (entry?.key) {
        map[normalizeKey(entry.key)] = entry;
      }
    } catch {
      // ignore individual metadata failures
    }
  }

  return map;
}

export async function savePhotoMetadata(entry: PhotoMetadataEntry) {
  const canonicalKey = normalizeKey(entry.key);
  const metadataKey = getMetadataKey(canonicalKey);
  const payload: PhotoMetadataEntry = {
    key: canonicalKey,
    name: entry.name,
    note: entry.note,
  };

  await put(metadataKey, JSON.stringify(payload), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
