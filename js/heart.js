export function initStars(canvas) {
  const ctx = canvas.getContext('2d');
  let stars = [];
  let animId;
  let warp = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() * 0.001;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (const s of stars) {
      let x = s.x;
      let y = s.y;

      if (warp > 0) {
        const dx = x - cx;
        const dy = y - cy;
        const factor = 1 + warp * 0.012;
        x = cx + dx * factor;
        y = cy + dy * factor;
      }

      const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed * 3 + s.twinkle));
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 240, ${a * s.alpha})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);

  return {
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    },
    setWarp: (v) => { warp = v; },
  };
}

export function initHeartIntro(onComplete) {
  const container = document.getElementById('heart-container');
  const overlay = document.getElementById('fly-overlay');
  const scene = document.getElementById('scene-intro');
  const hint = document.querySelector('.intro-hint');
  const nebulas = scene.querySelectorAll('.nebula');
  let flying = false;
  let starsCtrl = null;

  function flyIn(e) {
    if (flying) return;
    flying = true;
    if (e) e.preventDefault();

    hint?.classList.add('fade-out');
    nebulas.forEach((n) => n.classList.add('fade-out'));

    container.classList.add('flying');

    let warp = 0;
    const warpInterval = setInterval(() => {
      warp += 0.04;
      starsCtrl?.setWarp?.(warp);
      if (warp >= 1) clearInterval(warpInterval);
    }, 50);

    setTimeout(() => {
      overlay.classList.remove('hidden');
      requestAnimationFrame(() => overlay.classList.add('active'));
    }, 900);

    setTimeout(() => {
      scene.classList.add('exiting');
      onComplete();

      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.classList.remove('active', 'fade-out');
          overlay.classList.add('hidden');
        }, 900);
      }, 400);
    }, 2400);
  }

  const sceneEl = document.getElementById('scene-intro');
  sceneEl.addEventListener('click', flyIn);

  let touchMoved = false;
  sceneEl.addEventListener('touchstart', () => { touchMoved = false; }, { passive: true });
  sceneEl.addEventListener('touchmove', () => { touchMoved = true; }, { passive: true });
  sceneEl.addEventListener('touchend', (e) => {
    if (!touchMoved) {
      e.preventDefault();
      flyIn(e);
    }
  });

  return { setStarsCtrl: (ctrl) => { starsCtrl = ctrl; } };
}
