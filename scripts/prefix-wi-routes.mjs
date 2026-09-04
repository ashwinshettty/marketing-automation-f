import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/website-intelligence');
const BASE = '/website-intelligence';

const ROUTE_SEGMENTS = [
  'analyze',
  'opportunities',
  'capabilities',
  'evidence',
  'websites',
  'emails',
  'reports',
  'catalog',
  'pages',
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(jsx?|js)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function rewrite(code, file) {
  // Skip API client absolute /api and /health paths
  if (file.endsWith(`${path.sep}api${path.sep}client.js`)) return code;

  let out = code;

  for (const seg of ROUTE_SEGMENTS) {
    const re = new RegExp(`([\`'"{(\\/])\\/${seg}(?=[\/\`'"?})])`, 'g');
    out = out.replace(re, `$1${BASE}/${seg}`);
  }

  // Root dashboard navigations / links (avoid #anchors and protocol)
  out = out.replace(/to=["']\/["']/g, `to="${BASE}"`);
  out = out.replace(/navigate\(\s*['"]\/['"]\s*\)/g, `navigate('${BASE}')`);
  out = out.replace(
    /navigate\(\s*['"]\/['"]\s*,\s*\{\s*replace:\s*true/g,
    `navigate('${BASE}', { replace: true`,
  );
  out = out.replace(/to:\s*['"]\/['"]/g, `to: '${BASE}'`);
  out = out.replace(
    /Navigate to=["']\/website-intelligence\/catalog\//g,
    `Navigate to="${BASE}/catalog/`,
  );
  out = out.replace(/Navigate to=["']\/catalog\//g, `Navigate to="${BASE}/catalog/`);

  // Fix accidental double-prefix
  out = out.replaceAll(`${BASE}${BASE}`, BASE);

  return out;
}

let changed = 0;
for (const file of walk(root)) {
  const before = fs.readFileSync(file, 'utf8');
  const after = rewrite(before, file);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}

console.log(`rewrote paths in ${changed} files`);
