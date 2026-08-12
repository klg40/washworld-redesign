/* ==========================================================================
   Wash World — main.js
   Lightweight interactions for the static marketing site.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initBooking();
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

  /**
   * Booking dialog:
   *  - data-book buttons open the modal
   *  - form collects name, contact, service, date with validation
   *  - Escape / close buttons dismiss with focus restored to the opener
   *  - honest local output only: download an .ics calendar draft and/or
   *    copy the filled request text. Explicitly labelled a DRAFT — nothing is
   *    sent to any backend (there is no configured recipient).
   */
  function initBooking() {
    var dialog = document.getElementById("booking-dialog");
    var form = document.getElementById("booking-form");
    var closeBtn = document.getElementById("booking-close");
    var closeSecondary = document.getElementById("booking-close-secondary");
    var copyBtn = document.getElementById("booking-copy");
    var openers = document.querySelectorAll("[data-book]");
    var lastFocus = null;

    if (!dialog || !form) return;

    openers.forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        lastFocus = btn;
        openDialog(btn);
      });
    });

    function openDialog(opener) {
      form.reset();
      hideError();

      var serviceInput = document.getElementById("bk-service");
      var service = opener && opener.getAttribute("data-service");
      if (service && serviceInput) {
        serviceInput.value = service;
      }

      var minDate = new Date();
      minDate.setDate(minDate.getDate() + 1);
      var dateInput = document.getElementById("bk-date");
      if (dateInput) dateInput.min = toDateValue(minDate);

      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      dialog.setAttribute("aria-hidden", "false");
      focusFirst(dialog);
    }

    function closeDialog() {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
      dialog.setAttribute("aria-hidden", "true");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
      lastFocus = null;
    }

    if (closeBtn) closeBtn.addEventListener("click", closeDialog);
    if (closeSecondary) closeSecondary.addEventListener("click", closeDialog);

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeDialog();
    });

    dialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
      }
      if (event.key === "Tab") trapFocus(event, dialog);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validateForm()) return;
      buildAndDownloadRequest();
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (!validateForm()) return;
        copyRequestText();
      });
    }

    function validateForm() {
      var name = document.getElementById("bk-name");
      var contact = document.getElementById("bk-contact");
      var service = document.getElementById("bk-service");
      var date = document.getElementById("bk-date");
      var firstInvalid = null;

      if (!name.value.trim()) {
        markInvalid(name);
        firstInvalid = firstInvalid || name;
      } else {
        markValid(name);
      }

      if (!isContactValid(contact.value.trim())) {
        markInvalid(contact);
        firstInvalid = firstInvalid || contact;
      } else {
        markValid(contact);
      }

      if (!service.value) {
        markInvalid(service);
        firstInvalid = firstInvalid || service;
      } else {
        markValid(service);
      }

      if (!date.value || !isValidDate(date.value)) {
        markInvalid(date);
        firstInvalid = firstInvalid || date;
      } else {
        markValid(date);
      }

      if (firstInvalid) {
        showError("Please complete the highlighted fields.");
        firstInvalid.focus();
        return false;
      }
      hideError();
      return true;
    }

    function collectRequest() {
      return {
        name: document.getElementById("bk-name").value.trim(),
        contact: document.getElementById("bk-contact").value.trim(),
        service: document.getElementById("bk-service").value,
        date: document.getElementById("bk-date").value
      };
    }

    function formatDraft(req) {
      return [
        "WASH WORLD — BOOKING DRAFT (not a confirmed appointment)",
        "This is a local draft. Nothing was sent to Wash World.",
        "",
        "Name: " + req.name,
        "Contact: " + req.contact,
        "Service: " + req.service,
        "Preferred date: " + req.date
      ].join("\n");
    }

    function buildAndDownloadRequest() {
      var req = collectRequest();
      var ics = buildCalendarEvent(req);
      var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "washworld-booking-draft.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Calendar draft (.ics) downloaded — your request is not confirmed yet.");
      closeDialog();
    }

    function buildCalendarEvent(req) {
      var pad = function (n) { return n < 10 ? "0" + n : String(n); };
      var stamp = function (d) {
        return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
          "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
      };
      var localDigits = req.date.replace(/-/g, "");
      var now = stamp(new Date());
      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Wash World//Booking Draft//EN",
        "BEGIN:VEVENT",
        "UID:" + now + "-" + Math.random().toString(36).slice(2) + "@washworld",
        "DTSTAMP:" + now,
        "DTSTART;VALUE=DATE:" + localDigits,
        "DTEND;VALUE=DATE:" + localDigits,
        "SUMMARY:Wash World draft — " + req.service,
        "DESCRIPTION:DRAFT request. Name: " + req.name + " Contact: " + req.contact + ". Not confirmed.",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");
    }

    function copyRequestText() {
      var text = formatDraft(collectRequest());
      var done = function () {
        showToast("Request text copied as a draft — not a confirmed appointment.");
        closeDialog();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          legacyCopy(text);
          done();
        });
      } else {
        legacyCopy(text);
        done();
      }
    }

    function legacyCopy(text) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }

  function focusFirst(dialog) {
    var input = dialog.querySelector("input, select, textarea, button");
    if (input && typeof input.focus === "function") input.focus();
  }

  function trapFocus(event, dialog) {
    var focusables = dialog.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function isContactValid(value) {
    if (!value) return false;
    return /@/.test(value) || /[0-9]{7,}/.test(value.replace(/[\s()-]/g, ""));
  }

  function isValidDate(value) {
    var re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(value)) return false;
    var d = new Date(value + "T00:00:00");
    return !isNaN(d.getTime()) && toDateValue(d) === value;
  }

  function toDateValue(d) {
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function markInvalid(el) {
    el.setAttribute("aria-invalid", "true");
  }
  function markValid(el) {
    el.removeAttribute("aria-invalid");
  }
  function showError(msg) {
    var errorEl = document.getElementById("booking-error");
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
  function hideError() {
    var errorEl = document.getElementById("booking-error");
    if (!errorEl) return;
    errorEl.hidden = true;
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
      "font-family:Inter,system-ui,sans-serif;font-size:0.9rem;z-index:200;" +
      "box-shadow:0 10px 24px rgba(2,6,23,0.3);transition:opacity .3s ease;max-width:90vw;";

    document.body.appendChild(toast);

    window.setTimeout(function () {
      toast.style.opacity = "0";
      window.setTimeout(function () { toast.remove(); }, 300);
    }, 3800);
  }
})();
