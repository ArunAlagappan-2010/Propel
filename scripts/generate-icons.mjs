// One-off: generates PWA icons from an inline SVG. Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const svg = (pad) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2563eb"/>
      <stop offset="1" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${pad ? 0 : 96}" fill="url(#g)"/>
  <g transform="translate(256 268)">
    <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="300"
      font-weight="bold" fill="#ffffff" text-anchor="middle"
      dominant-baseline="central">P</text>
  </g>
  <path transform="translate(330 96) scale(3.2)" fill="#ffffff" opacity="0.9"
    d="M12 2c2.5 1.5 5 5 5 9l-3 3h-4l-3-3c0-4 2.5-7.5 5-9zM9 13l-2 5 3-1 2-3zM15 13l2 5-3-1-2-3z"/>
</svg>`;

await mkdir("public/icons", { recursive: true });

await sharp(Buffer.from(svg(false))).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(Buffer.from(svg(false))).resize(512, 512).png().toFile("public/icons/icon-512.png");
// Maskable: full-bleed background (no rounded corners), content in safe zone.
await sharp(Buffer.from(svg(true))).resize(512, 512).png().toFile("public/icons/icon-512-maskable.png");

console.log("icons written to public/icons/");
