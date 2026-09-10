// Nursery


    const statNums = document.querySelectorAll('.stat-box .num');
    const animated = new Set();

    function animateCount(el) {
      if (animated.has(el)) return;
      animated.add(el);
      var rawTarget = el.dataset.target || el.textContent.replace(/[^\d]/g, '');
      var target = parseInt(rawTarget, 10);
      if (isNaN(target)) return;
      var duration = 1800;
      var startTime = null;

      function tick(now) {
        if (!startTime) startTime = now;
        var elapsed = now - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = (target >= 100 ? current.toLocaleString() : current) + '+';
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = (target >= 100 ? target.toLocaleString() : target) + '+';
        }
      }
      requestAnimationFrame(tick);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    statNums.forEach(function (n) { observer.observe(n); });





    // FAQ

    function nurFaqToggle(btn) {
      // Walk up to find the .nur-faq__item parent
      var item = btn;
      while (item && !item.classList.contains('nur-faq__item')) {
        item = item.parentElement;
      }
      if (!item) return;

      var isOpen = item.classList.contains('nur-faq__item--open');

      // Close all items in the same accordion
      var accordion = item.closest('#nurFaqAccordion') || document.getElementById('nurFaqAccordion');
      accordion.querySelectorAll('.nur-faq__item').forEach(function(el) {
        el.classList.remove('nur-faq__item--open');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('nur-faq__item--open');
      }
    }

    // Also support click on the entire question row (not just button)
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.nur-faq__question').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
        });
      });
    });



    