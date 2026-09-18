// About us

// Intersection Observer for stat items
const statItems = document.querySelectorAll('.stat-item');
let animated = false;

if (statItems.length > 0) {
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
}

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
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0] && entries[0].isIntersecting && !animated) {
            animated = true;
            document.querySelectorAll('.count-up').forEach(el => {
                animateCounter(el, parseInt(el.dataset.target, 10));
            });
        }
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
}

// icons / card carousel
(function () {
    const viewport = document.getElementById('sliderViewport');
    const track = document.getElementById('sliderTrack');
    const shell = document.getElementById('sliderShell');
    if (!viewport || !track) return;

    // Pause CSS animation on hover
    if (shell) {
        shell.addEventListener('mouseenter', () => {
            shell.classList.add('hovered');
            viewport.classList.add('paused');
        });
        shell.addEventListener('mouseleave', () => {
            shell.classList.remove('hovered');
            viewport.classList.remove('paused');
        });
    }

    // Pause on touch on mobile
    viewport.addEventListener('touchstart', () => {
        viewport.classList.add('paused');
    }, { passive: true });
    viewport.addEventListener('touchend', () => {
        viewport.classList.remove('paused');
    }, { passive: true });

    // Optional manual controls if present in DOM
    const btnPlay = document.getElementById('btnPlay');
    if (btnPlay) {
        btnPlay.addEventListener('click', () => {
            const isPaused = viewport.classList.toggle('paused');
            btnPlay.classList.toggle('is-paused', isPaused);
        });
    }
})();
