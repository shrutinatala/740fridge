function fnv1a32(input: string) {
  let hash = 0x811c9dc5;
  for (let idx = 0; idx < input.length; idx++) {
    hash ^= input.charCodeAt(idx);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function random() {
    // Deterministic, fast PRNG for stable layout across renders.
    // Not crypto-safe (and doesn't need to be).
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeededRandom(seedKey: string) {
  return mulberry32(fnv1a32(seedKey));
}

export function pickOne<T>(random: () => number, items: readonly T[]) {
  return items[Math.floor(random() * items.length)];
}
