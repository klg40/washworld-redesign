/**
 * test.js
 * Verifies the required public/ deliverables are present and validates the
 * static site:
 *   - required files exist and are non-empty
 *   - every in-page fragment link (href="#...") has a matching id target
 *   - the booking flow markup is present and wired for the JS in main.js
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

function fail(msg) {
  console.error("FAIL: " + msg);
  failures++;
}
function ok(msg) {
  console.log("ok: " + msg);
}

// --- Required deliverables ------------------------------------------------
REQUIRED.forEach(function (rel) {
  var full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    fail(rel + " is missing");
    return;
  }
  var stat = fs.statSync(full);
  if (stat.size === 0) {
    fail(rel + " is empty");
    return;
  }
  ok(rel + " present (" + stat.size + " bytes)");
});

// --- Fragment link / section target check ----------------------------------
var htmlPath = path.join(ROOT, "public/index.html");
var html = fs.readFileSync(htmlPath, "utf8");

var idRegex = /id="([^"]+)"/g;
var ids = new Set();
var m;
while ((m = idRegex.exec(html)) !== null) ids.add(m[1]);

var fragmentRegex = /href="#([^"]+)"/g;
var fragments = new Set();
while ((m = fragmentRegex.exec(html)) !== null) fragments.add(m[1]);

ok(fragments.size + " fragment link(s) found");
["services", "pricing", "about", "testimonials", "contact", "home"].forEach(function (target) {
  if (ids.has(target)) ok("section target #" + target + " exists");
  else fail("section target #" + target + " is missing");
});

var broken = [];
fragments.forEach(function (frag) {
  if (!ids.has(frag)) broken.push("#" + frag);
});
if (broken.length) {
  fail("fragment links with no target: " + broken.join(", "));
} else {
  ok("all fragment links have matching targets");
}

// --- Booking flow markup ----------------------------------------------------
function has(pattern, label) {
  if (pattern.test(html)) ok(label);
  else fail(label);
}

has(/data-book/g, "one or more data-book trigger buttons present");
has(/id="booking-dialog"/, "booking dialog element present");
has(/<dialog/, "native <dialog> element used");
has(/id="bk-name"/, "name field present");
has(/id="bk-contact"/, "contact field present");
has(/id="bk-service"/, "service select present");
has(/id="bk-date"/, "date field present");
has(/id="booking-form"/, "booking form present");
has(/id="booking-close"/, "close button present");
has(/id="booking-copy"/, "copy button present");
has(/id="booking-error"/, "validation error region present");
has(/DRAFT|draft/, "dialog copy explicitly marks output as a DRAFT");
has(/not a confirmed booking/, "dialog explicitly states it is not a confirmed booking");
has(/data-service=/, "pricing buttons pre-select a service");

// --- Booking flow is handled in main.js -------------------------------------
var jsPath = path.join(ROOT, "public/js/main.js");
var js = fs.readFileSync(jsPath, "utf8");
if (/\bbuildCalendarEvent\b/.test(js)) ok("calendar (.ics) draft builder present in main.js");
else fail("calendar (.ics) draft builder present in main.js");
if (/\bcopyRequestText\b/.test(js)) ok("copy-to-clipboard draft action present in main.js");
else fail("copy-to-clipboard draft action present in main.js");
if (/Escape/.test(js)) ok("Escape key handler present in main.js");
else fail("Escape key handler present in main.js");

if (failures) {
  console.error("test failed with " + failures + " problem(s)");
  process.exit(1);
} else {
  console.log("all checks passed");
}
