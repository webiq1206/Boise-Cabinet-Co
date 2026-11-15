import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {scanCabinetClientBoundary} from '../scripts/verify-cabinet-client-boundary.mjs';

function fixture(run) {
  const root = mkdtempSync(path.join(tmpdir(), 'cabinet-boundary-fixture-'));
  const write = (name, source) => {
    const file = path.join(root, name); mkdirSync(path.dirname(file), {recursive: true}); writeFileSync(file, source);
  };
  write('tsconfig.json', JSON.stringify({compilerOptions: {baseUrl: '.', paths: {'@/*': ['./*']}}}));
  write('components/Client.tsx', '"use client"; import {publicLabel} from "@/shared/public"; export const label=publicLabel;');
  write('shared/public.ts', 'export const publicLabel="Planning range";');
  write('server/estimateEngine.ts', 'if (typeof window !== "undefined") throw new Error("Server-only pricing"); export const calculate=()=>1;');
  write('lib/p5/priceBookData.ts', 'export const rows=[];');
  try { return run({root, write}); } finally { rmSync(root, {recursive: true, force: true}); }
}

test('public metadata and type-only private references do not create runtime exposure', () => fixture(({root, write}) => {
  write('shared/public.ts', 'import "./style.css"; import type {PrivateShape} from "../lib/p5/priceBookData"; export type {PrivateShape} from "../lib/p5/priceBookData"; export const publicLabel="Planning range";');
  write('shared/style.css', '.public{color:black}');
  write('lib/p5/priceBookData.ts', 'export interface PrivateShape {amount:number}');
  const result = scanCabinetClientBoundary({root});
  assert.equal(result.passed, true); assert.equal(result.source.clientRoots, 1);
  assert.equal(result.production.status, 'NOT_RUN'); assert.equal(result.publicHtml.status, 'NOT_RUN');
}));

test('barrel, dynamic import, and require edges cannot hide private modules', () => fixture(({root, write}) => {
  for (const source of [
    'export {rows} from "../lib/p5/priceBookData";',
    'export const load=()=>import("../lib/p5/priceBookData");',
    'export const rows=require("../lib/p5/priceBookData");',
  ]) {
    write('shared/public.ts', source);
    const result = scanCabinetClientBoundary({root});
    assert.equal(result.passed, false); assert.deepEqual(result.source.exposedPaths,
      [['components/Client.tsx', 'shared/public.ts', 'lib/p5/priceBookData.ts']]);
  }
}));

test('unresolvable local imports and opaque module paths cannot produce a source pass', () => fixture(({root, write}) => {
  for (const source of ['export const load=(name)=>import(name);', 'export {missing} from "./missing";']) {
    write('shared/public.ts', source);
    const result = scanCabinetClientBoundary({root});
    assert.equal(result.passed, false); assert.equal(result.source.incompleteEdges.length, 1);
    assert.equal(result.source.incompleteEdges[0].file, 'shared/public.ts');
  }
}));

test('missing runtime server guard fails while comments and unrelated throws do not masquerade as a guard', () => fixture(({root, write}) => {
  for (const source of ['export const calculate=()=>1;', '// import "server-only"\nfunction later(){throw new Error("Server only")}']) {
    write('server/estimateEngine.ts', source);
    assert.equal(scanCabinetClientBoundary({root}).source.serverGuard.passed, false);
  }
  write('server/estimateEngine.ts', 'import "server-only"; export const calculate=()=>1;');
  assert.equal(scanCabinetClientBoundary({root}).source.serverGuard.passed, true);
}));

test('production scan requires a real production marker and catches raw book/default policy bytes', () => fixture(({root, write}) => {
  write('.next/static/chunks/app.js', 'console.log("customer planning range and margin of safety");');
  assert.equal(scanCabinetClientBoundary({root, requireBuild: true}).passed, false);
  write('.next/BUILD_ID', 'fixture-build');
  assert.equal(scanCabinetClientBoundary({root, requireBuild: true}).passed, true);
  write('.next/static/chunks/app.js', 'const rows=[["00-10-01","Pre-Construction & Fees","Drafter"]];');
  const rawBook = scanCabinetClientBoundary({root, requireBuild: true});
  assert.equal(rawBook.passed, false); assert.ok(rawBook.production.leaks.some(item => item.marker === 'private-book-first-row'));
  write('.next/static/chunks/app.js', 'const finance={annualOverhead:42e4};');
  assert.ok(scanCabinetClientBoundary({root}).production.leaks.some(item => item.marker === 'private-finance-default'));
}));

test('source maps and rendered public HTML are scanned without reporting private byte snippets', () => fixture(({root, write}) => {
  write('.next/BUILD_ID', 'fixture-build'); write('.next/static/app.js', 'console.log("public")');
  write('.next/static/app.js.map', JSON.stringify({sources: ['private.ts'], sourcesContent: ['export const note="Third-party market rate (cost to you if subcontracted)";']}));
  write('captured/index.html', '<script>const source="P5 Cost Database 2026.xlsx"</script>');
  const result = scanCabinetClientBoundary({root, requireBuild: true, htmlDir: path.join(root, 'captured'), requireHtml: true});
  assert.equal(result.passed, false);
  assert.ok(result.production.leaks.some(item => item.marker === 'private-book-note'));
  assert.deepEqual(result.publicHtml.leaks, [{file: 'index.html', marker: 'cost-book-source'}]);
  assert.ok(result.publicHtml.leaks.every(item => Object.keys(item).sort().join(',') === 'file,marker'));
}));
