/**
 * build.js
 * Assembles the static `public/` output directory.
 * Ensures public/index.html, public/css/styles.css and public/js/main.js exist
 * for the main (Wash World) welcome page, and pulls the pizzeria redesign
 * (new + archived old version) into public/pizzeria/.
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
  { from: "js/main.js", to: "js/main.js" },
  { from: "pizzeria/index.html", to: "pizzeria/index.html" },
  { from: "pizzeria/css/styles.css", to: "pizzeria/css/styles.css" },
  { from: "pizzeria/js/main.js", to: "pizzeria/js/main.js" },
  { from: "pizzeria/old/index.html", to: "pizzeria/old/index.html" },
  { from: "pizzeria/old/css/styles.css", to: "pizzeria/old/css/styles.css" }
];

function copyFile(rel) {
  var src = path.join(ROOT, rel.from);
  var dst = path.join(PUBLIC, rel.to);
  var dstDir = path.dirname(dst);
  fs.mkdirSync(dstDir, { recursive: true });
  fs.copyFileSync(src, dst);
  return dst;
}

function main() {
  FILES.forEach(function (file) {
    var out = copyFile(file);
    console.log("built " + path.relative(ROOT, out));
  });
  console.log(
    "public/ ready: index.html, css/styles.css, js/main.js + public/pizzeria/"
  );
}

main();
