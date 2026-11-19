import { IMAGE_IDENTITY } from "./generated/imageIdentity";

/** Two hashes this close are the same photograph saved twice (resized or re-encoded). */
const SAME_PICTURE = 6;

function bits(hex: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
  return out;
}

function distance(a: string, b: string): number {
  const left = bits(a);
  const right = bits(b);
  let total = 0;
  for (let i = 0; i < left.length; i += 1) {
    let diff = left[i] ^ right[i];
    while (diff) {
      total += diff & 1;
      diff >>= 1;
    }
  }
  return total;
}

/**
 * True when two image paths show the same photograph. One photograph is stored
 * under several file names on this site, so a path comparison is not enough.
 */
export function samePicture(a: string, b: string): boolean {
  if (a === b) return true;
  const left = IMAGE_IDENTITY[a];
  const right = IMAGE_IDENTITY[b];
  if (!left || !right) return false;
  return distance(left, right) <= SAME_PICTURE;
}

/** Keeps the first item for each photograph, in order. */
export function distinctPictures<T>(items: T[], src: (item: T) => string | undefined, taken: string[] = []): T[] {
  const seen = [...taken];
  return items.filter((item) => {
    const picture = src(item);
    if (!picture) return true;
    if (seen.some((other) => samePicture(other, picture))) return false;
    seen.push(picture);
    return true;
  });
}
