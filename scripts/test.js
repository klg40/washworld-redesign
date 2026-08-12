/**
 * test.js
 * Verifies the required public/ deliverables are present and validates the
 * static sites (main Wash World page + pizzeria redesign and its archived
 * "old" version):
 *   - required files exist and are non-empty
 *   - every in-page fragment link (href="#...") has a matching id target
 *   - the booking / order flow markup is present and wired for the JS
 */

"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var REQUIRED = [
  "public/index.html",
  "public/css/styles.css",
  "public/js/main.js",
  "public/pizzeria/index.html",
  "public/pizzeria/css/styles.css",
  "public/pizzeria/js/main.js",
  "public/pizzeria/old/index.html",
  "public/pizzeria/old/css/styles.css"
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

// --- Generic fragment link / section target check --------------------------
function checkFragments(htmlPath) {
  var html = fs.readFileSync(htmlPath, "utf8");

  var idRegex = /id="([^"]+)"/g;
  var ids = new Set();
  var m;
  while ((m = idRegex.exec(html)) !== null) ids.add(m[1]);

  var fragmentRegex = /href="#([^"]+)"/g;
  var fragments = new Set();
  while ((m = fragmentRegex.exec(html)) !== null) fragments.add(m[1]);

  ok(htmlPath + ": " + fragments.size + " fragment link(s) found");

  var broken = [];
  fragments.forEach(function (frag) {
    if (!ids.has(frag)) broken.push("#" + frag);
  });
  if (broken.length) {
    fail(htmlPath + " fragment links with no target: " + broken.join(", "));
  } else {
    ok(htmlPath + ": all fragment links have matching targets");
  }
}

// --- Main site section targets ---------------------------------------------
var mainHtmlPath = path.join(ROOT, "public/index.html");
checkFragments(mainHtmlPath);
var mainHtml = fs.readFileSync(mainHtmlPath, "utf8");
["services", "pricing", "about", "testimonials", "contact", "home"].forEach(
  function (target) {
    if (mainHtml.indexOf('id="' + target + '"') !== -1) {
      ok("main: section target #" + target + " exists");
    } else {
      fail("main: section target #" + target + " is missing");
    }
  }
);

// --- Pizzeria fragment targets ----------------------------------------------
var pizzaHtmlPath = path.join(ROOT, "public/pizzeria/index.html");
checkFragments(pizzaHtmlPath);
var pizzaHtml = fs.readFileSync(pizzaHtmlPath, "utf8");
["menu", "about", "offers", "reviews", "contact", "home"].forEach(
  function (target) {
    if (pizzaHtml.indexOf('id="' + target + '"') !== -1) {
      ok("pizzeria: section target #" + target + " exists");
    } else {
      fail("pizzeria: section target #" + target + " is missing");
    }
  }
);

// --- Booking flow markup (main) ---------------------------------------------
function has(html, pattern, label) {
  if (pattern.test(html)) ok(label);
  else fail(label);
}

has(mainHtml, /data-book/g, "main: one or more data-book trigger buttons present");
has(mainHtml, /id="booking-dialog"/, "main: booking dialog element present");
has(mainHtml, /id="bk-name"/, "main: name field present");
has(mainHtml, /id="bk-contact"/, "main: contact field present");
has(mainHtml, /id="bk-service"/, "main: service select present");
has(mainHtml, /id="bk-date"/, "main: date field present");
has(mainHtml, /not a confirmed booking/, "main: dialog states it is not a confirmed booking");

// --- Order flow markup (pizzeria) -------------------------------------------
has(pizzaHtml, /data-order/g, "pizzeria: one or more data-order trigger buttons present");
has(pizzaHtml, /id="order-dialog"/, "pizzeria: order dialog element present");
has(pizzaHtml, /<dialog/, "pizzeria: native <dialog> element used");
has(pizzaHtml, /id="or-name"/, "pizzeria: name field present");
has(pizzaHtml, /id="or-contact"/, "pizzeria: contact field present");
has(pizzaHtml, /id="or-dish"/, "pizzeria: dish select present");
has(pizzaHtml, /id="or-date"/, "pizzeria: date field present");
has(pizzaHtml, /id="order-form"/, "pizzeria: order form present");
has(pizzaHtml, /id="order-copy"/, "pizzeria: copy button present");
has(pizzaHtml, /id="order-error"/, "pizzeria: validation error region present");
has(pizzaHtml, /ЧЕРНОВИК|черновик/, "pizzeria: copy explicitly marks output as a DRAFT");
has(pizzaHtml, /не подтверждённый заказ/, "pizzeria: states it is not a confirmed order");
has(pizzaHtml, /data-dish=/, "pizzeria: menu buttons pre-select a dish");

// --- Order flow is handled in pizzeria main.js --------------------------------
var pizzaJs = fs.readFileSync(path.join(ROOT, "public/pizzeria/js/main.js"), "utf8");
if (/buildCalendarEvent/.test(pizzaJs)) ok("pizzeria: calendar (.ics) draft builder present in main.js");
else fail("pizzeria: calendar (.ics) draft builder present in main.js");
if (/copyRequestText/.test(pizzaJs)) ok("pizzeria: copy-to-clipboard draft action present in main.js");
else fail("pizzeria: copy-to-clipboard draft action present in main.js");
if (/Escape/.test(pizzaJs)) ok("pizzeria: Escape key handler present in main.js");
else fail("pizzeria: Escape key handler present in main.js");

// --- Old pizzeria archive page is present ------------------------------------
var oldHtml = fs.readFileSync(path.join(ROOT, "public/pizzeria/old/index.html"), "utf8");
has(oldHtml, /2008|старая версия|старинных/i, "pizzeria: archived old-design version present");

if (failures) {
  console.error("test failed with " + failures + " problem(s)");
  process.exit(1);
} else {
  console.log("all checks passed");
}
