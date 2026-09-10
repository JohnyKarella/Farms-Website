// Testi


(function () {
    const track = document.getElementById('testiTrack');
    const wrap = document.getElementById('carouselWrap');
    const dotsWrap = document.getElementById('testiDots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progFill = document.getElementById('progressFill');
    const section = document.getElementById('testimonials');

    const INTERVAL = 3600;
    const GAP = 20;

    /* avatar fallback */
    track.querySelectorAll('.tc-avatar').forEach(av => {
        const img = av.querySelector('img');
        if (img) img.addEventListener('error', () => {
            img.style.display = 'none';
            av.textContent = av.dataset.initials || '?';
        });
    });

    /* ── Clones ── */
    const origCards = Array.from(track.querySelectorAll('.testi-card'));
    const ORIG = origCards.length;

    function getVisible() {
        const vw = window.innerWidth;
        if (vw >= 1200) return 5;
        if (vw >= 900) return 4;
        if (vw >= 640) return 3;
        if (vw >= 480) return 2;
        return 1;
    }

    function buildClones() {
        track.querySelectorAll('.clone').forEach(c => c.remove());
        const n = Math.max(getVisible(), ORIG);
        origCards.slice(-n).forEach(c => {
            const cl = c.cloneNode(true); cl.classList.add('clone');
            track.insertBefore(cl, track.firstChild);
        });
        origCards.slice(0, n).forEach(c => {
            const cl = c.cloneNode(true); cl.classList.add('clone');
            track.appendChild(cl);
        });
    }

    buildClones();

    /* ── State ── */
    let currentIdx = 0;
    let autoTimer = null;
    let autoStart = null;
    let remainingMs = INTERVAL;
    let isPaused = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragDelta = 0;

    function getCardWidth() { return track.querySelector('.testi-card').getBoundingClientRect().width; }

    function clonesBefore() {
        let n = 0;
        for (const c of track.children) { if (!c.classList.contains('clone')) break; n++; }
        return n;
    }

    /* ── Dots ── */
    function buildDots() {
        dotsWrap.innerHTML = '';
        const pages = Math.ceil(ORIG / getVisible());
        for (let i = 0; i < pages; i++) {
            const d = document.createElement('button');
            d.className = 'testi-dot' + (i === 0 ? ' active' : '');
            d.setAttribute('aria-label', 'Page ' + (i + 1));
            d.addEventListener('click', () => { goTo(i * getVisible()); if (!isPaused) { remainingMs = INTERVAL; startAuto(); } });
            dotsWrap.appendChild(d);
        }
    }

    function updateDots() {
        const page = Math.round(currentIdx / getVisible()) % Math.ceil(ORIG / getVisible());
        dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === page));
    }

    /* ── Translate ── */
    function txFor(idx) { return -((clonesBefore() + idx) * (getCardWidth() + GAP)); }

    function applyTx(tx, animate) {
        track.classList.toggle('no-trans', !animate);
        track.classList.toggle('animating', animate);
        track.style.transform = 'translateX(' + tx + 'px)';
    }

    track.addEventListener('transitionend', () => {
        const cur = new DOMMatrix(getComputedStyle(track).transform).m41;
        const tx = txFor(currentIdx);
        if (Math.abs(cur - tx) > 1) applyTx(tx, false);
    });

    function goTo(idx, animate = true) {
        currentIdx = ((idx % ORIG) + ORIG) % ORIG;
        applyTx(txFor(currentIdx), animate);
        updateDots();
        if (animate) startProgress();
    }

    function next() { goTo(currentIdx + 1); }
    function prev() { goTo(currentIdx - 1); }

    /* ── Progress bar ── */
    function startProgress(dur) {
        const d = dur !== undefined ? dur : INTERVAL;
        progFill.style.transition = 'none';
        progFill.style.width = '0%';
        setTimeout(() => {
            progFill.style.transition = 'width ' + d + 'ms linear';
            progFill.style.width = '100%';
        }, 30);
    }

    function snapshotProgress() {
        /* freeze progress fill at current position */
        const pW = parseFloat(getComputedStyle(progFill).width) || 0;
        const tW = progFill.parentElement.getBoundingClientRect().width || 1;
        const pct = pW / tW * 100;
        progFill.style.transition = 'none';
        progFill.style.width = pct + '%';
        return pct;
    }

    /* ── Auto-play ── */
    function startAuto() {
        clearTimeout(autoTimer);
        autoStart = Date.now();
        autoTimer = setTimeout(() => { next(); remainingMs = INTERVAL; startAuto(); }, remainingMs);
        startProgress(remainingMs);
    }

    function pauseAuto() {
        if (autoStart !== null) {
            const elapsed = Date.now() - autoStart;
            remainingMs = Math.max(0, remainingMs - elapsed);
            autoStart = null;
        }
        clearTimeout(autoTimer);
        autoTimer = null;
        snapshotProgress();
    }

    /* ── Hover pause / resume ── */
    wrap.addEventListener('mouseenter', () => { isPaused = true; pauseAuto(); });
    wrap.addEventListener('mouseleave', () => { isPaused = false; startAuto(); });

    /* ── Drag / swipe ── */
    function onDragStart(x) {
        isDragging = true; dragStartX = x; dragDelta = 0;
        track.classList.add('dragging', 'no-trans');
        track.classList.remove('animating');
        if (!isPaused) pauseAuto();
    }
    function onDragMove(x) {
        if (!isDragging) return;
        dragDelta = x - dragStartX;
        track.style.transform = 'translateX(' + (txFor(currentIdx) + dragDelta) + 'px)';
    }
    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('dragging');
        const threshold = getCardWidth() * 0.25;
        if (dragDelta < -threshold) next();
        else if (dragDelta > threshold) prev();
        else goTo(currentIdx);
        if (!isPaused) { remainingMs = INTERVAL; startAuto(); }
    }

    track.addEventListener('mousedown', e => onDragStart(e.clientX));
    window.addEventListener('mousemove', e => { if (isDragging) onDragMove(e.clientX); });
    window.addEventListener('mouseup', () => { if (isDragging) onDragEnd(); });
    track.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchmove', e => onDragMove(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchend', () => onDragEnd());

    /* ── Arrow buttons ── */
    prevBtn.addEventListener('click', () => { prev(); remainingMs = INTERVAL; if (!isPaused) startAuto(); });
    nextBtn.addEventListener('click', () => { next(); remainingMs = INTERVAL; if (!isPaused) startAuto(); });

    /* ── Keyboard ── */
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') nextBtn.click();
        if (e.key === 'ArrowLeft') prevBtn.click();
    });

    /* ── Resize ── */
    let rTimer;
    window.addEventListener('resize', () => {
        clearTimeout(rTimer);
        rTimer = setTimeout(() => { buildClones(); buildDots(); goTo(currentIdx, false); }, 150);
    });

    /* ── Reveal ── */
    new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) section.classList.add('revealed'); });
    }, { threshold: 0.1 }).observe(section);

    /* ── Init ── */
    buildDots();
    goTo(0, false);
    remainingMs = INTERVAL;
    startAuto();
})();
