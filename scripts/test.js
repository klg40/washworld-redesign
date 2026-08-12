/**
 * test.js
 * Verifies the required public/ deliverables are present and non-empty:
 *   public/index.html, public/css/styles.css, public/js/main.js
 */

"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var REQUIRED = [
  "public/index.html",
  "public/css/styles.css",
  "public/js/main.js"
];

var failures = 0;

REQUIRED.forEach(function (rel) {
  var full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error("MISSING " + rel);
    failures++;
    return;
  }
  var stat = fs.statSync(full);
  if (stat.size === 0) {
    console.error("EMPTY " + rel);
    failures++;
    return;
  }
  console.log("ok " + rel + " (" + stat.size + " bytes)");
});

if (failures > 0) {
  console.error("test failed with " + failures + " problem(s)");
  process.exit(1);
} else {
  console.log("all required deliverable(s) present");
}
