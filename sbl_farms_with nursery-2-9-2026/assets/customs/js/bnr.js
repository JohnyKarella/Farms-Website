// Banner and Gallery

// ════ SLIDER ════
const TOTAL = 4;
const INTERVAL = 3000;
let current = 0;
let autoTimer;
let startX = 0;

const dotsContainer = document.getElementById('slideDots');
const progressFill = document.getElementById('progressFill');

// build dots
for (let i = 0; i < TOTAL; i++) {
    const d = document.createElement('div');
    d.className = 'sdot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsContainer.appendChild(d);
}

function goTo(n) {
    document.getElementById('slide' + current).classList.remove('active');
    current = (n + TOTAL) % TOTAL;
    document.getElementById('slide' + current).classList.add('active');
    document.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('active', i === current));
    // reset progress bar
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            progressFill.style.transition = `width ${INTERVAL}ms linear`;
            progressFill.style.width = '100%';
        });
    });
}

function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), INTERVAL);
}

document.getElementById('arrowLeft').addEventListener('click', () => { goTo(current - 1); resetTimer(); });
document.getElementById('arrowRight').addEventListener('click', () => { goTo(current + 1); resetTimer(); });

// touch swipe
const sw = document.getElementById('slidesWrap');
sw.addEventListener('touchstart', e => { startX = e.touches[0].clientX }, { passive: true });
sw.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { goTo(dx < 0 ? current + 1 : current - 1); resetTimer(); }
});

// keyboard
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { goTo(current - 1); resetTimer(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); resetTimer(); }
});

goTo(0); resetTimer();

// ════ SCROLL SHRINK + PARALLAX ════
const bannerSection = document.getElementById('bannerSection');
const bannerSticky = document.getElementById('bannerSticky');
const slideBgs = document.querySelectorAll('.slide-bg');

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const sectionH = bannerSection.offsetHeight;
            const vh = window.innerHeight;

            // parallax — moves bg upward as you scroll
            const parallaxOffset = scrollY * 0.35;
            slideBgs.forEach(bg => {
                bg.style.transform = `translateY(${parallaxOffset}px)`;
            });

            // shrink pill: once scrolled past 10vh
            if (scrollY > vh * 0.08) {
                bannerSticky.classList.add('shrunk');
            } else {
                bannerSticky.classList.remove('shrunk');
            }

            ticking = false;
        });
        ticking = true;
    }
});

// ════ MOSAIC GALLERY ════
const mosaicItems = document.querySelectorAll('.mosaic-item');
const mio = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const idx = Array.from(mosaicItems).indexOf(e.target);
            setTimeout(() => e.target.classList.add('visible'), idx * 60);
        }
    });
}, { threshold: .1 });
mosaicItems.forEach(i => mio.observe(i));

// lightbox
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const imgs = Array.from(mosaicItems).map(i => i.querySelector('img'));
let lbCurrent = 0;

mosaicItems.forEach((item, i) => {
    item.addEventListener('click', () => {
        lbCurrent = i;
        lbImg.src = imgs[i].src;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
});

function lbClose() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
function lbGo(d) {
    lbCurrent = (lbCurrent + d + imgs.length) % imgs.length;
    lbImg.src = imgs[lbCurrent].src;
}

document.getElementById('lbClose').addEventListener('click', lbClose);
document.getElementById('lbPrev').addEventListener('click', () => lbGo(-1));
document.getElementById('lbNext').addEventListener('click', () => lbGo(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) lbClose(); });
document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbGo(-1);
    if (e.key === 'ArrowRight') lbGo(1);
});
