// greenwall


const statBoxes = document.querySelectorAll('.stat-box');
let counted = false;

function animateCount(el, target, dur = 1600) {
    const start = performance.now();
    const step = ts => {
        const p = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
}

const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    if (!counted && entries.some(e => e.isIntersecting)) {
        counted = true;
        document.querySelectorAll('.counter').forEach(el => animateCount(el, +el.dataset.target));
    }
}, { threshold: 0.25 });
statBoxes.forEach(b => io.observe(b));

const modal = document.getElementById('modal');
const iframe = document.getElementById('modalIframe');

function openModal() {
    iframe.src = 'https://www.youtube.com/embed/9Rr3U9-5TF8?autoplay=1';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
    document.body.style.overflow = '';
}

document.getElementById('playBtn').addEventListener('click', openModal);
document.getElementById('videoThumb').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
