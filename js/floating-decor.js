/** Плавающие сердечки и бабочки для декора сцен */
export function initFloatingDecor(container, options = {}) {
  const {
    hearts = 5,
    butterflies = 4,
    emojis = ['♥', '♡', '✿'],
  } = options;

  const wrap = document.createElement('div');
  wrap.className = 'floating-decor';
  container.appendChild(wrap);

  const items = [];

  for (let i = 0; i < hearts; i++) {
    const el = document.createElement('span');
    el.className = 'float-deco float-deco-heart';
    el.textContent = emojis[i % emojis.length];
    el.style.left = `${8 + Math.random() * 84}%`;
    el.style.top = `${10 + Math.random() * 80}%`;
    el.style.fontSize = `${10 + Math.random() * 14}px`;
    el.style.animationDuration = `${4 + Math.random() * 4}s`;
    el.style.animationDelay = `${Math.random() * 3}s`;
    wrap.appendChild(el);
    items.push(el);
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'float-deco-canvas';
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const bugs = Array.from({ length: butterflies }, () => ({
    x: Math.random() * 300,
    y: Math.random() * 400,
    angle: Math.random() * Math.PI * 2,
    speed: 0.25 + Math.random() * 0.35,
    size: 5 + Math.random() * 6,
    wing: Math.random() * Math.PI * 2,
    color: ['#ff8ec8', '#ffb3e6', '#ff6b9d'][Math.floor(Math.random() * 3)],
  }));

  function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    bugs.forEach((b) => {
      b.x = Math.random() * canvas.width;
      b.y = Math.random() * canvas.height;
    });
  }

  function drawBug(b) {
    const wing = Math.abs(Math.sin(b.wing)) * 0.75 + 0.25;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.ellipse(-4, 0, 4, 3 * wing, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, 0, 4, 3 * wing, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  let animId;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const b of bugs) {
      b.wing += 0.14;
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;
      if (b.x < -20) b.x = canvas.width + 20;
      if (b.x > canvas.width + 20) b.x = -20;
      if (b.y < -20) b.y = canvas.height + 20;
      if (b.y > canvas.height + 20) b.y = -20;
      drawBug(b);
    }
    animId = requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener('resize', resize);

  return () => {
    cancelAnimationFrame(animId);
    wrap.remove();
    window.removeEventListener('resize', resize);
  };
}
