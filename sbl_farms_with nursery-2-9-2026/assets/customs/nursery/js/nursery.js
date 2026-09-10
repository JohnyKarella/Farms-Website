// Nursery





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



    