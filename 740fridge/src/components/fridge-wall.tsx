"use client";

import Image from "next/image";
import * as React from "react";
import type { CSSProperties } from "react";
import { createSeededRandom, pickOne } from "@/lib/random";
import type { FridgePhoto } from "@/lib/photos";
import { CircleMagnet, StarMagnet } from "@/components/magnets";
import { PhotoLightbox } from "@/components/photo-lightbox";

interface FridgeWallProps {
  photos: FridgePhoto[];
}

interface PlacedPrint {
  id: string;
  url: string;
  alt: string;
  row: number;
  col: number;
  rotateDeg: number;
  shiftX: number;
  shiftY: number;
  z: number;
}

/** Assumed aspect ratio for a typical horizontal photo (width / height). */
const LANDSCAPE_ASPECT = 4 / 3;

function FridgeImage({
  print,
  baseMagnetStyle,
  magnetKind,
  random,
}: {
  print: PlacedPrint;
  baseMagnetStyle: CSSProperties;
  magnetKind: "circle" | "star";
  random: () => number;
}) {
  const [aspect, setAspect] = React.useState<number | null>(null);

  const isPortrait = aspect !== null && aspect < 1;
  // For a 4:3 horizontal image filling the column, height = width * 3/4.
  // We want the portrait image width to equal that height, so 75% of column.
  const portraitWidthPercent = (1 / LANDSCAPE_ASPECT) * 100; // 75

  return (
    <div
      className="relative flex justify-center"
      style={
        isPortrait
          ? { maxWidth: `${portraitWidthPercent}%`, margin: "0 auto" }
          : undefined
      }
    >
      <Image
        src={print.url}
        alt={print.alt}
        width={800}
        height={800}
        sizes="(max-width: 640px) 50vw, 33vw"
        className="h-auto w-full object-contain"
        priority={print.row === 0 && print.col === 0}
        onLoadingComplete={({ naturalWidth, naturalHeight }) => {
          if (naturalWidth > 0 && naturalHeight > 0) {
            setAspect(naturalWidth / naturalHeight);
          }
        }}
      />

      {magnetKind === "circle" && (
        <CircleMagnet
          style={
            {
              ...baseMagnetStyle,
              ["--circle" as never]: pickOne(random, [
                "#60A5FA",
                "#F59E0B",
                "#34D399",
                "#F472B6",
                "#A78BFA",
              ]),
            } as CSSProperties
          }
        />
      )}
      {magnetKind === "star" && <StarMagnet style={baseMagnetStyle} />}
    </div>
  );
}

function buildPrints(photos: FridgePhoto[]) {
  // One print per uploaded photo; we keep a small, organic rotation/offset
  // but do not duplicate the image.
  const prints: PlacedPrint[] = [];

  for (const photo of photos) {
    const random = createSeededRandom(photo.key);

    prints.push({
      id: photo.key,
      url: photo.url,
      alt: "Guest photo",
      row: 0,
      col: 0,
      rotateDeg: (random() - 0.5) * 5.5,
      shiftX: (random() - 0.5) * 10,
      shiftY: (random() - 0.5) * 10,
      z: 10,
    });
  }

  return prints;
}

function computeGridPlacement(prints: PlacedPrint[]) {
  // Organic 3×3-ish pattern: we place in 3 columns, advancing rows.
  // Newest photos are earliest in the list, so they land near the top.
  const placed = [...prints];
  const cols = 3;

  for (let idx = 0; idx < placed.length; idx++) {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    placed[idx] = { ...placed[idx], row, col };
  }

  return placed;
}

export function FridgeWall({ photos }: FridgeWallProps) {
  const prints = React.useMemo(
    () => computeGridPlacement(buildPrints(photos)),
    [photos],
  );
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  return (
    <div className="min-h-dvh bg-[var(--background)] px-3 py-4 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="fridge-surface relative overflow-hidden rounded-[32px] border border-zinc-100">
          <header className="px-5 pt-6 sm:px-8 sm:pt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-[0.22em] text-zinc-500">
                  740FRIDGE
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  The fridge wall
                </h1>
                <p className="mt-1 text-sm text-zinc-600">
                  Photos drift down as the fridge fills up.
                </p>
              </div>
              <a
                href="/upload"
                className="h-10 shrink-0 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white grid place-items-center hover:bg-zinc-800 active:bg-zinc-950"
              >
                Upload
              </a>
            </div>
          </header>

          <div className="relative px-4 pb-10 pt-6 sm:px-7">
            <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-7 items-center">
              {prints.length === 0 ? (
                <div className="col-span-2 sm:col-span-3 rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-10 text-center text-zinc-600">
                  No photos yet. Add the first one from{" "}
                  <a className="underline" href="/upload">
                    /upload
                  </a>
                  .
                </div>
              ) : null}

              {prints.map((print, printIndex) => {
                const random = createSeededRandom(print.id);
                const lift = 1 - Math.min(1, (print.row ?? 0) / 14);
                const driftY = (1 - lift) * (16 + random() * 12);

                const magnetKind = pickOne(random, ["circle", "star"] as const);
                const edge = pickOne(random, ["top", "left", "right"] as const);

                // Sit on the top, left, or right edge of the photo with a bit
                // of randomness so it feels organic.
                let baseMagnetStyle: CSSProperties;
                if (edge === "top") {
                  const horizontal = 10 + random() * 80;
                  baseMagnetStyle = {
                    top: -8,
                    left: `${horizontal}%`,
                    transform: "translateX(-50%)",
                  };
                } else if (edge === "left") {
                  const vertical = 15 + random() * 70;
                  baseMagnetStyle = {
                    top: `${vertical}%`,
                    left: -10,
                    transform: "translateY(-50%)",
                  };
                } else {
                  const vertical = 15 + random() * 70;
                  baseMagnetStyle = {
                    top: `${vertical}%`,
                    right: -10,
                    transform: "translateY(-50%)",
                  };
                }

                return (
                  <div
                    key={print.id}
                    className="relative cursor-pointer"
                    style={{
                      transform: `translate(${print.shiftX}px, ${
                        print.shiftY + driftY
                      }px) rotate(${print.rotateDeg}deg)`,
                      zIndex: print.z,
                    }}
                    onClick={() => setLightboxIndex(printIndex)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLightboxIndex(printIndex);
                      }
                    }}
                    aria-label="View photo"
                  >
                    <FridgeImage
                      print={print}
                      baseMagnetStyle={baseMagnetStyle}
                      magnetKind={magnetKind}
                      random={random}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-zinc-500">
          Tip: print a QR code to{" "}
          <span className="font-mono text-zinc-700">/upload</span> for guests.
        </div>
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
