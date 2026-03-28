/* ============================================================
   HackOrbit 2025 — App JavaScript
   All interactions: loading, particles, cursor, scroll, FAQ, 
   counters, mobile menu, active nav
   ============================================================ */

(function () {
  'use strict';

  // ─── Loading Screen ─────────────────────────────────────────
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  const loadingText = document.getElementById('loading-text');

  const loadingMessages = [
    'Initializing Orbital Systems...',
    'Calibrating Star Charts...',
    'Loading Innovation Modules...',
    'Syncing with HackOrbit Network...',
    'Launch Sequence Ready.'
  ];

  let loadProgress = 0;
  const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 18 + 5;
    if (loadProgress > 100) loadProgress = 100;
    if (loadingBar) loadingBar.style.width = loadProgress + '%';
    const msgIdx = Math.min(
      Math.floor((loadProgress / 100) * loadingMessages.length),
      loadingMessages.length - 1
    );
    if (loadingText) loadingText.textContent = loadingMessages[msgIdx];
    if (loadProgress >= 100) {
      clearInterval(loadInterval);
      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('hidden');
        document.body.style.overflow = '';
        initAnimations();
      }, 400);
    }
  }, 200);

  // Prevent scroll during loading
  document.body.style.overflow = 'hidden';

  // ─── Interactive Constellation Background (Canvas) ──────────
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    let mouse = { x: null, y: null, radius: 150 };

    // Update mouse position for interactivity
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    class Particle {
      constructor(x, y, dx, dy, size, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;
        this.color = color;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      update() {
        // Starfield movement
        this.x += this.dx;
        this.y += this.dy;

        // Bounce off edges
        if (this.x > w || this.x < 0) this.dx = -this.dx;
        if (this.y > h || this.y < 0) this.dy = -this.dy;

        // Mouse interaction repel
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let forceDirX = dx / distance;
          let forceDirY = dy / distance;
          let maxDistance = mouse.radius;
          let force = (maxDistance - distance) / maxDistance;
          let dirX = (forceDirX * force * this.density) * -0.6;
          let dirY = (forceDirY * force * this.density) * -0.6;

          if (distance < mouse.radius) {
            this.x += dirX;
            this.y += dirY;
          }
        }
        this.draw();
      }
    }

    function createParticles() {
      particles = [];
      const numberOfParticles = Math.min((w * h) / 7000, 150); // density control
      for (let i = 0; i < numberOfParticles; i++) {
        let size = Math.random() * 2 + 0.5;
        let x = Math.random() * (w - size * 2) + size;
        let y = Math.random() * (h - size * 2) + size;
        let dx = (Math.random() - 0.5) * 0.8;
        let dy = (Math.random() - 0.5) * 0.8;
        // Blend between primary and tertiary colors dynamically depending on position
        let color = Math.random() > 0.5 ? 'rgba(96, 165, 250, 0.7)' : 'rgba(34, 211, 238, 0.7)';
        
        particles.push(new Particle(x, y, dx, dy, size, color));
      }
    }

    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) +
                         ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
          if (distance < (w/7) * (h/7)) {
            let opacity = 1 - (distance / 15000);
            if(opacity < 0) opacity = 0;
            ctx.strokeStyle = `rgba(180, 200, 240, ${opacity * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connectParticles();
      requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        createParticles();
      }, 250);
    });
  }

  // ─── Custom Cursor ──────────────────────────────────────────
  function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    // Hide on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const interactiveEls = document.querySelectorAll('a, button, .theme-card, .team-card, .faq-item, .partner-item, .overview-card, .prize-card, .stat-card');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  // ─── Scroll Reveal Animations ───────────────────────────────
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  }

  // ─── Animated Counters ──────────────────────────────────────
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      if (target >= 100) {
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      } else {
        el.textContent = current.toFixed(1) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Final value
        if (target >= 100) {
          el.textContent = Math.floor(target).toLocaleString() + suffix;
        } else {
          el.textContent = target.toFixed(1) + suffix;
        }
      }
    }
    requestAnimationFrame(update);
  }

  // ─── FAQ Accordion ──────────────────────────────────────────
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (!question) return;
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close all
        faqItems.forEach(i => i.classList.remove('open'));
        // Toggle clicked
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ─── Mobile Menu ────────────────────────────────────────────
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── Active Nav on Scroll ───────────────────────────────────
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navLinks.length) return;

    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      // Navbar background
      if (navbar) {
        if (scrollY > 80) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      // Active link
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (scrollY >= top) {
          current = section.id;
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    });
  }

  // ─── Smooth Scroll for Anchors ──────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ─── Init All Animations ────────────────────────────────────
  function initAnimations() {
    initParticles();
    initCursor();
    initScrollReveal();
    initCounters();
    initFAQ();
    initMobileMenu();
    initActiveNav();
    initSmoothScroll();
  }

  // Fallback if loading takes too long
  setTimeout(() => {
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      loadingScreen.classList.add('hidden');
      document.body.style.overflow = '';
      initAnimations();
    }
  }, 4000);

})();
