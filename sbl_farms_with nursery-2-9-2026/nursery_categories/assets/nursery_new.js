// Filter new

    (function () {
      var grid = document.getElementById('catalogGrid');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.plant-card'));
      var emptyState = document.getElementById('emptyState');

      var categoryItems = Array.prototype.slice.call(document.querySelectorAll('.category-item'));
      var categoryToggles = Array.prototype.slice.call(document.querySelectorAll('.category-toggle'));
      var subButtons = Array.prototype.slice.call(document.querySelectorAll('.sub-btn'));

      // Category Header Bar Elements
      var catParentBadge = document.getElementById('catParentBadge');
      var catTitleText = document.getElementById('catTitleText');
      var catCountBadge = document.getElementById('catCountBadge');
      var catEnquiryBtn = document.getElementById('catEnquiryBtn');
      var catWhatsappBtn = document.getElementById('catWhatsappBtn');

      /* ---------- Category dropdown (accordion): only one open at a time ---------- */
      function openCategory(item) {
        categoryItems.forEach(function (ci) {
          var isTarget = ci === item;
          ci.classList.toggle('open', isTarget);
          var toggleBtn = ci.querySelector('.category-toggle');
          if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
          }
        });
      }

      categoryToggles.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var item = btn.closest('.category-item');
          var alreadyOpen = item.classList.contains('open');
          openCategory(alreadyOpen ? null : item);
        });
      });

      /* ---------- Sub-category selection: filters the product grid by exact plant name ---------- */
      function applyFilter(name, activeBtn) {
        var visibleCount = 0;
        cards.forEach(function (card) {
          var match = card.getAttribute('data-name') === name;
          card.style.display = match ? '' : 'none';
          if (match) visibleCount++;
        });

        if (emptyState) {
          emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        subButtons.forEach(function (b) {
          b.classList.toggle('active', b === activeBtn);
        });

        // Update category header bar
        if (activeBtn) {
          var parentItem = activeBtn.closest('.category-item');
          var parentToggle = parentItem ? parentItem.querySelector('.category-toggle') : null;
          var parentName = 'PLANTS';
          if (parentToggle) {
            // Get text excluding chevron
            parentName = parentToggle.childNodes[0].textContent.trim();
          }

          if (catParentBadge) catParentBadge.textContent = parentName;
          if (catTitleText) catTitleText.textContent = name;
          if (catCountBadge) catCountBadge.textContent = visibleCount + (visibleCount === 1 ? ' Variety' : ' Varieties');

          var whatsappMsg = encodeURIComponent('Hi SBL Farms, I would like to enquire about ' + name + ' (' + parentName + ').');
          if (catWhatsappBtn) catWhatsappBtn.href = 'https://wa.me/919900001972?text=' + whatsappMsg;
          if (catEnquiryBtn) catEnquiryBtn.href = 'contact.html?category=' + encodeURIComponent(name);
        }
      }

      subButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          applyFilter(btn.getAttribute('data-filter'), btn);
          openCategory(btn.closest('.category-item'));
        });
      });

      /* ---------- Add Enquiry Button & Action Row to Each Plant Card ---------- */
      cards.forEach(function (card) {
        var info = card.querySelector('.info');
        if (!info) return;

        var viewMore = info.querySelector('.view-more');
        var plantName = card.getAttribute('data-category-label') || (info.querySelector('h4') ? info.querySelector('h4').textContent.trim() : 'Plant');
        var catName = card.getAttribute('data-name') || '';

        if (!info.querySelector('.card-actions')) {
          var actionRow = document.createElement('div');
          actionRow.className = 'card-actions';

          if (viewMore) {
            actionRow.appendChild(viewMore);
          } else {
            var vm = document.createElement('span');
            vm.className = 'view-more';
            vm.textContent = 'View Details →';
            actionRow.appendChild(vm);
          }

          var enquireBtn = document.createElement('button');
          enquireBtn.type = 'button';
          enquireBtn.className = 'card-enquire-btn';
          enquireBtn.innerHTML = '<i class="fa fa-envelope"></i> Enquire';
          enquireBtn.setAttribute('title', 'Enquire about ' + plantName);
          enquireBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var msg = encodeURIComponent('Hi SBL Farms, I would like to enquire about: ' + plantName + (catName ? ' (' + catName + ')' : ''));
            window.open('https://wa.me/919900001972?text=' + msg, '_blank');
          });

          actionRow.appendChild(enquireBtn);
          info.appendChild(actionRow);
        }
      });

      /* Start with the first category open and its first sub-category selected */
      var firstItem = categoryItems[0];
      var firstSubBtn = firstItem ? firstItem.querySelector('.sub-btn') : null;
      if (firstItem && firstSubBtn) {
        openCategory(firstItem);
        applyFilter(firstSubBtn.getAttribute('data-filter'), firstSubBtn);
      }

      /* Fallback icon if an image fails to load */
      grid.querySelectorAll('.thumb-wrap img').forEach(function (img) {
        img.addEventListener('error', function () {
          img.style.display = 'none';
          img.parentElement.classList.add('no-img');
        });
      });

      /* ---------- Modal ---------- */
      var overlay = document.getElementById('modalOverlay');
      var modalImgWrap = document.getElementById('modalImgWrap');
      var modalImg = document.getElementById('modalImg');
      var modalCategory = document.getElementById('modalCategory');
      var modalName = document.getElementById('modalName');
      var modalDesc = document.getElementById('modalDesc');
      var modalClose = document.getElementById('modalClose');
      var modalWhatsappBtn = document.getElementById('modalWhatsappBtn');
      var modalEnquiryBtn = document.getElementById('modalEnquiryBtn');

      function openModal(card) {
        if (!overlay) return;
        modalImgWrap.classList.remove('no-img');
        modalImg.style.display = '';
        modalImg.src = card.getAttribute('data-img');
        modalImg.alt = card.getAttribute('data-name');

        var catLabel = card.getAttribute('data-category-label') || '';
        var name = card.getAttribute('data-name') || '';
        var desc = card.getAttribute('data-desc') || '';

        modalCategory.textContent = catLabel;
        modalName.textContent = name;
        modalDesc.textContent = desc;

        if (modalWhatsappBtn) {
          var wMsg = encodeURIComponent('Hi SBL Farms, I would like to enquire about: ' + catLabel + ' (' + name + ')');
          modalWhatsappBtn.href = 'https://wa.me/919900001972?text=' + wMsg;
        }

        if (modalEnquiryBtn) {
          modalEnquiryBtn.href = 'contact.html?plant=' + encodeURIComponent(catLabel) + '&category=' + encodeURIComponent(name);
        }

        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      function closeModal() {
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
      }

      modalImg.addEventListener('error', function () {
        modalImg.style.display = 'none';
        modalImgWrap.classList.add('no-img');
      });

      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          openModal(card);
        });
      });

      if (modalClose) modalClose.addEventListener('click', closeModal);
      if (overlay) {
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) closeModal();
        });
      }
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
      });
    })();
