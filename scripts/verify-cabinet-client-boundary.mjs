import {readFileSync, readdirSync, existsSync, realpathSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const CLIENT_TREES = ['app', 'components', 'hooks', 'lib', 'pages', 'server', 'shared', 'src'];
const DEFAULT_PRIVATE_FILES = [
  'lib/p5/priceBookData.ts', 'lib/p5/priceBook.ts', 'lib/p5/pricing.ts',
  'lib/p5/costBook.ts', 'lib/p5/planningBooks.ts', 'server/estimateEngine.ts',
];
// Exact private book/policy signatures. Ordinary customer prose about costs,
// margins, or estimates is deliberately not a match.
export const PRIVATE_MARKERS = [
  {id: 'cost-book-source', pattern: /P5 Cost Database 2026\.xlsx/},
  {id: 'private-book-note', pattern: /Third-party market rate \(cost to you if subcontracted\)/},
  {id: 'private-book-first-row', pattern: /["']00-10-01["']\s*,\s*["']Pre-Construction & Fees["']/},
  {id: 'private-finance-approval', pattern: /Jared Brost: unified overhead instruction, September 10, 2026/},
  {id: 'private-finance-default', pattern: /annualOverhead["']?\s*:\s*(?:420000|42e4|4\.2e5)\b/i},
  {id: 'raw-book-source-path', pattern: /(?:^|[\/\\])priceBookData\.[cm]?[jt]s\b/},
];

const relative = (root, file) => path.relative(root, file).split(path.sep).join('/');

function filesBelow(dir, predicate) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    if (entry.isSymbolicLink() || ['node_modules', '.git', '.next'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesBelow(file, predicate));
    else if (entry.isFile() && predicate(file)) out.push(file);
  }
  return out;
}

function compilerOptions(root) {
  const config = path.join(root, 'tsconfig.json');
  if (!existsSync(config)) return {allowJs: true, moduleResolution: ts.ModuleResolutionKind.NodeJs};
  const raw = ts.readConfigFile(config, ts.sys.readFile);
  if (raw.error) throw new Error('Cannot read TypeScript configuration');
  return {...ts.parseJsonConfigFileContent(raw.config, ts.sys, root).options, allowJs: true};
}

function runtimeSpecifiers(ast) {
  const values = [];
  const opaque = [];
  for (const node of ast.statements) {
    if (!(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) ||
        !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    if (node.isTypeOnly || (ts.isImportDeclaration(node) && node.importClause?.isTypeOnly)) continue;
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      if (clause && !clause.name && clause.namedBindings && ts.isNamedImports(clause.namedBindings) &&
          clause.namedBindings.elements.length && clause.namedBindings.elements.every(item => item.isTypeOnly)) continue;
    } else if (node.exportClause && ts.isNamedExports(node.exportClause) &&
               node.exportClause.elements.length && node.exportClause.elements.every(item => item.isTypeOnly)) continue;
    values.push(node.moduleSpecifier.text);
  }
  const visit = node => {
    if (ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
         (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      if (node.arguments.length && ts.isStringLiteral(node.arguments[0])) values.push(node.arguments[0].text);
      else opaque.push(node.expression.kind === ts.SyntaxKind.ImportKeyword ? 'dynamic import' : 'dynamic require');
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return {specifiers: [...new Set(values)], opaque: [...new Set(opaque)]};
}

function explicitlyGuardsBrowser(ast) {
  if (ast.statements.some(node => ts.isImportDeclaration(node) && !node.importClause &&
      ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === 'server-only')) {
    return {passed: true, method: 'server-only import'};
  }
  for (const node of ast.statements) {
    if (!ts.isIfStatement(node)) continue;
    const expression = node.expression.getText(ast).replace(/\s/g, '');
    if (!/^typeofwindow!==["']undefined["']$/.test(expression) &&
        !/^["']undefined["']!==typeofwindow$/.test(expression)) continue;
    const statements = ts.isBlock(node.thenStatement) ? node.thenStatement.statements : [node.thenStatement];
    if (statements.some(item => ts.isThrowStatement(item))) return {passed: true, method: 'top-level browser throw'};
  }
  return {passed: false, method: null};
}

function inspectAsset(file, label) {
  const raw = readFileSync(file, 'utf8');
  const texts = [raw, raw.replace(/\\+(["'])/g, '$1')];
  if (file.endsWith('.map')) {
    try {
      const map = JSON.parse(raw);
      if (Array.isArray(map.sourcesContent)) texts.push(...map.sourcesContent.filter(item => typeof item === 'string'));
    } catch { return [{file: label, marker: 'invalid-source-map'}]; }
  }
  return PRIVATE_MARKERS.filter(marker => texts.some(text => marker.pattern.test(text)))
    .map(marker => ({file: label, marker: marker.id}));
}

/** Read-only source and output inspection. No builds, network, or module execution. */
export function scanCabinetClientBoundary(options = {}) {
  const root = realpathSync(options.root ?? process.cwd());
  const buildDir = path.resolve(options.buildDir ?? path.join(root, '.next'));
  const htmlDir = options.htmlDir ? path.resolve(options.htmlDir) : null;
  const privateFiles = new Set([...DEFAULT_PRIVATE_FILES, ...(options.privateFiles ?? [])].map(file => path.resolve(root, file)));
  const programFiles = CLIENT_TREES.flatMap(dir => filesBelow(path.join(root, dir), file => /\.[cm]?[jt]sx?$/.test(file)));
  const cached = new Map();
  const parseErrors = [];
  const typeOptions = compilerOptions(root);
  const load = file => {
    if (cached.has(file)) return cached.get(file);
    const source = readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    if (ast.parseDiagnostics.length) parseErrors.push({file: relative(root, file), errors: ast.parseDiagnostics.length});
    const dependencies = [];
    const runtime = runtimeSpecifiers(ast);
    const unresolved = [];
    for (const specifier of runtime.specifiers) {
      const result = ts.resolveModuleName(specifier, file, typeOptions, ts.sys).resolvedModule;
      if (!result) {
        const asset = specifier.startsWith('@/') ? path.resolve(root, specifier.slice(2))
          : specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : null;
        if (asset && /\.(?:css|scss|sass|less|svg|png|webp|jpe?g|avif|gif|woff2?|ttf|otf)$/.test(asset) &&
            !relative(root, asset).startsWith('../') && existsSync(asset)) continue;
        if (specifier.startsWith('.') || specifier.startsWith('@/') || specifier.startsWith('@shared/')) unresolved.push(specifier);
        continue;
      }
      if (result.isExternalLibraryImport || result.resolvedFileName.endsWith('.d.ts')) continue;
      const resolved = path.resolve(result.resolvedFileName);
      if (relative(root, resolved).startsWith('../') || resolved.includes(`${path.sep}node_modules${path.sep}`)) continue;
      if (/\.[cm]?[jt]sx?$/.test(resolved) && existsSync(resolved)) dependencies.push(resolved);
    }
    const item = {source, ast, dependencies, opaque: runtime.opaque, unresolved};
    cached.set(file, item);
    return item;
  };
  const clients = programFiles.filter(file => {
    const ast = load(file).ast;
    return ast.statements.some(node => ts.isExpressionStatement(node) &&
      ts.isStringLiteral(node.expression) && node.expression.text === 'use client');
  });
  const exposedPaths = [];
  const incompleteEdges = new Map();
  for (const client of clients) {
    const pending = [[client]], seen = new Set();
    while (pending.length) {
      const chain = pending.shift(), current = chain.at(-1);
      if (seen.has(current)) continue;
      seen.add(current);
      if (privateFiles.has(current)) { exposedPaths.push(chain.map(file => relative(root, file))); break; }
      const module = load(current);
      if (module.opaque.length || module.unresolved.length) incompleteEdges.set(current,
        {file: relative(root, current), opaque: module.opaque, unresolved: module.unresolved});
      for (const dependency of module.dependencies) pending.push([...chain, dependency]);
    }
  }
  const guardFile = path.join(root, 'server/estimateEngine.ts');
  const serverGuard = existsSync(guardFile)
    ? explicitlyGuardsBrowser(load(guardFile).ast)
    : {passed: false, method: null, reason: 'server entry is missing'};
  const staticDir = path.join(buildDir, 'static');
  const assets = options.sourceOnly ? [] : filesBelow(staticDir, file => /\.(?:js|mjs|map)$/.test(file));
  const assetLeaks = assets.flatMap(file => inspectAsset(file, relative(buildDir, file)));
  const productionBuild = existsSync(path.join(buildDir, 'BUILD_ID')) && assets.length > 0;
  const htmlFiles = htmlDir && !options.sourceOnly ? filesBelow(htmlDir, file => /\.(?:html|rsc|txt|json)$/.test(file)) : [];
  const htmlLeaks = htmlFiles.flatMap(file => inspectAsset(file, relative(htmlDir, file)));
  const sourcePassed = exposedPaths.length === 0 && parseErrors.length === 0 && incompleteEdges.size === 0 && serverGuard.passed;
  const productionPassed = productionBuild && assetLeaks.length === 0;
  const htmlPassed = htmlFiles.length > 0 && htmlLeaks.length === 0;
  return {
    root, buildDir, htmlDir,
    passed: sourcePassed && (!options.requireBuild || productionPassed) && (!options.requireHtml || htmlPassed) &&
      assetLeaks.length === 0 && htmlLeaks.length === 0,
    source: {passed: sourcePassed, clientRoots: clients.length, visitedModules: cached.size, exposedPaths,
      incompleteEdges: [...incompleteEdges.values()], parseErrors, serverGuard},
    production: {status: productionBuild ? (assetLeaks.length ? 'FAIL' : 'PASS') : 'NOT_RUN', files: assets.length, leaks: assetLeaks},
    publicHtml: {status: htmlFiles.length ? (htmlLeaks.length ? 'FAIL' : 'PASS') : 'NOT_RUN', files: htmlFiles.length, leaks: htmlLeaks},
    limitations: ['Import graph is conservative; production bytes and public response allowlists require separate evidence.',
      'Only exact private markers are scanned; a clean text scan alone is not a privacy proof.',
      'The release coordinator must match the scanned production build to the exact reviewed source revision.'],
  };
}

function argumentsFor(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--require-build') options.requireBuild = true;
    else if (argument === '--require-html') options.requireHtml = true;
    else if (argument === '--source-only') options.sourceOnly = true;
    else if (['--root', '--build-dir', '--html-dir', '--output', '--private-file'].includes(argument)) {
      const value = argv[++index];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}`);
      if (argument === '--private-file') (options.privateFiles ??= []).push(value);
      else options[{'--root': 'root', '--build-dir': 'buildDir', '--html-dir': 'htmlDir', '--output': 'output'}[argument]] = value;
    } else throw new Error(`Unknown option ${argument}`);
  }
  return options;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const options = argumentsFor(process.argv.slice(2));
    const report = scanCabinetClientBoundary(options);
    const output = path.resolve(options.output ?? '/workspace/p5-integration/cabinet-client-boundary.json');
    mkdirSync(path.dirname(output), {recursive: true});
    writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({passed: report.passed, clients: report.source.clientRoots,
      exposed: report.source.exposedPaths.length, production: report.production.status, html: report.publicHtml.status, output}));
    process.exitCode = report.passed ? 0 : 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Boundary verification failed');
    process.exitCode = 1;
  }
}
