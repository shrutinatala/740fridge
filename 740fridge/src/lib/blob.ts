import { list, put } from "@vercel/blob";
import { parseUploadedAtMsFromKey, type FridgePhoto } from "@/lib/photos";

const UPLOAD_PREFIX = "uploads/";
const METADATA_PATH = "uploads/_metadata.json";

export interface PhotoMetadataEntry {
  key: string;
  name?: string;
  note?: string;
}

export async function listFridgePhotos() {
  const results = await list({ prefix: UPLOAD_PREFIX, limit: 2000 });

  const metadataMap = await getMetadataMap(results.blobs);

  const photos: FridgePhoto[] = results.blobs
    .filter((blob) => !blob.pathname.endsWith("_metadata.json"))
    .map((blob) => {
      const meta = metadataMap[blob.pathname];
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
  const metaBlob = blobs.find((b) => b.pathname === METADATA_PATH);
  if (!metaBlob) return {};

  try {
    const res = await fetch(metaBlob.url);
    if (!res.ok) return {};
    const arr = (await res.json()) as PhotoMetadataEntry[];
    const map: Record<string, PhotoMetadataEntry> = {};
    for (const entry of arr) {
      map[entry.key] = entry;
    }
    return map;
  } catch {
    return {};
  }
}

export async function savePhotoMetadata(entry: PhotoMetadataEntry) {
  const listResult = await list({ prefix: UPLOAD_PREFIX, limit: 1 });
  const existingBlob = listResult.blobs.find(
    (b) => b.pathname === METADATA_PATH,
  );
  let entries: PhotoMetadataEntry[] = [];
  if (existingBlob) {
    try {
      const res = await fetch(existingBlob.url);
      if (res.ok) entries = (await res.json()) as PhotoMetadataEntry[];
    } catch {
      // ignore
    }
  }
  const index = entries.findIndex((e) => e.key === entry.key);
  if (index >= 0) entries[index] = entry;
  else entries.push(entry);

  const json = JSON.stringify(entries);
  await put(METADATA_PATH, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
