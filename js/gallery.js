import { CONFIG } from './config-loader.js';
import { haptic } from './utils.js';

export function initGallery(onFinish) {
  const stage = document.getElementById('gallery-stage');
  const captionEl = document.getElementById('gallery-caption');
  const currentEl = document.getElementById('gallery-current');
  const totalEl = document.getElementById('gallery-total');
  const envelopeGate = document.getElementById('gallery-envelope');
  const swipeHint = document.getElementById('gallery-swipe-hint');
  const galleryFooter = document.getElementById('gallery-footer');
  const galleryHeader = document.querySelector('.gallery-header');
  const galleryTitleEl = document.getElementById('gallery-title');

  const photos = CONFIG.photos;
  let current = 0;
  let card = null;
  let floatAnim = null;

  let dragging = false;
  let dragX = 0, dragY = 0;
  let startX = 0, startY = 0;
  let offsetX = 0, offsetY = 0;
  let velX = 0, velY = 0;
  let lastTouchTime = 0;
  let lastTouchX = 0;

  totalEl.textContent = photos.length;
  if (galleryTitleEl) galleryTitleEl.textContent = CONFIG.galleryTitle || 'то, что я помню';

  function createCard(photo, index) {
    const el = document.createElement('div');
    el.className = 'float-card';
    el.dataset.index = index;

    const inner = document.createElement('div');
    inner.className = 'float-card-inner';

    const img = document.createElement('img');
    img.alt = photo.caption;
    img.draggable = false;

    img.onerror = () => {
      inner.classList.add('placeholder-card');
      inner.style.background = photo.placeholder;
      img.style.display = 'none';
      const hint = document.createElement('span');
      hint.className = 'placeholder-label';
      hint.textContent = `📷 Фото ${index + 1}`;
      inner.appendChild(hint);
    };

    img.src = photo.src;
    inner.appendChild(img);
    el.appendChild(inner);

    const shine = document.createElement('div');
    shine.className = 'float-card-shine';
    el.appendChild(shine);

    return el;
  }

  function applyTransform(x, y, rot, scale = 1) {
    if (!card) return;
    card.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
  }

  function startFloat() {
    if (floatAnim) cancelAnimationFrame(floatAnim);
    const start = performance.now();

    function float(t) {
      if (dragging || !card) return;
      const elapsed = (t - start) * 0.001;
      const fy = Math.sin(elapsed * 1.2) * 6;
      const fx = Math.sin(elapsed * 0.8) * 3;
      const rot = Math.sin(elapsed * 0.6) * 0.8;
      applyTransform(fx, fy, rot);
      floatAnim = requestAnimationFrame(float);
    }
    floatAnim = requestAnimationFrame(float);
  }

  function showCard(index) {
    if (floatAnim) cancelAnimationFrame(floatAnim);
    stage.querySelectorAll('.float-card').forEach((c) => c.remove());

    current = index;
    card = createCard(photos[index], index);
    stage.appendChild(card);

    card.style.opacity = '0';
    card.style.transform = 'translate(0, 30px) scale(0.95)';
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 0.45s ease, transform 0.5s cubic-bezier(0.34,1.2,0.64,1)';
      card.style.opacity = '1';
      card.style.transform = 'translate(0, 0) rotate(0deg) scale(1)';
      setTimeout(() => {
        card.style.transition = '';
        startFloat();
      }, 600);
    });

    currentEl.textContent = index + 1;
    captionEl.textContent = photos[index].caption;

    if (index === photos.length - 1) {
      swipeHint.textContent = 'смахни — и откроется письмо ♥';
    } else {
      swipeHint.textContent = 'смахни в сторону — следующий кадр';
    }
  }

  function flingAway(dx, dy) {
    if (!card) return;
    dragging = false;
    if (floatAnim) cancelAnimationFrame(floatAnim);

    const angle = Math.atan2(dy, dx);
    const dist = 800;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const rot = (dx / window.innerWidth) * 60;

    card.style.transition = 'transform 0.55s cubic-bezier(0.4, 0, 0.6, 1), opacity 0.55s ease';
    card.style.opacity = '0';
    applyTransform(tx, ty, rot, 0.6);
    haptic('light');

    setTimeout(() => {
      if (current < photos.length - 1) {
        showCard(current + 1);
      } else {
        showEnvelope();
      }
    }, 500);
  }

  function showEnvelope() {
    if (floatAnim) cancelAnimationFrame(floatAnim);
    stage.innerHTML = '';
    card = null;
    stage.classList.add('hidden');
    galleryFooter.classList.add('hidden');
    galleryHeader.classList.add('hidden');
    envelopeGate.classList.remove('hidden');
    requestAnimationFrame(() => envelopeGate.classList.add('visible'));
  }

  function onPointerDown(x, y) {
    if (!card) return;
    dragging = true;
    if (floatAnim) cancelAnimationFrame(floatAnim);
    startX = x;
    startY = y;
    offsetX = dragX;
    offsetY = dragY;
    card.style.transition = '';
    card.style.cursor = 'grabbing';
  }

  function onPointerMove(x, y) {
    if (!dragging || !card) return;
    dragX = offsetX + (x - startX);
    dragY = offsetY + (y - startY);
    const rot = dragX * 0.06;
    applyTransform(dragX, dragY, rot);
  }

  function onPointerUp(x, y, velocityX) {
    if (!dragging || !card) return;
    dragging = false;
    card.style.cursor = 'grab';

    const dx = x - startX;
    const dy = y - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (Math.abs(velocityX) > 0.5 || dist > 80) {
      flingAway(dx + velocityX * 80, dy);
      dragX = 0;
      dragY = 0;
      return;
    }

    card.style.transition = 'transform 0.4s cubic-bezier(0.34,1.4,0.64,1)';
    dragX = 0;
    dragY = 0;
    applyTransform(0, 0, 0);
    setTimeout(startFloat, 400);
  }

  stage.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', (e) => {
    const vx = (e.clientX - lastTouchX) / Math.max(1, performance.now() - lastTouchTime);
    onPointerUp(e.clientX, e.clientY, vx);
  });

  stage.addEventListener('touchstart', (e) => {
    lastTouchTime = performance.now();
    lastTouchX = e.touches[0].clientX;
    onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const now = performance.now();
    const vx = (t.clientX - lastTouchX) / Math.max(1, now - lastTouchTime);
    onPointerUp(t.clientX, t.clientY, vx * 12);
  }, { passive: true });

  envelopeGate.addEventListener('click', openLetter);
  envelopeGate.addEventListener('touchend', (e) => {
    e.preventDefault();
    openLetter();
  });

  function openLetter() {
    if (envelopeGate.classList.contains('opening')) return;
    haptic('success');
    envelopeGate.classList.add('opening');
    setTimeout(onFinish, 1100);
  }

  showCard(0);
}
