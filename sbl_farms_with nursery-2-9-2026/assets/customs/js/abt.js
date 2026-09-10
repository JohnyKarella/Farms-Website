// About us

// Intersection Observer for stat items
const statItems = document.querySelectorAll('.stat-item');
let animated = false;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

statItems.forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.12}s`;
    observer.observe(item);
});

// Counter animation
function animateCounter(el, target, duration = 1800) {
    const start = performance.now();
    const step = (timestamp) => {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current >= 1000 ? (current >= 10000 ? current.toLocaleString() : current.toLocaleString()) : current;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
}

const statsSection = document.querySelector('.stats-grid');
const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !animated) {
        animated = true;
        document.querySelectorAll('.count-up').forEach(el => {
            animateCounter(el, parseInt(el.dataset.target));
        });
    }
}, { threshold: 0.3 });

statsObserver.observe(statsSection);




// icons

(function () {

    /* ── config ── */
    const GAP = 20;    // px — must match CSS gap
    const STEP_MS = 500;   // manual step animation duration
    const SPEED_PX_S = 60;    // auto-scroll pixels per second
    const DOTS_COUNT = 5;     // number of progress dots

    /* ── refs ── */
    const viewport = document.getElementById('sliderViewport');
    const track = document.getElementById('sliderTrack');
    const shell = document.getElementById('sliderShell');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnPlay = document.getElementById('btnPlay');
    const dotRow = document.getElementById('dotRow');

    /* ── state ── */
    let paused = true;     // user-paused (button)
    let hovering = false;     // hover-paused
    let offset = 0;         // current translateX (px), always negative
    let rafId = null;
    let lastTs = null;
    let manualBusy = false;

    /* ── 1. Clone cards for infinite loop ── */
    function buildTrack() {
        const origCards = Array.from(track.children);
        // duplicate twice so loop always has cards ahead
        origCards.forEach(c => track.appendChild(c.cloneNode(true)));
        origCards.forEach(c => track.appendChild(c.cloneNode(true)));
    }
    buildTrack();

    /* ── 2. Card width (responsive) ── */
    function cardW() {
        const c = track.firstElementChild;
        return c ? c.getBoundingClientRect().width : 200;
    }

    /* ── 3. How far one full "page" is ── */
    function pageW() {
        const vw = viewport.getBoundingClientRect().width;
        const cw = cardW() + GAP;
        return Math.round(vw / cw) * cw;   // snap to whole cards
    }

    /* ── 4. Total width of ONE original set ── */
    function origSetW() {
        const origCount = track.children.length / 3; // we cloned ×2
        return origCount * (cardW() + GAP);
    }

    /* ── 5. Clamp offset for infinite scroll ── */
    function clamp() {
        const setW = origSetW();
        // if we've scrolled a full set, jump back silently
        if (Math.abs(offset) >= setW) {
            offset += setW;               // reset without visual jump
        }
        // never scroll right of 0
        if (offset > 0) offset = 0;
    }

    /* ── 6. Apply transform ── */
    function apply(smooth) {
        track.style.transition = smooth ? `transform ${STEP_MS}ms cubic-bezier(.4,0,.2,1)` : 'none';
        track.style.transform = `translateX(${offset}px)`;
    }

    /* ── 7. Auto-scroll RAF loop ── */
    function loop(ts) {
        if (!lastTs) lastTs = ts;
        const dt = ts - lastTs;
        lastTs = ts;

        if (!paused && !hovering) {
            offset -= (SPEED_PX_S * dt) / 1000;
            clamp();
            apply(false);
            updateDots();
        }

        rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    /* ── 8. Manual step ── */
    function step(dir) {
        if (manualBusy) return;
        manualBusy = true;
        const wasRunning = !paused && !hovering;
        // briefly pause auto
        paused = true;

        offset += dir * pageW();
        clamp();
        apply(true);
        updateDots();

        setTimeout(() => {
            manualBusy = false;
            if (wasRunning) paused = false;
        }, STEP_MS + 50);
    }

    btnPrev.addEventListener('click', () => step(+1));   // right = backward
    btnNext.addEventListener('click', () => step(-1));   // left  = forward

    /* ── 9. Play / Pause button ── */
    btnPlay.addEventListener('click', () => {
        paused = !paused;
        btnPlay.classList.toggle('is-paused', paused);
        if (!paused) lastTs = null;
    });

    /* ── 10. Hover pause ── */
    shell.addEventListener('mouseenter', () => {
        hovering = true;
        shell.classList.add('hovered');
        viewport.classList.add('paused');
    });
    shell.addEventListener('mouseleave', () => {
        hovering = false;
        shell.classList.remove('hovered');
        viewport.classList.remove('paused');
        lastTs = null;
    });

    /* ── 11. Touch swipe ── */
    let touchStartX = 0;
    viewport.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    viewport.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) step(dx > 0 ? +1 : -1);
    }, { passive: true });

    /* ── 12. Drag to scroll ── */
    let dragStartX = 0;
    let dragging = false;
    let dragOffset = 0;

    track.addEventListener('mousedown', e => {
        dragging = true;
        dragStartX = e.clientX;
        dragOffset = offset;
        paused = true;
        track.style.transition = 'none';
    });
    window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const dx = e.clientX - dragStartX;
        offset = dragOffset - dx;
        clamp();
        apply(false);
        updateDots();
    });
    window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        // snap to nearest card
        const cw = cardW() + GAP;
        offset = Math.round(offset / cw) * cw;
        clamp();
        apply(true);
        if (!btnPlay.classList.contains('is-paused')) {
            setTimeout(() => { paused = false; lastTs = null; }, STEP_MS + 50);
        }
    });

    /* ── 13. Dots ── */
    const dots = [];
    for (let i = 0; i < DOTS_COUNT; i++) {
        const d = document.createElement('button');
        d.className = 'sdot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', `Go to slide ${i + 1}`);
        d.addEventListener('click', () => {
            const setW = origSetW();
            const frac = i / DOTS_COUNT;
            offset = -setW * frac;
            clamp();
            apply(true);
            updateDots();
        });
        dotRow.appendChild(d);
        dots.push(d);
    }

    function updateDots() {
        const setW = origSetW();
        const frac = Math.abs(offset) / setW;
        const active = Math.floor(frac * DOTS_COUNT) % DOTS_COUNT;
        dots.forEach((d, i) => d.classList.toggle('active', i === active));
    }

    /* ── 14. Keyboard ── */
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') step(+1);
        if (e.key === 'ArrowRight') step(-1);
        if (e.key === ' ') { e.preventDefault(); btnPlay.click(); }
    });

    /* ── 15. Recalc on resize ── */
    window.addEventListener('resize', () => {
        offset = 0;
        apply(false);
        lastTs = null;
    });

})();











// MEET
