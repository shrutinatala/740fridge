export interface FridgePhoto {
  key: string;
  url: string;
  uploadedAtMs: number;
  name?: string;
  note?: string;
}

export function parseUploadedAtMsFromKey(key: string) {
  // We name keys as: uploads/<timestampMs>-<uuid>.webp
  // If parsing fails, fall back to "old" so it drifts downward.
  const filename = key.split("/").pop() ?? key;
  const timestampPart = filename.split("-")[0] ?? "";
  const uploadedAtMs = Number(timestampPart);
  return Number.isFinite(uploadedAtMs) ? uploadedAtMs : 0;
}
