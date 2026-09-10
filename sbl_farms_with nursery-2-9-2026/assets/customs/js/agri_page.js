// Agritour Page


/* ── IntersectionObserver reveal ── */
function reveal(el, threshold = 0.15) {
    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            el.classList.add('visible');
        }
    }, { threshold }).observe(el);
}

/* heading */
reveal(document.getElementById('heading'), 0.2);

/* collage items — staggered */
const colItems = document.querySelectorAll('.col-item');
const colObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const i = [...colItems].indexOf(entry.target);
            setTimeout(() => entry.target.classList.add('visible'), i * 100);
        }
    });
}, { threshold: 0.1 });
colItems.forEach(c => colObs.observe(c));

/* badge */
reveal(document.getElementById('collageBadge'), 0.1);

/* content column */
reveal(document.getElementById('contentCol'), 0.12);








// FAQ
/* ── Reveal helper ── */
function reveal(el, threshold = 0.15) {
    new IntersectionObserver(([e]) => {
        if (e.isIntersecting) el.classList.add('visible');
    }, { threshold }).observe(el);
}

reveal(document.getElementById('heading'), 0.2);
reveal(document.getElementById('leftCol'), 0.12);
reveal(document.getElementById('bottomStrip'), 0.15);

/* FAQ items staggered */
const items = document.querySelectorAll('.faq-item');
const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const i = [...items].indexOf(entry.target);
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
        }
    });
}, { threshold: 0.08 });
items.forEach(item => obs.observe(item));

/* ── Accordion toggle ── */
items.forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        /* close all */
        items.forEach(i => i.classList.remove('open'));
        /* open clicked unless it was already open */
        if (!isOpen) item.classList.add('open');
    });
});

/* open first item by default */
items[0].classList.add('open');
