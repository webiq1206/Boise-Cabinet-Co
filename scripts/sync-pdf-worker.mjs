import { copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const source = require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs');
const destination = fileURLToPath(new URL('../public/pdf.worker.min.mjs', import.meta.url));
copyFileSync(source, destination);
console.log('Catalog PDF worker synchronized with installed PDF.js.');
