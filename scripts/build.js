/**
 * build.js
 * Assembles the static `public/` output directory.
 * Ensures public/index.html, public/css/styles.css and public/js/main.js exist
 * so the site can be served with a zero-config static host.
 */

"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var PUBLIC = path.join(ROOT, "public");

// Source -> destination (relative to ROOT / PUBLIC).
var FILES = [
  { from: "index.html", to: "index.html" },
  { from: "css/styles.css", to: "css/styles.css" },
  { from: "js/main.js", to: "js/main.js" }
];

function copyFile(rel) {
  var src = path.join(PUBLIC, rel.from);
  var dstDir = path.dirname(path.join(PUBLIC, rel.to));
  fs.mkdirSync(dstDir, { recursive: true });
  fs.copyFileSync(path.join(ROOT, rel.from), src);
  return src;
}

function main() {
  FILES.forEach(function (file) {
    var out = copyFile(file);
    console.log("built " + path.relative(ROOT, out));
  });
  console.log("public/ ready: index.html, css/styles.css, js/main.js");
}

main();
