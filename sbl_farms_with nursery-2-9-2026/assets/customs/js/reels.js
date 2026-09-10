// Footer



    /* Firefly particles */
    const canvas = document.getElementById('fc');
    const ctx = canvas.getContext('2d');
    let W, H, pts = [];

    const resize = () => {
      const f = document.getElementById('footer');
      W = canvas.width = f.offsetWidth;
      H = canvas.height = f.offsetHeight;
    };
    const init = () => {
      pts = Array.from({ length: 55 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.8 + .4,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        a: Math.random(), da: (Math.random() * .012 + .004) * (Math.random() < .5 ? 1 : -1),
        gold: Math.random() < .65
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.a += p.da;
        if (p.a <= 0 || p.a >= 1) p.da *= -1;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? '#c9a84c' : '#3a7a4e';
        ctx.globalAlpha = Math.max(0, Math.min(1, p.a));
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    window.addEventListener('resize', () => { resize(); init(); });

    /* Entrance animations */
    const targets = document.querySelectorAll('[data-anim]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, dir = el.dataset.anim;
        const tx = dir === 'fade-left' ? '-28px' : dir === 'fade-right' ? '28px' : '0px';
        const ty = dir === 'fade-up' ? '28px' : '0px';
        el.style.cssText = `opacity:0;transform:translate(${tx},${ty})`;
        requestAnimationFrame(() => {
          el.style.transition = 'opacity .7s ease, transform .7s ease';
          el.style.opacity = '1'; el.style.transform = 'translate(0,0)';
        });
        io.unobserve(el);
      });
    }, { threshold: .15 });
    targets.forEach(t => io.observe(t));

    /* Scroll-to-top */
    const btn = document.getElementById('st');
    window.addEventListener('scroll', () => btn.classList.toggle('show', scrollY > 200));


    