export function initButterflies(container) {
  const canvas = document.createElement('canvas');
  canvas.className = 'butterflies-canvas';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const butterflies = [];
  const COUNT = 6;

  function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  function createButterfly() {
    const colors = [
      { wing: '#ff8ec8', body: '#c9185b' },
      { wing: '#ffb3e6', body: '#e0408a' },
      { wing: '#ffc8f0', body: '#d03070' },
      { wing: '#ffaad4', body: '#b81858' },
    ];
    const c = colors[Math.floor(Math.random() * colors.length)];
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      angle: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      size: 6 + Math.random() * 8,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 0.12 + Math.random() * 0.08,
      wander: Math.random() * 0.02,
      color: c,
      targetAngle: Math.random() * Math.PI * 2,
      changeTimer: 0,
    };
  }

  for (let i = 0; i < COUNT; i++) butterflies.push(createButterfly());

  function drawButterfly(b) {
    const wingOpen = Math.abs(Math.sin(b.wingPhase)) * 0.8 + 0.2;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    ctx.scale(b.size / 10, b.size / 10);

    ctx.fillStyle = b.color.wing;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(-5, 0, 5, 3.5 * wingOpen, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 0, 5, 3.5 * wingOpen, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = b.color.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  let animId;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const b of butterflies) {
      b.wingPhase += b.wingSpeed;
      b.changeTimer--;
      if (b.changeTimer <= 0) {
        b.targetAngle = Math.random() * Math.PI * 2;
        b.changeTimer = 80 + Math.random() * 120;
      }

      let da = b.targetAngle - b.angle;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      b.angle += da * 0.02 + (Math.random() - 0.5) * b.wander;

      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;

      if (b.x < -20) b.x = canvas.width + 20;
      if (b.x > canvas.width + 20) b.x = -20;
      if (b.y < -20) b.y = canvas.height + 20;
      if (b.y > canvas.height + 20) b.y = -20;

      drawButterfly(b);
    }

    animId = requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener('resize', resize);

  return () => {
    cancelAnimationFrame(animId);
    canvas.remove();
    window.removeEventListener('resize', resize);
  };
}
