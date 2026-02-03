"use client";

import Image from "next/image";
import * as React from "react";
import { createSeededRandom, pickOne } from "@/lib/random";
import type { FridgePhoto } from "@/lib/photos";
import { CircleMagnet, FlowerMagnet, UscMagnet } from "@/components/magnets";

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

function buildPrints(photos: FridgePhoto[]) {
  // Each uploaded photo becomes 2 "prints" with slightly different rotations.
  // This satisfies the "duplicated into multiple orientations" requirement without storing duplicates.
  const prints: PlacedPrint[] = [];

  for (const photo of photos) {
    const random = createSeededRandom(photo.key);
    const baseRotate = (random() - 0.5) * 5.5;
    const baseShiftX = (random() - 0.5) * 10;
    const baseShiftY = (random() - 0.5) * 10;

    const variants = [
      { suffix: "a", rotate: baseRotate - (2.4 + random() * 1.6) },
      { suffix: "b", rotate: baseRotate + (2.4 + random() * 1.6) },
    ] as const;

    for (const [idx, variant] of variants.entries()) {
      const id = `${photo.key}:${variant.suffix}`;
      const drift = idx === 0 ? -1 : 1;

      prints.push({
        id,
        url: photo.url,
        alt: "Guest photo",
        row: 0,
        col: 0,
        rotateDeg: variant.rotate,
        shiftX: baseShiftX + drift * (3 + random() * 4),
        shiftY: baseShiftY + drift * (2 + random() * 4),
        z: 10 + idx,
      });
    }
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

function FlowerColor({ seedKey }: { seedKey: string }) {
  const random = createSeededRandom(seedKey);
  const fill = pickOne(random, [
    "#F9A8D4", // pink
    "#FDE68A", // yellow
    "#86EFAC", // green
    "#C4B5FD", // purple
    "#93C5FD", // blue
  ] as const);

  return (
    <FlowerMagnet
      fill={fill}
      className="opacity-[0.98]"
      style={{
        transform: `rotate(${(random() - 0.5) * 18}deg)`,
      }}
    />
  );
}

export function FridgeWall({ photos }: FridgeWallProps) {
  const prints = React.useMemo(
    () => computeGridPlacement(buildPrints(photos)),
    [photos]
  );

  // Decorative magnets: stable randomness based on the overall wall seed.
  const magnets = React.useMemo(() => {
    const random = createSeededRandom(String(photos[0]?.key ?? "empty"));
    const items: React.ReactNode[] = [];

    const magnetCount = Math.min(
      18,
      Math.max(9, Math.floor(photos.length / 2) + 8)
    );
    for (let idx = 0; idx < magnetCount; idx++) {
      const left = `${6 + random() * 88}%`;
      const top = `${6 + random() * 86}%`;
      const rotate = (random() - 0.5) * 18;

      const kind = pickOne(random, ["circle", "flower", "usc"] as const);
      if (kind === "usc") {
        items.push(
          <UscMagnet
            key={`usc-${idx}`}
            style={{ left, top, transform: `rotate(${rotate}deg)` }}
          />
        );
        continue;
      }

      if (kind === "circle") {
        const color = pickOne(random, [
          "#60A5FA",
          "#F59E0B",
          "#34D399",
          "#F472B6",
          "#A78BFA",
        ] as const);
        items.push(
          <div
            key={`circle-${idx}`}
            style={{ left, top, transform: `rotate(${rotate}deg)` }}
          >
            <CircleMagnet
              style={{ ["--circle" as never]: color } as React.CSSProperties}
            />
          </div>
        );
        continue;
      }

      items.push(
        <div key={`flower-${idx}`} style={{ left, top }}>
          <FlowerColor seedKey={`flower-${idx}-${photos.length}`} />
        </div>
      );
    }

    return items;
  }, [photos]);

  return (
    <div className="min-h-dvh bg-[var(--background)] px-3 py-4 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="fridge-frame fridge-surface relative overflow-hidden">
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
            <div className="absolute inset-0">{magnets}</div>

            <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-7">
              {prints.length === 0 ? (
                <div className="col-span-2 sm:col-span-3 rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-10 text-center text-zinc-600">
                  No photos yet. Add the first one from{" "}
                  <a className="underline" href="/upload">
                    /upload
                  </a>
                  .
                </div>
              ) : null}

              {prints.map((print) => {
                const random = createSeededRandom(print.id);
                const lift = 1 - Math.min(1, (print.row ?? 0) / 14);
                const driftY = (1 - lift) * (16 + random() * 12);

                return (
                  <div
                    key={print.id}
                    className="relative"
                    style={{
                      transform: `translate(${print.shiftX}px, ${
                        print.shiftY + driftY
                      }px) rotate(${print.rotateDeg}deg)`,
                      zIndex: print.z,
                    }}
                  >
                    <div className="photo-print rounded-[18px] bg-white p-3">
                      <div className="relative overflow-hidden rounded-[12px] bg-zinc-100">
                        <Image
                          src={print.url}
                          alt={print.alt}
                          width={800}
                          height={800}
                          sizes="(max-width: 640px) 50vw, 33vw"
                          className="h-auto w-full object-cover"
                          priority={print.row === 0 && print.col === 0}
                        />
                      </div>
                      <div className="mt-2 h-2 w-16 rounded-full bg-zinc-200/70" />
                    </div>
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
    </div>
  );
}
