import { CONFIG } from './config-loader.js';
import { haptic } from './utils.js';

const SIZE = CONFIG.minesweeper.size;
const MINES = CONFIG.minesweeper.mines;
const DX = [-1, -1, -1, 0, 0, 1, 1, 1];
const DY = [-1, 0, 1, -1, 1, -1, 0, 1];

export function initMinesweeper(onWin) {
  const grid = document.getElementById('minesweeper-grid');
  const minesLeftEl = document.getElementById('ms-mines-left');
  const timerEl = document.getElementById('ms-timer');
  const resetBtn = document.getElementById('ms-reset');
  const winOverlay = document.getElementById('ms-win-overlay');
  const continueBtn = document.getElementById('ms-continue');

  let board = [];
  let revealed = [];
  let flagged = [];
  let gameOver = false;
  let won = false;
  let firstClick = true;
  let flagsLeft = MINES;
  let timer = 0;
  let timerInterval = null;

  function idx(r, c) { return r * SIZE + c; }

  function createBoard(safeR, safeC) {
    board = Array(SIZE * SIZE).fill(0);
    revealed = Array(SIZE * SIZE).fill(false);
    flagged = Array(SIZE * SIZE).fill(false);

    const safe = new Set();
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = safeR + dr, nc = safeC + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
          safe.add(idx(nr, nc));
        }
      }
    }

    let placed = 0;
    while (placed < MINES) {
      const pos = Math.floor(Math.random() * SIZE * SIZE);
      if (!safe.has(pos) && board[pos] !== -1) {
        board[pos] = -1;
        placed++;
      }
    }

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const i = idx(r, c);
        if (board[i] === -1) continue;
        let count = 0;
        for (let d = 0; d < 8; d++) {
          const nr = r + DY[d], nc = c + DX[d];
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[idx(nr, nc)] === -1) {
            count++;
          }
        }
        board[i] = count;
      }
    }
  }

  function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      timer++;
      const m = Math.floor(timer / 60);
      const s = timer % 60;
      timerEl.textContent = `⏱ ${m}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateMinesLeft() {
    minesLeftEl.textContent = `💣 ${flagsLeft}`;
  }

  function revealCell(r, c) {
    const i = idx(r, c);
    if (revealed[i] || flagged[i] || gameOver) return;

    if (firstClick) {
      createBoard(r, c);
      firstClick = false;
      startTimer();
    }

    revealed[i] = true;
    const tile = grid.children[i];

    if (board[i] === -1) {
      tile.classList.remove('hidden-tile');
      tile.classList.add('revealed', 'mine-hit');
      tile.textContent = '💣';
      gameOver = true;
      stopTimer();
      haptic('error');
      revealAllMines(i);
      setTimeout(() => resetGame(), 1500);
      return;
    }

    tile.classList.remove('hidden-tile');
    tile.classList.add('revealed');

    if (board[i] > 0) {
      tile.innerHTML = `<span class="num-${board[i]}">${board[i]}</span>`;
    } else {
      floodFill(r, c);
    }

    haptic('light');
    checkWin();
  }

  function floodFill(r, c) {
    for (let d = 0; d < 8; d++) {
      const nr = r + DY[d], nc = c + DX[d];
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        revealCell(nr, nc);
      }
    }
  }

  function revealAllMines(hitIdx) {
    for (let i = 0; i < SIZE * SIZE; i++) {
      if (board[i] === -1) {
        const tile = grid.children[i];
        tile.classList.remove('hidden-tile');
        tile.classList.add('revealed');
        if (i !== hitIdx) tile.textContent = '💣';
      }
    }
  }

  function toggleFlag(r, c, source = '') {
    if (gameOver || won) return;
    const i = idx(r, c);
    if (revealed[i]) return;

    const now = Date.now();
    if (source && now < flagGuardUntil && flagGuardCell === i) return;

    flagged[i] = !flagged[i];
    const tile = grid.children[i];
    tile.classList.toggle('flagged', flagged[i]);
    flagsLeft += flagged[i] ? -1 : 1;
    updateMinesLeft();
    haptic('medium');

    if (source) {
      flagGuardUntil = now + 1100;
      flagGuardCell = i;
    }
  }

  const IS_TOUCH = navigator.maxTouchPoints > 0;
  let flagGuardUntil = 0;
  let flagGuardCell = -1;

  function bindTileTouch(tile, r, c) {
    let holdTimer = null;
    let holdDone = false;
    let didMove = false;
    let startX = 0;
    let startY = 0;

    const HOLD_MS = 380;
    const MOVE_THRESHOLD = 12;

    function clearHold() {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    }

    tile.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      holdDone = false;
      didMove = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      clearHold();
      holdTimer = setTimeout(() => {
        if (didMove) return;
        holdDone = true;
        toggleFlag(r, c, 'hold');
        tile.classList.add('flag-hold');
        setTimeout(() => tile.classList.remove('flag-hold'), 180);
        if (navigator.vibrate) navigator.vibrate(35);
      }, HOLD_MS);
    }, { passive: true });

    tile.addEventListener('touchmove', (e) => {
      if (holdDone || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
        didMove = true;
        clearHold();
      }
    }, { passive: true });

    tile.addEventListener('touchend', (e) => {
      clearHold();
      if (holdDone) {
        holdDone = false;
        e.preventDefault();
        return;
      }
      if (didMove) return;
      e.preventDefault();
      revealCell(r, c);
    }, { passive: false });

    tile.addEventListener('touchcancel', () => {
      clearHold();
      holdDone = false;
      didMove = false;
    });

    tile.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  function bindTileMouse(tile, r, c) {
    tile.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      toggleFlag(r, c, 'menu');
    });

    tile.addEventListener('click', (e) => {
      if (e.button !== 0) return;
      revealCell(r, c);
    });
  }

  function bindTile(tile, r, c) {
    if (IS_TOUCH) {
      bindTileTouch(tile, r, c);
    } else {
      bindTileMouse(tile, r, c);
    }
  }

  function checkWin() {
    let unrevealedSafe = 0;
    for (let i = 0; i < SIZE * SIZE; i++) {
      if (!revealed[i] && board[i] !== -1) unrevealedSafe++;
    }
    if (unrevealedSafe === 0 && !gameOver) {
      won = true;
      gameOver = true;
      stopTimer();
      haptic('success');
      winOverlay.classList.remove('hidden');
    }
  }

  function buildGrid() {
    grid.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const tile = document.createElement('div');
        tile.className = 'ms-tile hidden-tile';
        tile.setAttribute('role', 'button');
        tile.setAttribute('aria-label', 'Клетка');
        bindTile(tile, r, c);
        grid.appendChild(tile);
      }
    }
  }

  function resetGame() {
    gameOver = false;
    won = false;
    firstClick = true;
    flagsLeft = MINES;
    timer = 0;
    timerEl.textContent = '⏱ 0:00';
    updateMinesLeft();
    stopTimer();
    winOverlay.classList.add('hidden');
    board = [];
    revealed = [];
    flagged = [];
    buildGrid();
  }

  resetBtn.addEventListener('click', resetGame);

  continueBtn.addEventListener('click', () => {
    winOverlay.classList.add('hidden');
    onWin();
  });

  buildGrid();
  updateMinesLeft();

  return { reset: resetGame };
}
