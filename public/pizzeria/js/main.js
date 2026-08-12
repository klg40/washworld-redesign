/* ==========================================================================
   Пиццерия «Маргарита» — main.js
   Лёгкие интеракции для статического сайта.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initOrder();
    initHeaderScroll();
    initFooterYear();
  });

  /** Мобильная навигация. */
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
   * Диалог заказа:
   *  - кнопки [data-order] открывают модальное окно
   *  - форма собирает имя, контакт, пиццу и дату с валидацией
   *  - Escape / кнопки закрытия скрывают окно и возвращают фокус
   *  - честный локальный вывод: скачивание черновика .ics и/или копирование
   *    текста. Помечено как ЧЕРНОВИК — ничего не отправляется на сервер.
   */
  function initOrder() {
    var dialog = document.getElementById("order-dialog");
    var form = document.getElementById("order-form");
    var closeBtn = document.getElementById("order-close");
    var closeSecondary = document.getElementById("order-close-secondary");
    var copyBtn = document.getElementById("order-copy");
    var openers = document.querySelectorAll("[data-order]");
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

      var dishInput = document.getElementById("or-dish");
      var dish = opener && opener.getAttribute("data-dish");
      if (dish && dishInput) {
        dishInput.value = dish;
      }

      var minDate = new Date();
      minDate.setDate(minDate.getDate() + 1);
      var dateInput = document.getElementById("or-date");
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
      var name = document.getElementById("or-name");
      var contact = document.getElementById("or-contact");
      var dish = document.getElementById("or-dish");
      var date = document.getElementById("or-date");
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

      if (!dish.value) {
        markInvalid(dish);
        firstInvalid = firstInvalid || dish;
      } else {
        markValid(dish);
      }

      if (!date.value || !isValidDate(date.value)) {
        markInvalid(date);
        firstInvalid = firstInvalid || date;
      } else {
        markValid(date);
      }

      if (firstInvalid) {
        showError("Пожалуйста, заполните выделенные поля.");
        firstInvalid.focus();
        return false;
      }
      hideError();
      return true;
    }

    function collectRequest() {
      return {
        name: document.getElementById("or-name").value.trim(),
        contact: document.getElementById("or-contact").value.trim(),
        dish: document.getElementById("or-dish").value,
        date: document.getElementById("or-date").value
      };
    }

    function formatDraft(req) {
      return [
        "ПИЦЦЕРИЯ «МАРГАРИТА» — ЧЕРНОВИК ЗАКАЗА (не подтверждённый заказ)",
        "Это локальный черновик. В пиццерию ничего не отправлено.",
        "",
        "Имя: " + req.name,
        "Контакт: " + req.contact,
        "Пицца: " + req.dish,
        "К какому дню: " + req.date
      ].join("\n");
    }

    function buildAndDownloadRequest() {
      var req = collectRequest();
      var ics = buildCalendarEvent(req);
      var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "pizzamargherita-order-draft.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Черновик заказа (.ics) скачан — заказ пока не подтверждён.");
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
        "PRODID:-//Pizzeria Margherita//Order Draft//EN",
        "BEGIN:VEVENT",
        "UID:" + now + "-" + Math.random().toString(36).slice(2) + "@pizzamargherita",
        "DTSTAMP:" + now,
        "DTSTART;VALUE=DATE:" + localDigits,
        "DTEND;VALUE=DATE:" + localDigits,
        "SUMMARY:Черновик заказа — " + req.dish,
        "DESCRIPTION:ЧЕРНОВИК. Имя: " + req.name + " Контакт: " + req.contact + ". Не подтверждён.",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");
    }

    function copyRequestText() {
      var text = formatDraft(collectRequest());
      var done = function () {
        showToast("Текст заказа скопирован как черновик — это не подтверждённый заказ.");
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
    var errorEl = document.getElementById("order-error");
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
  function hideError() {
    var errorEl = document.getElementById("order-error");
    if (!errorEl) return;
    errorEl.hidden = true;
  }

  function initHeaderScroll() {
    var header = document.getElementById("site-header");
    if (!header) return;
    var onScroll = function () {
      header.style.boxShadow = window.scrollY > 10 ? "0 4px 16px rgba(60,42,20,0.12)" : "none";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initFooterYear() {
    var el = document.querySelector(".js-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

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
      "background:#1c1917;color:#fff;padding:14px 22px;border-radius:999px;" +
      "font-family:Inter,system-ui,sans-serif;font-size:0.9rem;z-index:200;" +
      "box-shadow:0 10px 24px rgba(60,42,20,0.3);transition:opacity .3s ease;max-width:90vw;";

    document.body.appendChild(toast);

    window.setTimeout(function () {
      toast.style.opacity = "0";
      window.setTimeout(function () { toast.remove(); }, 300);
    }, 3800);
  }
})();
