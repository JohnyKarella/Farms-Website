// Gallery


// New Gallery

    // Replace these src values with your own image paths / URLs.
    // "h" is a rough aspect hint only used to vary placeholder heights below.
    // shape: "" = square (1x1), "wide" = horizontal rectangle (2x1),
    // "tall" = vertical rectangle (1x2), "big" = large square/feature block (2x2)
    // All image markup lives directly in the HTML above (.gallery-item divs).
    // This script only reads those divs to power the lightbox — it does not create them.

    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCounter = document.getElementById('lightboxCounter');
    let currentIndex = 0;

    galleryItems.forEach((item, index) => {
      const img = item.querySelector('img');

      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Open image: ' + img.alt);

      item.addEventListener('click', () => openLightbox(index));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    function openLightbox(index) {
      currentIndex = index;
      updateLightboxImage();
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function updateLightboxImage() {
      const img = galleryItems[currentIndex].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCounter.textContent = (currentIndex + 1) + ' / ' + galleryItems.length;
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % galleryItems.length;
      updateLightboxImage();
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      updateLightboxImage();
    }

    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxNext').addEventListener('click', showNext);
    document.getElementById('lightboxPrev').addEventListener('click', showPrev);

    // Close when clicking the dark backdrop (but not the image itself)
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });

    // Basic swipe support for touch devices
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    lightbox.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? showPrev() : showNext();
      }
    });
