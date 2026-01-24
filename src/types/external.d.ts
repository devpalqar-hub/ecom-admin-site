// types.d.ts or declarations.d.ts

declare module "arabic-persian-reshaper" {
  export default function reshape(text: string): string;
  export function reshape(text: string): string;
}

declare module "bidi-js" {
  export default function bidi(text: string): string;
  export function bidi(text: string): string;
}