/**
 * Gati Node Transport Company — Main Site Script
 */
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const config = typeof GATI_CONFIG !== 'undefined' ? GATI_CONFIG : {
    adminEmail: 'gatinode.admin@gmail.com',
    formEndpoint: 'https://formsubmit.co/ajax/gatinode.admin@gmail.com',
    approvedReviewsUrl: 'data/approved-reviews.json'
  };

  // ---- Preloader (short delay — faster LCP) ----
  const preloader = document.getElementById('preloader');
  document.body.style.overflow = 'hidden';

  function hidePreloader() {
    if (!preloader || preloader.classList.contains('hidden')) return;
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
  }

  window.addEventListener('load', () => {
    setTimeout(hidePreloader, prefersReducedMotion ? 0 : 400);
  });
  setTimeout(hidePreloader, 2500);

  // ---- Helpers ----
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formObject(form) {
    const data = {};
    new FormData(form).forEach((value, key) => {
      if (key !== '_gotcha') data[key] = value;
    });
    return data;
  }

  function showFormMessage(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = `form-message ${type}`;
    el.setAttribute('role', 'status');
  }

  function setSubmitLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle('is-loading', loading);
    if (loading) {
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Sending…';
    } else if (btn.dataset.originalText) {
      btn.innerHTML = btn.dataset.originalText;
    }
  }

  async function sendToAdmin(payload) {
    const endpoint = config.formEndpoint;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let result = {};
    try {
      result = await res.json();
    } catch (_) {
      /* non-JSON response */
    }

    if (!res.ok) {
      throw new Error(result.message || 'Failed to send message. Please try again or call us.');
    }
    return result;
  }

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.trim().slice(0, 2).toUpperCase();
  }

  function renderStars(rating) {
    const n = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
    let html = '';
    for (let i = 0; i < 5; i++) {
      html += `<svg viewBox="0 0 24 24" aria-hidden="true"${i < n ? '' : ' class="star-empty"'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
    return html;
  }

  // ---- Mobile Menu ----
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const navLinks = document.querySelectorAll('.nav-link');

  function closeMobileMenu() {
    menuToggle?.classList.remove('active');
    navMenu?.classList.remove('open');
    mobileOverlay?.classList.remove('active');
    document.body.style.overflow = preloader?.classList.contains('hidden') ? '' : 'hidden';
  }

  function openMobileMenu() {
    menuToggle?.classList.add('active');
    navMenu?.classList.add('open');
    mobileOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  menuToggle?.addEventListener('click', () => {
    if (navMenu?.classList.contains('open')) closeMobileMenu();
    else openMobileMenu();
  });

  mobileOverlay?.addEventListener('click', closeMobileMenu);
  navLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

  // ---- Header Scroll ----
  const header = document.getElementById('header');

  function handleScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 50);
  }

  // ---- Active Nav Link ----
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[data-section="${id}"]`);
      if (!link) return;
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  // ---- Smooth Scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const targetEl = document.querySelector(href);
      if (!targetEl) return;
      e.preventDefault();
      const headerOffset =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 88;
      const offsetTop = targetEl.offsetTop - headerOffset;
      window.scrollTo({ top: offsetTop, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      closeMobileMenu();
    });
  });

  // ---- Back to Top ----
  const backToTop = document.getElementById('backToTop');

  function toggleBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('visible', window.scrollY > 600);
  }

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  // ---- Hero Parallax (batched on scroll) ----
  const heroBg = document.querySelector('.hero-bg img');
  const heroSection = document.querySelector('.hero');
  let heroHeightCache = 0;

  function runHeroParallax() {
    if (!heroBg || !heroSection || prefersReducedMotion) return;
    if (!heroHeightCache) heroHeightCache = heroSection.offsetHeight;
    const scrollY = window.scrollY;
    if (scrollY <= heroHeightCache) {
      heroBg.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0) scale(1.1)`;
    }
  }

  let scrollTicking = false;

  function runOnScroll() {
    handleScroll();
    updateActiveLink();
    toggleBackToTop();
    runHeroParallax();
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(() => {
          runOnScroll();
          scrollTicking = false;
        });
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    heroHeightCache = 0;
  }, { passive: true });

  handleScroll();
  toggleBackToTop();

  // ---- Stats Counter ----
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    const statNumbers = document.querySelectorAll('.stat-number span[data-target]');
    if (!statNumbers.length) return;

    const statsSection = document.getElementById('stats');
    if (statsSection) {
      const rect = statsSection.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
    }

    countersAnimated = true;
    statNumbers.forEach(span => {
      const target = parseInt(span.getAttribute('data-target'), 10);
      const duration = prefersReducedMotion ? 0 : 2000;
      if (duration === 0) {
        span.textContent = target;
        return;
      }
      const start = performance.now();
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        span.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else span.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }

  // ---- Approved Reviews ----
  const reviewsEmpty = document.getElementById('reviewsEmpty');
  const reviewsTrack = document.getElementById('reviewsTrack');

  async function loadApprovedReviews() {
    if (!reviewsTrack) return;
    try {
      const res = await fetch(config.approvedReviewsUrl);
      if (!res.ok) throw new Error('Could not load reviews');
      const reviews = await res.json();
      if (!Array.isArray(reviews) || reviews.length === 0) {
        reviewsEmpty?.classList.remove('hidden');
        reviewsTrack.classList.add('hidden');
        reviewsTrack.innerHTML = '';
        return;
      }

      reviewsEmpty?.classList.add('hidden');
      reviewsTrack.classList.remove('hidden');
      reviewsTrack.innerHTML = reviews
        .map(
          (review, i) => `
        <article class="testimonial-card reveal${i > 0 ? ` reveal-delay-${Math.min(i, 3)}` : ''}">
          <div class="testimonial-quote" aria-hidden="true">&ldquo;</div>
          <div class="testimonial-stars" aria-label="${review.rating} out of 5 stars">${renderStars(review.rating)}</div>
          <p class="testimonial-text">${escapeHtml(review.text)}</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${escapeHtml(review.initials || getInitials(review.name))}</div>
            <div class="testimonial-author-info">
              <p class="testimonial-author-name">${escapeHtml(review.name)}</p>
              <p>${escapeHtml(review.designation || '')}</p>
            </div>
          </div>
        </article>`
        )
        .join('');

      reviewsTrack.querySelectorAll('.reveal').forEach(el => {
        if (prefersReducedMotion) el.classList.add('active');
      });

      if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
              }
            });
          },
          { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
        );
        reviewsTrack.querySelectorAll('.reveal').forEach(el => obs.observe(el));
      } else {
        reviewsTrack.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
      }
    } catch (err) {
      console.warn('Reviews load:', err);
      reviewsEmpty?.classList.remove('hidden');
      reviewsTrack?.classList.add('hidden');
    }
  }

  loadApprovedReviews();

  // ---- Review Form ----
  const reviewForm = document.getElementById('reviewForm');
  const reviewFormStatus = document.getElementById('reviewFormStatus');

  if (reviewForm) {
    reviewForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (new FormData(reviewForm).get('_gotcha')) return;
      const data = formObject(reviewForm);

      if (!data.name || !data.designation || !data.rating || !data.review) {
        showFormMessage(reviewFormStatus, 'Please fill in all required fields including your star rating.', 'error');
        return;
      }

      const submitBtn = reviewForm.querySelector('.form-submit');
      setSubmitLoading(submitBtn, true);

      try {
        await sendToAdmin({
          _subject: 'New Review Submission (Pending Approval) — Gati Node',
          _template: 'table',
          _captcha: 'false',
          form_type: 'Review (pending approval)',
          name: data.name,
          designation: data.designation,
          email: data.email || 'Not provided',
          rating: `${data.rating} / 5`,
          review: data.review
        });
        showFormMessage(
          reviewFormStatus,
          'Thank you! Your review has been submitted. Our team will verify it before it appears on the website.',
          'success'
        );
        reviewForm.reset();
      } catch (err) {
        showFormMessage(
          reviewFormStatus,
          err.message || 'Something went wrong. Please email gatinode.admin@gmail.com.',
          'error'
        );
      } finally {
        setSubmitLoading(submitBtn, false);
      }
    });
  }

  // ---- Contact Form (service-specific fields) ----
  const contactForm = document.getElementById('contactForm');
  const contactFormStatus = document.getElementById('contactFormStatus');
  const formServiceSelect = document.getElementById('formService');
  const serviceFieldPanels = {
    freight: document.getElementById('serviceFieldsFreight'),
    truck: document.getElementById('serviceFieldsTruck'),
    godown: document.getElementById('serviceFieldsGodown'),
    other: document.getElementById('serviceFieldsOther')
  };

  const formDetailsInput = document.getElementById('formDetails');
  const formDetailsLabel = document.getElementById('formDetailsLabel');

  const serviceLabels = {
    freight: 'Freight & Cargo Transport',
    truck: 'Truck Services',
    godown: 'Godown Services',
    other: 'Other Queries'
  };

  function setPanelInputs(panel, required) {
    if (!panel) return;
    panel.querySelectorAll('input, textarea, select').forEach(input => {
      input.required = required;
      if (!required) input.value = '';
    });
  }

  function updateServiceFields() {
    const service = formServiceSelect ? formServiceSelect.value : '';

    Object.entries(serviceFieldPanels).forEach(([key, panel]) => {
      if (!panel) return;
      const active = key === service;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
      setPanelInputs(panel, active);
    });

    if (formDetailsInput) {
      formDetailsInput.required = service === 'other';
    }
    if (formDetailsLabel) {
      formDetailsLabel.innerHTML =
        service === 'other'
          ? 'Your Query <span class="required">*</span>'
          : 'Additional Details (optional)';
    }
  }

  if (formServiceSelect) {
    formServiceSelect.addEventListener('change', updateServiceFields);
    updateServiceFields();
  }

  function validateContactForm(data) {
    if (!data.name || !data.phone || !data.service) {
      return 'Please enter your name/company, phone number, and select a service.';
    }

    if (data.service === 'freight') {
      if (!data.pickup_city || !data.delivery_city) {
        return 'Please enter pickup city and delivery city for freight & cargo.';
      }
    } else if (data.service === 'truck') {
      if (!data.truck_location || !data.truck_deliver_to) {
        return 'Please enter your location and where we can deliver for truck services.';
      }
    } else if (data.service === 'godown') {
      if (!data.godown_city) {
        return 'Please enter the city name for godown services.';
      }
    } else if (data.service === 'other') {
      if (!data.message || !String(data.message).trim()) {
        return 'Please describe your query in the Additional Details field.';
      }
    }

    return null;
  }

  function buildContactEmailPayload(data) {
    const payload = {
      _subject: 'New Contact Message — Gati Node Website',
      _template: 'table',
      _captcha: 'false',
      form_type: 'Contact',
      name_or_company: data.name,
      phone: data.phone,
      email: data.email || 'Not provided',
      service: serviceLabels[data.service] || data.service,
      additional_details: data.message || '—'
    };

    if (data.service === 'freight') {
      payload.pickup_city = data.pickup_city;
      payload.delivery_city = data.delivery_city;
    } else if (data.service === 'truck') {
      payload.location = data.truck_location;
      payload.deliver_to = data.truck_deliver_to;
    } else if (data.service === 'godown') {
      payload.city = data.godown_city;
    }

    return payload;
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (new FormData(contactForm).get('_gotcha')) return;
      const data = formObject(contactForm);

      const validationError = validateContactForm(data);
      if (validationError) {
        showFormMessage(contactFormStatus, validationError, 'error');
        return;
      }

      const submitBtn = contactForm.querySelector('.form-submit');
      setSubmitLoading(submitBtn, true);

      try {
        await sendToAdmin(buildContactEmailPayload(data));
        showFormMessage(
          contactFormStatus,
          'Thank you! Your message has been sent. We will contact you within 2 hours.',
          'success'
        );
        contactForm.reset();
        updateServiceFields();
      } catch (err) {
        showFormMessage(
          contactFormStatus,
          err.message || 'Something went wrong. Please call us or email gatinode.admin@gmail.com.',
          'error'
        );
      } finally {
        setSubmitLoading(submitBtn, false);
      }
    });
  }

  // ---- Intersection Observer (reveal + stats) ----
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('active'));
    animateCounters();
  } else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
    );
    revealElements.forEach(el => revealObserver.observe(el));

    const statsSection = document.getElementById('stats');
    if (statsSection) {
      const statsObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              animateCounters();
              statsObserver.disconnect();
            }
          });
        },
        { rootMargin: '0px 0px -100px 0px', threshold: 0.1 }
      );
      statsObserver.observe(statsSection);
    }
  } else {
    revealElements.forEach(el => el.classList.add('active'));
    animateCounters();
  }
});
