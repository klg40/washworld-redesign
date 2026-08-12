'use strict';

/* Deterministic static check:
   - index.html must link css/styles.css
   - index.html must load js/main.js
   - every element id referenced by js/main.js must exist in index.html   */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');

const errors = [];

if (!/href="css\/styles\.css"/.test(html)) {
  errors.push('index.html does not link css/styles.css');
}
if (!/src="js\/main\.js"/.test(html)) {
  errors.push('index.html does not load js/main.js');
}
if (!/href="css\/styles\.css"/.test(html)) {
  errors.push('css/styles.css is not referenced');
}

if (!/<link rel="stylesheet" href="css\/styles\.css" \/>/.test(html)) {
  errors.push('stylesheet link tag malformed');
}
if (!/<script src="js\/main\.js"><\/script>/.test(html)) {
  errors.push('script tag malformed');
}
if (!/<\/body>\s*<\/html>\s*$/.test(html)) {
  errors.push('index.html is missing closing </body></html>');
}

/* Collect ids referenced by js/main.js getElementById calls */
const referencedIds = new Set();
let m;
const idRe = /getElementById\('([^']+)'\)/g;
while ((m = idRe.exec(js)) !== null) {
  referencedIds.add(m[1]);
}

const idRe2 = /\.getElementById\('([^']+)'\)/g;
while ((m = idRe2.exec(js)) !== null) {
  referencedIds.add(m[1]);
}

referencedIds.forEach((id) => {
  const re = new RegExp('id="' + id + '"');
  if (!re.test(html)) {
    errors.push('js references missing element id: ' + id);
  }
});

/* Ensure the JS classes used by the CSS exist as selectors */
const jsClassRefs = ['scrolled', 'open'];
jsClassRefs.forEach((cls) => {
  if (!new RegExp('\\.' + cls + '\\b').test(css)) {
    errors.push('css may be missing .' + cls);
  }
});

if (errors.length > 0) {
  console.error('ASSET CHECK FAILED:');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

console.log('ASSET CHECK PASSED: stylesheet + script wired, all JS-referenced ids present, HTML well-formed.');
