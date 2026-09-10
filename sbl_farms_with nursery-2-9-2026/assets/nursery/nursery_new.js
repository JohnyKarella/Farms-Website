
(function(){
  var grid = document.getElementById('catalogGrid');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.plant-card'));
  var filterButtons = document.querySelectorAll('#filterList button');
  var filterSelect = document.getElementById('filterSelect');
  var emptyState = document.getElementById('emptyState');

  function applyFilter(value){
    var visibleCount = 0;
    cards.forEach(function(card){
      var match = card.getAttribute('data-category') === value;
      card.style.display = match ? '' : 'none';
      if(match) visibleCount++;
    });
    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';

    filterButtons.forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-filter') === value);
    });
    filterSelect.value = value;
  }

  filterButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  filterSelect.addEventListener('change', function(){
    applyFilter(filterSelect.value);
  });

  /* Start on the first tab (Palm Trees) */
  applyFilter('palm');

  /* Fallback icon if an image fails to load */
  grid.querySelectorAll('.thumb-wrap img').forEach(function(img){
    img.addEventListener('error', function(){
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
  var modalBotanical = document.getElementById('modalBotanical');
  var modalDesc = document.getElementById('modalDesc');
  var modalHeight = document.getElementById('modalHeight');
  var modalSun = document.getElementById('modalSun');
  var modalWater = document.getElementById('modalWater');
  var modalClose = document.getElementById('modalClose');

  function openModal(card){
    modalImgWrap.classList.remove('no-img');
    modalImg.style.display = '';
    modalImg.src = card.getAttribute('data-img');
    modalImg.alt = card.getAttribute('data-name');
    modalCategory.textContent = card.getAttribute('data-category-label');
    modalName.textContent = card.getAttribute('data-name');
    modalBotanical.textContent = card.getAttribute('data-botanical');
    modalDesc.textContent = card.getAttribute('data-desc');
    modalHeight.textContent = card.getAttribute('data-height');
    modalSun.textContent = card.getAttribute('data-sun');
    modalWater.textContent = card.getAttribute('data-water');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  modalImg.addEventListener('error', function(){
    modalImg.style.display = 'none';
    modalImgWrap.classList.add('no-img');
  });

  cards.forEach(function(card){
    card.addEventListener('click', function(){
      openModal(card);
    });
  });

  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeModal();
  });
})();
