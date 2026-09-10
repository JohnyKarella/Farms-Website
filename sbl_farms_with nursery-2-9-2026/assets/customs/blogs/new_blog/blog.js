/* =============================================
   SBL FARMS — Blog Page JavaScript
   ============================================= */
(function () {
  'use strict';

  /* ── Sticky Nav shadow ── */
  var nav = document.getElementById('topnav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    var btn = document.getElementById('backToTop');
    btn && btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  /* ── Back to Top ── */
  var btt = document.getElementById('backToTop');
  btt && btt.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Hamburger Menu ── */
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ── Category Filter ── */
  var pills   = document.querySelectorAll('.pill');
  var cards   = document.querySelectorAll('.post-card, .featured-card');

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      var filter = pill.dataset.filter;

      cards.forEach(function (card) {
        var cat = card.dataset.cat || '';
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          requestAnimationFrame(function () {
            card.style.animation = '';
            card.style.animationName = 'cardReveal';
            card.style.animationDuration = '.4s';
            card.style.animationFillMode = 'both';
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* Add keyframe dynamically for card reveal */
  var ks = document.createElement('style');
  ks.textContent = '@keyframes cardReveal { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }';
  document.head.appendChild(ks);

  /* ── Scroll Fade-Up Observer ── */
  var fadeEls = document.querySelectorAll(
    '.post-card, .featured-card, .sidebar-widget, .mosaic-item, .photo-essay-strip, .pull-quote, .fn-content'
  );
  fadeEls.forEach(function (el) { el.classList.add('fade-up'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Staggered card animation ── */
  function staggerCards() {
    var grids = document.querySelectorAll('.articles-grid');
    grids.forEach(function (grid) {
      var items = grid.querySelectorAll('.post-card');
      items.forEach(function (card, i) {
        card.style.transitionDelay = (i * 0.07) + 's';
      });
    });
  }
  staggerCards();

  /* ── Newsletter Toast & API ── */
  window.handleNewsletterSubmit = function (e) {
    e.preventDefault();
    var form = e.target;
    var email = form.querySelector('[type="email"]');
    if (!email || !email.value) return;

    var emailVal = email.value.trim();
    var host = window.location.hostname || '127.0.0.1';
    var apiBase = window.SBL_API_BASE || (window.location.port === '5000' ? '' : 'http://' + host + ':5000');
    var apiBase = window.SBL_API_BASE || (
      window.location.protocol === 'file:' ? 'http://127.0.0.1:5000' :
      (window.location.port === '5500' || window.location.port === '3000' || window.location.port === '5173' || window.location.port === '8080') ? 'http://' + (window.location.hostname || '127.0.0.1') + ':5000' :
      ''
    );

    fetch(apiBase + '/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailVal, source: 'blog' })
    }).catch(function () {});

    showToast('🌱 You\'re subscribed! Welcome to the SBL Farms family.');
    form.reset();
    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#4caf50';
      setTimeout(function () {
        btn.textContent = btn.classList.contains('fn-btn') ? 'Subscribe Free →' : 'Subscribe';
        btn.style.background = '';
      }, 3000);
    }
  };

  function showToast(msg) {
    var t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 3800);
  }

  /* ── Pagination ── */
  var pageBtns = document.querySelectorAll('.page-btn:not(.page-next)');
  pageBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      pageBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      window.scrollTo({ top: document.querySelector('.main-layout').offsetTop - 120, behavior: 'smooth' });
    });
  });

  /* ── Smooth Anchor Scroll (hero button) ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ── Image lazy load brightness correction on load ── */
  document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
    img.style.opacity = '0';
    img.style.transition = 'opacity .4s ease';
    function onLoad() { img.style.opacity = '1'; }
    if (img.complete) { onLoad(); }
    else { img.addEventListener('load', onLoad); }
  });

  /* ── Reading progress bar ── */
  var bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#2e7d32,#f59e0b);z-index:99999;width:0%;transition:width .1s linear;pointer-events:none;';
  document.body.appendChild(bar);
  window.addEventListener('scroll', function () {
    var doc = document.documentElement;
    var scrolled = doc.scrollTop || document.body.scrollTop;
    var total = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    bar.style.width = (total > 0 ? (scrolled / total * 100) : 0) + '%';
  }, { passive: true });

})();
