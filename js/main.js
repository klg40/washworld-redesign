/* Wash World — Main JS */
(function () {
  'use strict';

  var body = document.body;
  var header = document.getElementById('site-header');
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');

  /* ---------- Sticky header shadow ---------- */
  function onScroll() {
    if (header) {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id], footer[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]'));

  function setActiveLink() {
    var pos = window.scrollY + 120;
    var currentId = '';

    sections.forEach(function (section) {
      if (section.offsetTop <= pos) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Booking modal ---------- */
  var modal = document.getElementById('booking-modal');
  var modalClose = document.getElementById('booking-modal-close');
  var bookingForm = document.getElementById('booking-form');

  function openModal() {
    if (modal) {
      modal.classList.add('open');
      body.classList.add('modal-open');
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      body.classList.remove('modal-open');
    }
  }

  document.querySelectorAll('[data-book]').forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    if (modalClose) modalClose.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- Booking form submit ---------- */
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('form-status');
      if (!status) return;

      var name = bookingForm.querySelector('#book-name');
      var phone = bookingForm.querySelector('#book-phone');
      var service = bookingForm.querySelector('#book-service');
      var date = bookingForm.querySelector('#book-date');

      if (name && name.value.trim() && phone && phone.value.trim() && service && service.value && date && date.value) {
        status.textContent = 'Thanks ' + name.value.trim() + '! Your booking request has been received.';
        status.className = 'form-status success';
        bookingForm.reset();
        setTimeout(closeModal, 1600);
      } else {
        status.textContent = 'Please fill in all required fields.';
        status.className = 'form-status error';
      }
    });
  }

  /* ---------- Contact form submit ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('contact-status');
      if (!status) return;

      var name = contactForm.querySelector('#contact-name');
      var email = contactForm.querySelector('#contact-email');
      var message = contactForm.querySelector('#contact-message');

      if (name && name.value.trim() && email && email.value.trim() && message && message.value.trim()) {
        status.textContent = 'Thanks ' + name.value.trim() + '! Your message has been sent. We will reply within 24 hours.';
        status.className = 'form-status success';
        contactForm.reset();
      } else {
        status.textContent = 'Please fill in all required fields.';
        status.className = 'form-status error';
      }
    });
  }
})();
