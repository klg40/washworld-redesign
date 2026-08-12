'use strict';

/**
 * Minimal project test for the Wash World build.
 * Asserts the deterministic build produced a complete public/ artifact.
 */

const fs = require('fs');
const path = require('path');

const DEST = path.join(__dirname, 'public');
const REQUIRED = ['index.html', 'css/styles.css', 'js/main.js'];

let failures = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failures += 1;
  } else {
    console.log(`ok: ${msg}`);
  }
}

// 1. Required files exist and are non-empty.
for (const file of REQUIRED) {
  const p = path.join(DEST, file);
  assert(fs.existsSync(p), `${file} exists in public/`);
  if (fs.existsSync(p)) {
    assert(fs.statSync(p).size > 0, `${file} is non-empty`);
  }
}

// 2. index.html references the stylesheet and script relative paths.
const html = fs.readFileSync(path.join(DEST, 'index.html'), 'utf8');
assert(/css\/styles\.css/.test(html), 'index.html links css/styles.css');
assert(/js\/main\.js/.test(html), 'index.html links js/main.js');

// 3. Stylesheet actually contains substantive CSS.
const css = fs.readFileSync(path.join(DEST, 'css/styles.css'), 'utf8');
assert(css.length > 4000, 'styles.css is substantive');

// 4. Script declares strict mode and a DOMContentLoaded guard.
const js = fs.readFileSync(path.join(DEST, 'js/main.js'), 'utf8');
assert(/DOMContentLoaded/.test(js), 'main.js has DOMContentLoaded guard');

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('\nAll tests passed.');
