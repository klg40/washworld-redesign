/* ==========================================================================
   Wash World — main.js
   Lightweight interactions for the static marketing site.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initBookButtons();
    initHeaderScroll();
    initFooterYear();
  });

  /** Mobile navigation toggle. */
  function initNavToggle() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /** All "Book" buttons reveal a friendly confirmation banner. */
  function initBookButtons() {
    var buttons = document.querySelectorAll("[data-book]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        var label = getLabel(btn);
        showToast("Thanks! Our team will reach out about \u201c" + label + "\u201d shortly.");
      });
    });
  }

  /** Add a subtle elevated style once the header is scrolled. */
  function initHeaderScroll() {
    var header = document.getElementById("site-header");
    if (!header) return;
    var onScroll = function () {
      header.style.boxShadow = window.scrollY > 10 ? "0 4px 16px rgba(2,6,23,0.10)" : "none";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /** Populate the footer year, if a .js-year element exists. */
  function initFooterYear() {
    var el = document.querySelector(".js-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /** Read a sensible label from the clicked button or its card context. */
  function getLabel(btn) {
    var text = (btn.textContent || "").trim();
    if (text) return text;
    var card = btn.closest(".price-card, .card");
    if (card) {
      var heading = card.querySelector("h3");
      if (heading) return heading.textContent.trim();
    }
    return "your appointment";
  }

  /** Minimal non-blocking toast. */
  function showToast(message) {
    var existing = document.getElementById("toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.id = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;
    toast.style.cssText =
      "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);" +
      "background:#0f172a;color:#fff;padding:14px 22px;border-radius:999px;" +
      "font-family:Inter,system-ui,sans-serif;font-size:0.9rem;z-index:100;" +
      "box-shadow:0 10px 24px rgba(2,6,23,0.3);transition:opacity .3s ease;max-width:90vw;";

    document.body.appendChild(toast);

    window.setTimeout(function () {
      toast.style.opacity = "0";
      window.setTimeout(function () { toast.remove(); }, 300);
    }, 3200);
  }
})();
