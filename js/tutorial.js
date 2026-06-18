import { haptic } from './utils.js';

const STEPS = [
  {
    text: 'Нажми на клетку — она откроется',
    action: 'tap',
    cell: [1, 1],
  },
  {
    text: 'Цифра показывает, сколько мин рядом',
    action: 'reveal-number',
    cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
    highlight: [1, 1],
    number: 1,
  },
  {
    text: 'Удержи палец — поставишь флажок 🚩',
    action: 'flag',
    cell: [2, 3],
  },
  {
    text: 'Открой все безопасные клетки — и сюрприз твой!',
    action: 'done',
  },
];

const DEMO = [
  [0, 0, 0, -1, 0],
  [0, 1, 1,  1, 0],
  [0, 1, -1, 1, 0],
  [0, 1, 1,  1, 0],
  [0, 0, 0,  0, 0],
];

export function initTutorial() {
  const overlay = document.getElementById('tutorial-overlay');
  const grid = document.getElementById('tutorial-grid');
  const textEl = document.getElementById('tutorial-text');
  const finger = document.getElementById('tutorial-finger');
  const closeBtn = document.getElementById('tutorial-close');
  const openBtn = document.getElementById('tutorial-btn');
  const stepDots = document.getElementById('tutorial-dots');

  if (!overlay) return;

  let step = 0;
  let animTimer = null;

  function buildDemoGrid() {
    grid.innerHTML = '';
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const tile = document.createElement('div');
        tile.className = 'tut-tile hidden-tile';
        tile.dataset.r = r;
        tile.dataset.c = c;
        grid.appendChild(tile);
      }
    }
  }

  function getTile(r, c) {
    return grid.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  }

  function tilePos(r, c) {
    const tile = getTile(r, c);
    const gridRect = grid.getBoundingClientRect();
    const tileRect = tile.getBoundingClientRect();
    return {
      x: tileRect.left - gridRect.left + tileRect.width / 2,
      y: tileRect.top - gridRect.top + tileRect.height / 2,
    };
  }

  function moveFinger(r, c, longPress = false) {
    const pos = tilePos(r, c);
    finger.style.left = `${pos.x}px`;
    finger.style.top = `${pos.y}px`;
    finger.classList.toggle('pressing', longPress);
    finger.classList.remove('hidden');
  }

  function hideFinger() {
    finger.classList.add('hidden');
    finger.classList.remove('pressing');
  }

  function resetGrid() {
    grid.querySelectorAll('.tut-tile').forEach((t) => {
      t.className = 'tut-tile hidden-tile';
      t.textContent = '';
    });
  }

  function updateDots() {
    stepDots.innerHTML = STEPS.map((_, i) =>
      `<span class="tut-dot${i === step ? ' active' : ''}"></span>`
    ).join('');
  }

  function runStep() {
    clearTimeout(animTimer);
    resetGrid();
    hideFinger();
    const s = STEPS[step];
    textEl.textContent = s.text;
    updateDots();

    if (s.action === 'tap') {
      animTimer = setTimeout(() => {
        moveFinger(s.cell[0], s.cell[1]);
        animTimer = setTimeout(() => {
          const tile = getTile(s.cell[0], s.cell[1]);
          tile.classList.remove('hidden-tile');
          tile.classList.add('revealed');
          hideFinger();
          floodDemo(s.cell[0], s.cell[1]);
        }, 700);
      }, 400);
    }

    if (s.action === 'reveal-number') {
      s.cells.forEach(([r, c]) => {
        const tile = getTile(r, c);
        tile.classList.remove('hidden-tile');
        tile.classList.add('revealed');
        const v = DEMO[r][c];
        if (v > 0) tile.innerHTML = `<span class="num-${v}">${v}</span>`;
      });
      const hl = getTile(s.highlight[0], s.highlight[1]);
      hl.classList.add('tut-highlight');
      animTimer = setTimeout(() => {
        moveFinger(s.highlight[0], s.highlight[1]);
      }, 500);
    }

    if (s.action === 'flag') {
      animTimer = setTimeout(() => {
        moveFinger(s.cell[0], s.cell[1], true);
        animTimer = setTimeout(() => {
          const tile = getTile(s.cell[0], s.cell[1]);
          tile.classList.add('flagged');
          hideFinger();
        }, 900);
      }, 400);
    }

    if (s.action === 'done') {
      grid.querySelectorAll('.tut-tile').forEach((t, i) => {
        const r = Math.floor(i / 5), c = i % 5;
        const v = DEMO[r][c];
        t.classList.remove('hidden-tile', 'flagged');
        t.classList.add('revealed');
        if (v === -1) t.textContent = '💣';
        else if (v > 0) t.innerHTML = `<span class="num-${v}">${v}</span>`;
      });
      closeBtn.textContent = step === STEPS.length - 1 ? 'Поехали! ♥' : 'Дальше';
    } else {
      closeBtn.textContent = 'Дальше';
    }
  }

  function floodDemo(r, c) {
    if (r < 0 || r >= 5 || c < 0 || c >= 5) return;
    const tile = getTile(r, c);
    if (!tile || tile.classList.contains('revealed')) return;
    const v = DEMO[r][c];
    if (v === -1) return;
    tile.classList.remove('hidden-tile');
    tile.classList.add('revealed');
    if (v > 0) {
      tile.innerHTML = `<span class="num-${v}">${v}</span>`;
      return;
    }
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr || dc) floodDemo(r + dr, c + dc);
      }
    }
  }

  function open() {
    step = 0;
    overlay.classList.remove('hidden');
    buildDemoGrid();
    requestAnimationFrame(runStep);
    haptic('light');
  }

  function close() {
    overlay.classList.add('hidden');
    clearTimeout(animTimer);
  }

  function next() {
    if (step < STEPS.length - 1) {
      step++;
      runStep();
      haptic('light');
    } else {
      close();
    }
  }

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', next);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  buildDemoGrid();
}
