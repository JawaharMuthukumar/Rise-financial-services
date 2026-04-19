// ===== Rise Financial Services — main.js =====
// Rebuilt for correct, robust UX behaviour

(function () {
  'use strict';

  /* ---- Navbar scroll effect ---- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile hamburger menu ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    const openMenu = () => {
      navLinks.classList.add('open');
      hamburger.classList.add('is-active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // prevent background scroll
    };
    const closeMenu = () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', 'navLinks');
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');

    hamburger.addEventListener('click', () => {
      navLinks.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Close on nav link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') &&
          !navbar.contains(e.target)) closeMenu();
    });
  }

  /* ---- Active nav highlighting based on current page ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href').split('#')[0]; // ignore hash
    link.classList.toggle('active',
      href === currentPage || (currentPage === '' && href === 'index.html')
    );
  });

  /* ---- Scroll reveal animation ---- */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all if no IntersectionObserver
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ---- Counter animation for stats ---- */
  function animateCounter(el, target, prefix, suffix) {
    const duration = 1800;
    const startTime = performance.now();

    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * ease);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  // Observe stats bar for counter trigger
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar && 'IntersectionObserver' in window) {
    let counted = false;
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        statsObserver.disconnect();
        document.querySelectorAll('.stat-num').forEach(el => {
          const text = el.textContent.trim();
          // Parse: e.g. "₹500Cr+", "500+", "1–3", "98%"
          if (text.includes('–') || text.includes('-')) return; // skip ranges like 1–3
          const hasRupee  = text.includes('₹');
          const hasCr     = text.includes('Cr');
          const hasPlus   = el.querySelector('.stat-plus') != null;
          const hasPct    = text.includes('%');
          const numMatch  = text.match(/\d+/);
          if (!numMatch) return;
          const num = parseInt(numMatch[0], 10);
          const suffix = hasCr ? 'Cr' : hasPct ? '%' : '';
          const prefix = hasRupee ? '₹' : '';
          // Save the plus span
          const plusSpan = el.querySelector('.stat-plus');
          const plusText = plusSpan ? plusSpan.outerHTML : '';
          el.textContent = prefix + '0' + suffix;
          setTimeout(() => {
            el.textContent = '';
            const spanMain = document.createTextNode('');
            el.appendChild(spanMain);
            const start = performance.now();
            const tick = (now) => {
              const p = Math.min((now - start) / 1800, 1);
              const e = 1 - Math.pow(1 - p, 3);
              const cur = Math.round(num * e);
              el.textContent = prefix + cur + suffix;
              if (plusText && p >= 1) el.innerHTML += plusText;
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }, 100);
        });
      }
    }, { threshold: 0.5 });
    statsObserver.observe(statsBar);
  }

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Form field validation feedback ---- */
  document.querySelectorAll('form').forEach(form => {
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
      field.addEventListener('blur', () => {
        field.style.borderColor = (!field.value.trim()) ? 'var(--error)' : '';
      });
      field.addEventListener('input', () => {
        if (field.value.trim()) field.style.borderColor = '';
      });
    });
  });

  /* ---- Contact form submit feedback ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = this.querySelector('button[type=submit]');
      const original = btn.textContent;
      btn.textContent = '✓ Application Submitted!';
      btn.style.cssText = 'background:#16A34A;border-color:#16A34A;pointer-events:none';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.cssText = '';
        this.reset();
      }, 4000);
    });
  }

  /* ---- Quick eligibility form on homepage ---- */
  const quickForm = document.querySelector('.quick-form');
  if (quickForm) {
    quickForm.addEventListener('submit', function (e) {
      // Let it navigate to contact.html (action="contact.html")
      // No prevention needed — just passes through
    });
  }

  console.log('%cRise Financial Services', 'color:#C9A84C;font-family:Georgia;font-size:18px;font-weight:bold');
  console.log('%cDirect Lender · Unsecured Business Loans · South India', 'color:#1E3A6A;font-size:12px');
})();
