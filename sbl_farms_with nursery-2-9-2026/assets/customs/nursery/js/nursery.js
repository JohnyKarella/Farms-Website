// Nursery

// Ultra-smooth count-up animation for stats
(function () {
    function initSmoothCounters() {
        var statBoxes = document.querySelectorAll('.stat-box');
        if (!statBoxes.length) return;

        function animateNumber(numEl) {
            if (numEl.dataset.counted === 'true') return;

            // Safe integer extraction
            var target = parseInt(numEl.getAttribute('data-target') || numEl.textContent.replace(/[^\d]/g, ''), 10);
            if (isNaN(target) || target <= 0) return;

            numEl.dataset.counted = 'true';
            var duration = 1600; // 1.6s
            var startTime = null;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var elapsed = timestamp - startTime;
                var progress = Math.min(elapsed / duration, 1);

                // Silky smooth ease-out quartic curve
                var ease = 1 - Math.pow(1 - progress, 4);
                var current = Math.floor(ease * target);

                numEl.textContent = (target >= 1000 ? current.toLocaleString() : current) + '+';

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    numEl.textContent = (target >= 1000 ? target.toLocaleString() : target) + '+';
                }
            }

            requestAnimationFrame(step);
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var numEl = entry.target.querySelector('.stat-number, .num');
                        if (numEl) animateNumber(numEl);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

            statBoxes.forEach(function (box) {
                observer.observe(box);
            });
        } else {
            statBoxes.forEach(function (box) {
                var numEl = box.querySelector('.stat-number, .num');
                if (numEl) animateNumber(numEl);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSmoothCounters);
    } else {
        initSmoothCounters();
    }
})();






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



    