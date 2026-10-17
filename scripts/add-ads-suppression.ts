import { addEnhancedConversionSuppression } from "../lib/ads/enhancedConversionSuppression";

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  const value = index === -1 ? undefined : process.argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

const email = flag("--email");
const phone = flag("--phone");
const stored = await addEnhancedConversionSuppression({ email, phone });
if (!stored.email && !stored.phone) {
  console.error("Nothing stored. Pass --email and/or a 10-digit --phone. Raw values are not saved.");
  process.exit(1);
}
console.log(`Stored suppression hashes. email=${stored.email} phone=${stored.phone}`);
