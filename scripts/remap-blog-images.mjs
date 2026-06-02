/**
 * Point blog/registry heroes at catalog and marketing assets (cabinet-native paths).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registry = path.join(__dirname, "../shared/blogImageRegistry.ts");
let text = fs.readFileSync(registry, "utf8");

text = text.replace(/\/images\/city-service\/kitchen-remodel__\w+\.webp/g, "/images/catalog/rooms/kitchen.webp");
text = text.replace(/\/images\/city-service\/bathroom-remodel__\w+\.webp/g, "/images/catalog/rooms/bathroom.webp");
text = text.replace(/\/images\/city-service\/whole-home-remodel__\w+\.webp/g, "/images/catalog/collections/full-custom.webp");
text = text.replace(/\/images\/city-service\/room-addition__\w+\.webp/g, "/images/catalog/rooms/built-ins.webp");
text = text.replace(/\/images\/city-service\/adu__\w+\.webp/g, "/images/catalog/rooms/closet.webp");
text = text.replace(/\/images\/blog\/[^'"]*remodel[^'"]*\.png/g, "/images/marketing/hero-home.webp");
text = text.replace(/\/images\/services\/whole-home-remodel\.webp/g, "/images/catalog/collections/semi-custom.webp");
text = text.replace(/\/images\/services\/kitchen-remodel\.webp/g, "/images/catalog/rooms/kitchen.webp");
text = text.replace(/\/images\/services\/bathroom-remodel\.webp/g, "/images/catalog/rooms/bathroom.webp");
text = text.replace(/\/images\/services\/room-addition\.webp/g, "/images/catalog/rooms/built-ins.webp");
text = text.replace(/\/images\/services\/adu\.webp/g, "/images/catalog/rooms/closet.webp");
text = text.replace(/bath remodel/g, "bath vanity");

fs.writeFileSync(registry, text);

const svc = path.join(__dirname, "../shared/serviceBackgrounds.ts");
let svcText = fs.readFileSync(svc, "utf8");
svcText = svcText.replace(/\/images\/services\/kitchen-remodel\.webp/g, "/images/catalog/rooms/kitchen.webp");
svcText = svcText.replace(/\/images\/services\/bathroom-remodel\.webp/g, "/images/catalog/rooms/bathroom.webp");
svcText = svcText.replace(/\/images\/services\/whole-home-remodel\.webp/g, "/images/catalog/collections/semi-custom.webp");
svcText = svcText.replace(/\/images\/services\/room-addition\.webp/g, "/images/catalog/rooms/built-ins.webp");
svcText = svcText.replace(/\/images\/services\/adu\.webp/g, "/images/catalog/rooms/closet.webp");
fs.writeFileSync(svc, svcText);

console.log("Remapped blog and service image paths.");
