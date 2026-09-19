// Filter new

(function () {
  var grid = document.getElementById('catalogGrid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.plant-card'));
  var emptyState = document.getElementById('emptyState');

  var categoryItems = Array.prototype.slice.call(document.querySelectorAll('.category-item'));
  var categoryToggles = Array.prototype.slice.call(document.querySelectorAll('.category-toggle'));
  var subButtons = Array.prototype.slice.call(document.querySelectorAll('.sub-btn'));
  var singleEnquireBtn = document.getElementById('catalogSingleEnquireBtn');

  // Filter drawer elements
  var catalogFilterBtn = document.getElementById('catalogFilterBtn');
  var catalogSidebar = document.getElementById('catalogSidebar');
  var catalogSidebarClose = document.getElementById('catalogSidebarClose');
  var catalogSidebarOverlay = document.getElementById('catalogSidebarOverlay');
  var allPlantsBtn = document.getElementById('allPlantsBtn');
  var allPlantsCount = document.getElementById('allPlantsCount');
  var catalogCountPill = document.getElementById('catalogCountPill');
  var activeFilterBadge = document.getElementById('activeFilterBadge');

  /* ---------- Sidebar Drawer Controls ---------- */
  function openSidebar() {
    if (catalogSidebar) catalogSidebar.classList.add('open');
    if (catalogSidebarOverlay) catalogSidebarOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (catalogSidebar) catalogSidebar.classList.remove('open');
    if (catalogSidebarOverlay) catalogSidebarOverlay.classList.remove('open');
    if (!overlay || !overlay.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  if (catalogFilterBtn) catalogFilterBtn.addEventListener('click', openSidebar);
  if (catalogSidebarClose) catalogSidebarClose.addEventListener('click', closeSidebar);
  if (catalogSidebarOverlay) catalogSidebarOverlay.addEventListener('click', closeSidebar);

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

  /* ---------- Count calculations for categories and all plants ---------- */
  var countMap = {};
  cards.forEach(function (card) {
    var name = card.getAttribute('data-name');
    if (name) {
      countMap[name] = (countMap[name] || 0) + 1;
    }
  });

  if (allPlantsCount) {
    allPlantsCount.textContent = cards.length;
  }

  subButtons.forEach(function (btn) {
    var filterVal = btn.getAttribute('data-filter');
    var count = countMap[filterVal] || 0;
    var countSpan = document.createElement('span');
    countSpan.className = 'sub-btn-count';
    countSpan.textContent = '(' + count + ')';
    btn.appendChild(countSpan);
  });

  /* ---------- Filter application ---------- */
  function applyFilter(name, activeBtn) {
    var isAll = !name || name === 'all';
    var visibleCount = 0;

    cards.forEach(function (card) {
      var match = isAll || card.getAttribute('data-name') === name;
      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (allPlantsBtn) {
      allPlantsBtn.classList.toggle('active', isAll);
    }

    subButtons.forEach(function (b) {
      b.classList.toggle('active', !isAll && b === activeBtn);
    });

    if (catalogCountPill) {
      if (isAll) {
        catalogCountPill.textContent = 'Showing all ' + visibleCount + ' plants';
      } else {
        catalogCountPill.textContent = 'Showing ' + visibleCount + ' plants';
      }
    }

    if (activeFilterBadge) {
      if (isAll) {
        activeFilterBadge.style.display = 'none';
        activeFilterBadge.textContent = '';
      } else {
        activeFilterBadge.textContent = name;
        activeFilterBadge.style.display = 'inline-flex';
      }
    }

    if (singleEnquireBtn) {
      var queryVal = isAll ? 'All Plants' : name;
      singleEnquireBtn.href = 'contact.html?category=' + encodeURIComponent(queryVal);
    }
  }

  // Filter button handlers
  subButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      applyFilter(btn.getAttribute('data-filter'), btn);
      openCategory(btn.closest('.category-item'));
      closeSidebar();
    });
  });

  if (allPlantsBtn) {
    allPlantsBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      openCategory(null);
      applyFilter('all', null);
      closeSidebar();
    });
  }

  /* Show all plants by default on initial page load */
  applyFilter('all', null);

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

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (overlay) overlay.classList.remove('open');
    if (!catalogSidebar || !catalogSidebar.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  if (modalImg) {
    modalImg.addEventListener('error', function () {
      modalImg.style.display = 'none';
      modalImgWrap.classList.add('no-img');
    });
  }

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
    if (e.key === 'Escape') {
      closeModal();
      closeSidebar();
    }
  });
})();
