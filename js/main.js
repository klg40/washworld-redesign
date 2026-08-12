'use strict';

/**
 * Wash World | js/main.js
 * Lightweight, dependency-free interactivity for the site.
 */

(function () {
  var ready = function (fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  ready(function () {
    // Mobile navigation toggle -------------------------------------------
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('main-nav');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('open', !expanded);
      });

      // Close the menu when a nav link is selected.
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) {
          toggle.setAttribute('aria-expanded', 'false');
          nav.classList.remove('open');
        }
      });
    }

    // Sticky header state ------------------------------------------------
    var header = document.getElementById('site-header');
    if (header) {
      header.style.transition = 'box-shadow 0.2s ease';
    }

    // Scroll reveal --------------------------------------------------------
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    // "Book Now" buttons ---------------------------------------------------
    var bookButtons = document.querySelectorAll('[data-book]');
    function scrollToContact() {
      var contact = document.getElementById('contact');
      if (contact) {
        contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    bookButtons.forEach(function (btn) {
      btn.addEventListener('click', scrollToContact);
    });

    // Contact form (no backend; shows success message) -----------------------
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    if (form && status) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = (form.name && form.name.value.trim()) || '';
        status.textContent = name ? 'Thanks, ' + name + '! Your message has been received.' : 'Thanks! Your message has been received.';
        form.reset();
        status.setAttribute('role', 'status');
      });
    }

    // Footer year -------------------------------------------------------------
    var yearEl = document.querySelector('[data-year]');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  });
})();
