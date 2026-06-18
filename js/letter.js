import { CONFIG } from './config-loader.js';
import {
  typeLetterLines,
  applyPaperForLines,
  fitPaperToScreen,
  lockLetterScroll,
} from './typo-typer.js';

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
  const linesContainer = document.getElementById('letter-lines');
  const writingArea = document.getElementById('letter-writing-area');
  const paper = document.querySelector('.letter-paper');
  const nameEl = document.getElementById('letter-name');
  const replayBtn = document.getElementById('letter-replay');

  nameEl.textContent = CONFIG.yourName;

  const tallest = CONFIG.letterTexts.reduce((best, item) => (
    item.lines.length > best.lines.length ? item : best
  ), CONFIG.letterTexts[0]);
  applyPaperForLines(paper, linesContainer, tallest.lines);

  window.addEventListener('resize', () => fitPaperToScreen(paper));

  async function play() {
    const letter = pickRandomLetter();
    applyPaperForLines(paper, linesContainer, letter.lines);

    replayBtn.classList.add('hidden');
    lockLetterScroll(true);

    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    fitPaperToScreen(paper);

    await typeLetterLines(linesContainer, letter.lines, {
      speed: 46,
      typoChance: 0.09,
      onComplete: () => {
        replayBtn.classList.remove('hidden');
        fitPaperToScreen(paper);
      },
    });
  }

  replayBtn.addEventListener('click', () => {
    if (onReplayPrank) onReplayPrank();
  });

  return { play };
}
