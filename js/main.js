/* ============================================================
   ROTARACT MUMBAI VERSOVA — main.js
   Handles: Navigation, Scroll animations, Counters,
            Particle hero, Project filters, Modals,
            Contact & Volunteer form submission
   ============================================================ */

'use strict';

/* ── Utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. NAVIGATION
   ============================================================ */
(function initNav() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');

  // Scrolled state
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    $$('a', mobileMenu).forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
})();

/* ============================================================
   2. SCROLL ANIMATIONS (Intersection Observer)
   ============================================================ */
(function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // For timeline items use a different class
        if (entry.target.classList.contains('timeline-item')) {
          entry.target.classList.add('visible');
        }
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.fade-in, .fade-in-left, .fade-in-right, .timeline-item').forEach(el => {
    observer.observe(el);
  });
})();

/* ============================================================
   3. ANIMATED COUNTERS
   ============================================================ */
(function initCounters() {
  const counters = $$('.counter');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = target > 1000 ? 2200 : 1600;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.floor(easeOut(progress) * target).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString('en-IN');
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
})();

/* ============================================================
   4. HERO PARTICLES
   ============================================================ */
(function initParticles() {
  const container = $('#particles');
  if (!container) return;

  const colors = ['rgba(212,19,103,0.3)', 'rgba(0,103,200,0.3)', 'rgba(247,168,27,0.3)', 'rgba(255,255,255,0.3)'];
  const count  = window.innerWidth < 768 ? 10 : 20;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    const size     = Math.random() * 3 + 2;
    const left     = Math.random() * 100;
    const delay    = Math.random() * 12;
    const duration = Math.random() * 14 + 10;
    const color    = colors[Math.floor(Math.random() * colors.length)];

    Object.assign(p.style, {
      width:           `${size}px`,
      height:          `${size}px`,
      left:            `${left}%`,
      bottom:          `-${size}px`,
      background:      color,
      animationDelay:  `${delay}s`,
      animationDuration:`${duration}s`,
      borderRadius:    '50%'
    });
    container.appendChild(p);
  }
})();

/* ============================================================
   5. PROJECT FILTERS (projects.html)
   ============================================================ */
(function initProjectFilters() {
  const tabs  = $$('.filter-btn');
  const items = $$('.project-item');
  if (!tabs.length || !items.length) return;

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      items.forEach((item, i) => {
        const cat = item.dataset.cat;
        const show = filter === 'all' || cat === filter;

        if (show) {
          item.classList.remove('hidden');
          // Stagger re-entrance
          item.style.transitionDelay = `${(i % 6) * 0.06}s`;
          item.classList.add('fade-in');
          // Trigger visible after paint
          requestAnimationFrame(() => item.classList.add('visible'));
        } else {
          item.classList.add('hidden');
          item.style.transitionDelay = '0s';
        }
      });
    });
  });
})();

/* ============================================================
   6. MODALS (projects.html)
   ============================================================ */
function openModal(id) {
  const overlay = $(`#${id}`);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const overlay = $(`#${id}`);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  $$('.modal-overlay.open').forEach(o => {
    o.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ============================================================
   7. TOAST NOTIFICATION
   ============================================================ */
function showToast(message, type = 'success') {
  const toast    = $('#toast');
  const toastMsg = $('#toastMsg');
  const toastIcon = $('#toastIcon');
  if (!toast) return;

  toastMsg.textContent  = message;
  toastIcon.textContent = '';
  toast.className = `toast ${type}`;

  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4500);
  });
}

/* ============================================================
   8. CONTACT FORM SUBMISSION (localStorage)
   ============================================================ */
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const btn     = $('#contactSubmitBtn');
  const btnText = $('#contactBtnText');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = $('#contact-name').value.trim();
    const email   = $('#contact-email').value.trim();
    const message = $('#contact-message').value.trim();
    const subject = $('#contact-subject').value;

    if (!name || !email || !message || !subject) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    btn.disabled        = true;
    btnText.textContent = 'Sending…';

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    }).then(() => {
      showToast('Message received! We\'ll be in touch soon.', 'success');
      form.reset();
    }).catch(() => {
      showToast('Error sending message. Please try again.', 'error');
    }).finally(() => {
      btn.disabled        = false;
      btnText.textContent = 'Send Message →';
    });

  });
})();

/* ============================================================
   9. VOLUNTEER FORM SUBMISSION (localStorage)
   ============================================================ */
(function initVolunteerForm() {
  const form = $('#volunteerForm');
  if (!form) return;

  const btn     = $('#volSubmitBtn');
  const btnText = $('#volBtnText');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = $('#vol-name').value.trim();
    const email = $('#vol-email').value.trim();
    const age   = parseInt($('#vol-age').value, 10);
    const phone = $('#vol-phone') ? $('#vol-phone').value.trim() : '';
    const area  = $('#vol-area') ? $('#vol-area').value : '';
    const how   = $('#vol-how')  ? $('#vol-how').value  : '';
    const msg   = $('#vol-message') ? $('#vol-message').value.trim() : '';

    if (!name || !email) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (isNaN(age) || age < 18 || age > 30) {
      showToast('Rotaract membership is open to ages 18–30.', 'error');
      return;
    }

    btn.disabled        = true;
    btnText.textContent = 'Submitting…';

    fetch('/api/volunteer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, age, profession: how, why_join: msg, area })
    }).then(() => {
      showToast('Application submitted! Welcome to the family.', 'success');
      form.reset();
    }).catch(() => {
      showToast('Error submitting application. Please try again.', 'error');
    }).finally(() => {
      btn.disabled        = false;
      btnText.textContent = 'Submit Application';
    });


  });
})();

/* ============================================================
   10. ACTIVE NAV LINK HIGHLIGHT
   ============================================================ */
(function highlightActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
    else if (href !== 'contact.html') a.classList.remove('active');
  });
})();

/* ============================================================
   11. SMOOTH ANCHOR SCROLL
   ============================================================ */
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const offset = 80; // navbar height
  const top    = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
});

/* ============================================================
   12. CARD HOVER GLOW EFFECT
   ============================================================ */
(function initCardGlow() {
  $$('.project-card, .card, .mission-card, .value-card, .team-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y    = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
})();

/* ============================================================
   13. STAGGERED VISIBLE ON LOAD (for elements already in view)
   ============================================================ */
window.addEventListener('load', () => {
  // Trigger a scroll event to init scrolled state
  window.dispatchEvent(new Event('scroll'));
});
