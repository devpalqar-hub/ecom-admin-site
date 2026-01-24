// // Option 1: Using default import
// import reshape from "arabic-persian-reshaper";
// import bidi from "bidi-js";

// export function ar(text: string) {
//   if (!text) return "";

//   try {
//     // Shape Arabic glyphs
//     const shaped = reshape(text);

//     // Apply RTL bidi
//     return bidi(shaped);
//   } catch (error) {
//     console.error("Arabic reshaping error:", error);
//     // Fallback: return original text
//     return text;
//   }
// }

