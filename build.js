'use strict';

/**
 * Deterministic build for the Wash World site.
 *
 * - Copies every static asset from the repository root into a single `public/`
 *   directory (the deployable artifact for Vercel).
 * - Validates that the minimum required files are present and that referenced
 *   assets resolve.
 *
 * Usage:
 *   node build.js     # produce public/ and validate the artifact
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = ROOT;
const DEST = path.join(ROOT, 'public');

// Files that should always be part of the deployable artifact, in copy order.
const REQUIRED_FILES = [
  'index.html',
  'css/styles.css',
  'js/main.js',
];

// Only these files are copied into public/ (allowlist) so the build stays
// deterministic and never leaks workspace-only files into the artifact.
const COPY_FILES = REQUIRED_FILES.concat(['README.md']);

function copyFile(srcRel) {
  const from = path.join(SRC, srcRel);
  const to = path.join(DEST, srcRel);
  if (!fs.existsSync(from)) {
    throw new Error(`Missing source asset: ${srcRel}`);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function clean(dest) {
  fs.rmSync(dest, { recursive: true, force: true });
}

function build() {
  clean(DEST);
  for (const file of COPY_FILES) {
    copyFile(file);
  }
}

/**
 * Decide whether a reference points to a resource that must exist inside the
 * artifact. Returns false for external URLs, scheme-based links, fragment-only
 * links, and data URIs.
 */
function isInternalAsset(rawRef) {
  if (/^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(rawRef)) return false;
  if (typeof rawRef === 'string' && rawRef.startsWith('//')) return false;
  return true;
}

// Validate the produced artifact by resolving asset references in index.html.
function validatePublic() {
  const htmlPath = path.join(DEST, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const refs = new Set();
  const hrefRe = /(?:href|src)="([^"]*)"/g;
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    const raw = m[1];
    if (!isInternalAsset(raw)) continue;
    // Strip hash/fragment and query from a relative asset path.
    const ref = raw.split('#')[0].split('?')[0];
    if (!ref) continue;
    refs.add(ref);
  }
  const missing = [];
  for (const ref of refs) {
    const resolved = path.join(DEST, ref);
    if (!fs.existsSync(resolved)) {
      missing.push(ref);
    }
  }
  if (missing.length) {
    throw new Error(`Artifact validation failed, unresolved references: ${missing.join(', ')}`);
  }
  // Ensure the three minimum files exist.
  for (const file of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(DEST, file))) {
      throw new Error(`Artifact validation failed, missing required file: ${file}`);
    }
  }
}

try {
  build();
  validatePublic();
  console.log('Build OK. Artifact written to public/');
  for (const f of REQUIRED_FILES) {
    const size = fs.statSync(path.join(DEST, f)).size;
    console.log(`  - ${f} (${size} bytes)`);
  }
} catch (err) {
  console.error(`Build failed: ${err.message}`);
  process.exit(1);
}
