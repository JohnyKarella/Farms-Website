// key

(function () {
    const GAP = 22;
    const TOTAL_REAL = 6;
    const track = document.getElementById('agriTrack');
    const dotsWrap = document.getElementById('agriDots');
    const prevBtn = document.getElementById('agriPrev');
    const nextBtn = document.getElementById('agriNext');
    const barEl = document.getElementById('agriBar');
    const currNumEl = document.getElementById('agriCurrNum');
    const totalNumEl = document.getElementById('agriTotalNum');
    const originalTiles = Array.from(document.querySelectorAll('.agri-tile'));

    // The wrapper/viewport that contains the track
    const sliderWrapper = track.parentElement;

    let current = 0;
    let perView = 4;
    let autoTimer;
    let startX = 0;
    let isTransitioning = false;

    const CLONE_COUNT = 4;

    function setupClones() {
        track.innerHTML = '';
        const lastClones = originalTiles.slice(-CLONE_COUNT).map(el => el.cloneNode(true));
        const firstClones = originalTiles.slice(0, CLONE_COUNT).map(el => el.cloneNode(true));
        [...lastClones, ...originalTiles, ...firstClones].forEach(node => track.appendChild(node));
    }

function getPerView() {
    const w = window.innerWidth;

    if (w <= 480) return 1.35;      // show next card partially
    if (w <= 768) return 1.7;       // tablet/mobile
    if (w <= 1024) return 3;
    return 4;
}

    function setWidths() {
        const trackW = sliderWrapper.offsetWidth;
        const tileW = (trackW - GAP * (perView - 1)) / perView;
        const allTiles = track.querySelectorAll('.agri-tile');
        allTiles.forEach(t => { t.style.width = tileW + 'px'; });
        track.style.gap = GAP + 'px';
    }

    function buildDots() {
        dotsWrap.innerHTML = '';
        totalNumEl.textContent = TOTAL_REAL;
        for (let i = 0; i < TOTAL_REAL; i++) {
            const d = document.createElement('button');
            d.className = 'agri-dot' + (i === current ? ' is-active' : '');
            d.addEventListener('click', () => {
                if (isTransitioning) return;
                goTo(i);
                resetAuto();
            });
            dotsWrap.appendChild(d);
        }
    }

    function render(animate) {
        isTransitioning = animate;
        track.style.transition = animate ? 'transform 0.55s cubic-bezier(0.4,0,0.2,1)' : 'none';

        const trackW = sliderWrapper.offsetWidth;
        const tileW = (trackW - GAP * (perView - 1)) / perView;
        const offset = (current + CLONE_COUNT) * (tileW + GAP);

        track.style.transform = `translateX(-${offset}px)`;

        const displayIdx = ((current % TOTAL_REAL) + TOTAL_REAL) % TOTAL_REAL;
        const dots = dotsWrap.querySelectorAll('.agri-dot');
        dots.forEach((d, i) => d.classList.toggle('is-active', i === displayIdx));

        const pct = ((displayIdx + 1) / TOTAL_REAL) * 100;
        barEl.style.width = pct + '%';
        currNumEl.textContent = displayIdx + 1;
    }

    function goTo(idx) {
        current = idx;
        render(true);
    }

    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        // Jump logic for infinite loop
        if (current < 0) {
            current = TOTAL_REAL - 2;
            render(false);
        } else if (current >= TOTAL_REAL) {
            current = 0;
            render(false);
        }
    });

    function resetAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => {
            if (!isTransitioning) goTo(current + 1);
        }, 3500);
    }

    function init() {
        perView = getPerView();
        setupClones();
        setWidths();
        buildDots();
        render(false);

        track.querySelectorAll('.agri-tile').forEach(tile => {
            tile.addEventListener('click', () => {
                if (window.innerWidth <= 700) tile.classList.toggle('is-flipped');
            });
        });
    }

    /* ── Events ── */
    prevBtn.addEventListener('click', () => { if (!isTransitioning) { goTo(current - 1); resetAuto(); } });
    nextBtn.addEventListener('click', () => { if (!isTransitioning) { goTo(current + 1); resetAuto(); } });

    // NEW: Pause on Hover
    sliderWrapper.addEventListener('mouseenter', () => {
        clearInterval(autoTimer);
    });

    // NEW: Resume on Leave
    sliderWrapper.addEventListener('mouseleave', () => {
        resetAuto();
    });

    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40 && !isTransitioning) {
            goTo(current + (diff > 0 ? 1 : -1));
            resetAuto();
        }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            init();
        }, 150);
    });

    init();
    resetAuto();
})();