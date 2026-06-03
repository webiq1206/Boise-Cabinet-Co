import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public", "images", "catalog");

const collections = [
  ["collections/custom.png", "Custom Cabinets Collection"],
  ["collections/reserve.png", "Reserve Collection"],
];

const rooms = [
  "kitchen", "bathroom", "laundry", "mudroom", "home-office",
  "entertainment", "built-ins", "pantry", "closet", "garage", "outdoor", "bedroom", "wet-bar",
];

const finishes = [
  "snowcap", "glacier", "matte-black", "forest-green", "pebble-grey",
  "white-hg", "black-hg", "canyon-oak", "pecan-gold", "basalt",
];

function svg(label, color = "#E8E4DE", accent = "#5A5F5C") {
  const safe = label.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" role="img" aria-label="${safe}">
  <rect width="800" height="600" fill="${color}"/>
  <rect x="40" y="40" width="720" height="520" fill="none" stroke="${accent}" stroke-width="1" opacity="0.2"/>
  <text x="400" y="290" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="22" font-weight="300">${safe}</text>
  <text x="400" y="330" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="13" opacity="0.6">Boise Cabinet Co</text>
</svg>`;
}

function swatchSvg(name, hex) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${hex}"/>
  <rect x="8" y="8" width="184" height="184" fill="none" stroke="#000" stroke-width="1" opacity="0.08"/>
</svg>`;
}

const finishColors = {
  snowcap: "#F5F3EF", glacier: "#E8ECEF", "matte-black": "#2A2A2A",
  "forest-green": "#2D4A3E", "pebble-grey": "#9A9590", "white-hg": "#FAFAFA",
  "black-hg": "#1A1A1A", "canyon-oak": "#A67C52", "pecan-gold": "#8B6914", basalt: "#4A4A48",
};

let count = 0;

for (const [rel, label] of collections) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, svg(label));
  count++;
}

for (const room of rooms) {
  const dest = path.join(root, "rooms", `${room}.png`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, svg(`${room.replace(/-/g, " ")} cabinets`));
  count++;
}

for (const finish of finishes) {
  const dest = path.join(root, "finishes", `${finish}.png`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, swatchSvg(finish, finishColors[finish] ?? "#E8E4DE"));
  count++;
}

console.log(`Wrote ${count} catalog placeholder images to public/images/catalog/`);
