import { CONFIG } from './config-loader.js';
import { typeLetter, setupFixedPaper } from './typo-typer.js';

const STORAGE_KEY = 'loveMyA_lastLetter';

function pickRandomLetter() {
  const texts = CONFIG.letterTexts;
  if (texts.length === 1) return texts[0];

  const lastIdx = parseInt(localStorage.getItem(STORAGE_KEY) ?? '-1', 10);
  let idx;
  do {
    idx = Math.floor(Math.random() * texts.length);
  } while (idx === lastIdx && texts.length > 1);

  localStorage.setItem(STORAGE_KEY, String(idx));
  return texts[idx];
}

export function initLetter({ onReplayPrank } = {}) {
  const typedEl = document.getElementById('letter-typed');
  const cursorEl = document.getElementById('letter-cursor');
  const writingArea = document.getElementById('letter-writing-area');
  const paper = document.querySelector('.letter-paper');
  const nameEl = document.getElementById('letter-name');
  const replayBtn = document.getElementById('letter-replay');

  nameEl.textContent = CONFIG.yourName;
  setupFixedPaper(paper, writingArea, CONFIG.letterTexts);

  async function play() {
    const text = pickRandomLetter();

    replayBtn.classList.add('hidden');
    typedEl.textContent = '';
    if (cursorEl) cursorEl.style.display = 'inline';

    await typeLetter(typedEl, cursorEl, text, {
      speed: 48,
      typoChance: 0.09,
      onComplete: () => {
        replayBtn.classList.remove('hidden');
      },
    });
  }

  replayBtn.addEventListener('click', () => {
    if (onReplayPrank) onReplayPrank();
  });

  return { play };
}
