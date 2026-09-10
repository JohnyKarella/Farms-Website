/* ============================================================
   SWAMY NURSERY & FLORIST — PLANT GRID SECTION SCRIPT
   Handles touch devices: first tap reveals the hover overlay,
   a second tap (or tapping "Know More") follows the link.
   Desktop hover behaviour is handled entirely by CSS.
   ============================================================ */

(function () {
  'use strict';

  var isTouchDevice = window.matchMedia('(hover: none)').matches;
  if (!isTouchDevice) return; // desktop: CSS :hover already handles everything

  var frames = document.querySelectorAll('.plant-grid-section .pg-frame');

  frames.forEach(function (frame) {
    frame.addEventListener('click', function (event) {
      var alreadyActive = frame.classList.contains('pg-active');
      var clickedButton = event.target.closest('.pg-btn');

      // If the "Know More" button itself was tapped, let navigation proceed.
      if (clickedButton) return;

      // First tap: reveal details instead of navigating away immediately.
      if (!alreadyActive) {
        event.preventDefault();

        // Close any other open card first.
        frames.forEach(function (other) {
          if (other !== frame) other.classList.remove('pg-active');
        });

        frame.classList.add('pg-active');
      }
      // Second tap on an already-active card: allow the link to navigate normally.
    });
  });

  // Tapping outside any card closes the open overlay.
  document.addEventListener('click', function (event) {
    if (event.target.closest('.pg-frame')) return;
    frames.forEach(function (frame) {
      frame.classList.remove('pg-active');
    });
  });
})();
