import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from 'esbuild';

const root = path.resolve('src/website-intelligence');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(root).filter((f) => /\.tsx?$/.test(f));
let ok = 0;

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const loader = file.endsWith('.tsx') ? 'tsx' : 'ts';
  const result = transformSync(code, {
    loader,
    jsx: 'automatic',
    format: 'esm',
    target: 'esnext',
    tsconfigRaw: { compilerOptions: { jsx: 'react-jsx' } },
  });

  const dest = file.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js');
  let out = result.code;
  out = out.replace(/(from\s+['"][^'"]+)\.tsx(['"])/g, '$1.jsx$2');
  out = out.replace(/(from\s+['"][^'"]+)\.ts(['"])/g, '$1.js$2');
  out = out.replace(/(import\s+['"][^'"]+)\.tsx(['"])/g, '$1.jsx$2');
  out = out.replace(/(import\s+['"][^'"]+)\.ts(['"])/g, '$1.js$2');

  fs.writeFileSync(dest, out);
  fs.unlinkSync(file);
  ok += 1;
}

console.log(`converted ${ok} files`);
console.log(
  `remaining ts/tsx: ${walk(root).filter((f) => /\.tsx?$/.test(f)).length}`,
);
