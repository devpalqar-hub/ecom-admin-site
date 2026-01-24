import { reshape } from "arabic-persian-reshaper";
import bidi from "bidi-js";

export function ar(text: string) {
  if (!text) return "";

  // 1️⃣ Shape Arabic glyphs
  const shaped = reshape(text);

  // 2️⃣ Apply RTL bidi
  const bidiText = bidi(shaped);
  return bidiText;
}
