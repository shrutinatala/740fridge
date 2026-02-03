"use client";

import Image from "next/image";
import * as React from "react";
import type { FridgePhoto } from "@/lib/photos";

interface PhotoLightboxProps {
  photos: FridgePhoto[];
  initialIndex: number;
  onClose: () => void;
}

function formatUploadDate(uploadedAtMs: number): string {
  const d = new Date(uploadedAtMs);
  const date = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} ${time}`;
}

const SWIPE_THRESHOLD = 50;

export function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
}: PhotoLightboxProps) {
  const [index, setIndex] = React.useState(initialIndex);
  const touchStartX = React.useRef<number | null>(null);
  const photo = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setIndex((i) => Math.min(photos.length - 1, i + 1));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, photos.length]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = touchStartX.current - endX;
    touchStartX.current = null;
    if (delta > SWIPE_THRESHOLD && hasNext) setIndex((i) => i + 1);
    if (delta < -SWIPE_THRESHOLD && hasPrev) setIndex((i) => i - 1);
  }

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 fridge-surface flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 left-5 z-10 flex h-10 w-10 items-center justify-center text-zinc-600"
        aria-label="Close"
      >
        <span className="text-3xl font-bold leading-none">×</span>
      </button>

      <div className="flex flex-1 items-center justify-center gap-2 px-14 py-4">
        {hasPrev ? (
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            className="flex h-14 w-10 shrink-0 items-center justify-center text-zinc-600 hover:text-zinc-900"
            aria-label="Previous photo"
          >
            <svg
              width="24"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-6"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="h-14 w-10 shrink-0" aria-hidden />
        )}

        <div
          className="relative flex min-h-0 flex-1 items-center justify-center touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={photo.url}
            alt="Guest photo"
            width={1200}
            height={1200}
            className="max-h-[70vh] w-auto max-w-full object-contain"
            sizes="100vw"
          />
        </div>

        {hasNext ? (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="flex h-14 w-10 shrink-0 items-center justify-center text-zinc-600 hover:text-zinc-900"
            aria-label="Next photo"
          >
            <svg
              width="24"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-6"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : (
          <div className="h-14 w-10 shrink-0" aria-hidden />
        )}
      </div>

      <div className="border-t border-zinc-200 bg-white/60 px-5 py-4">
        <div className="mx-auto max-w-2xl">
          {photo.name ? (
            <p className="font-medium text-zinc-900">{photo.name}</p>
          ) : null}
          {photo.note ? (
            <p className="mt-1 text-xs text-zinc-600 italic">{photo.note}</p>
          ) : null}
          <p className="mt-1 text-xs text-zinc-500">
            {formatUploadDate(photo.uploadedAtMs)}
          </p>
        </div>
      </div>
    </div>
  );
}
