// Gallery

/* ── Scroll-reveal ── */
const items = document.querySelectorAll('.mosaic-item');
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const idx = Array.from(items).indexOf(e.target);
            setTimeout(() => e.target.classList.add('visible'), idx * 55);
            observer.unobserve(e.target);
        }
    });
}, { threshold: .08 });
items.forEach(i => observer.observe(i));

/* ── Lightbox ── */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCounter = document.getElementById('lbCounter');
const imgs = Array.from(items).map(i => i.querySelector('img'));
let current = 0;

function lbOpen(i) {
    current = i;
    lbImg.src = imgs[i].src.replace(/w=\d+/, 'w=1600');
    lbCounter.textContent = `${i + 1} / ${imgs.length}`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function lbClose() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

function lbGo(dir) {
    current = (current + dir + imgs.length) % imgs.length;
    lbImg.style.animation = 'none';
    lbImg.offsetHeight; // reflow
    lbImg.style.animation = '';
    lbImg.src = imgs[current].src.replace(/w=\d+/, 'w=1600');
    lbCounter.textContent = `${current + 1} / ${imgs.length}`;
}

items.forEach((item, i) => item.addEventListener('click', () => lbOpen(i)));

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

/* touch swipe in lightbox */
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX }, { passive: true });
lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) lbGo(dx < 0 ? 1 : -1);
});



// New Gallery
