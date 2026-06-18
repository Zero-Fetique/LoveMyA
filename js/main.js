import { initTelegram, switchScene } from './utils.js';
import { initStars, initHeartIntro } from './heart.js';
import { initMinesweeper } from './minesweeper.js';
import { initGallery } from './gallery.js';
import { initLetter } from './letter.js';
import { initTutorial } from './tutorial.js';
import { initButterflies } from './butterflies.js';
import { initFloatingDecor } from './floating-decor.js';
import { CONFIG } from './config-loader.js';

function applyPrankIntro() {
  if (sessionStorage.getItem('loveMyA_prank') !== '1') return;
  sessionStorage.removeItem('loveMyA_prank');

  const hint = document.querySelector('.intro-hint');
  if (hint) {
    hint.textContent = CONFIG.replayPrankText;
    hint.classList.add('prank-hint');
  }
}

function showPrankAndRestart() {
  const overlay = document.getElementById('prank-overlay');
  const textEl = document.getElementById('prank-text');
  if (textEl) textEl.textContent = CONFIG.replayPrankText;

  overlay?.classList.remove('hidden');
  requestAnimationFrame(() => overlay?.classList.add('visible'));

  setTimeout(() => {
    sessionStorage.setItem('loveMyA_prank', '1');
    location.reload();
  }, 2200);
}

function openLetterFromGallery(letter) {
  const gallery = document.getElementById('scene-gallery');
  const letterScene = document.getElementById('scene-letter');
  const bridge = document.getElementById('envelope-letter-bridge');

  gallery.classList.add('exiting-to-letter');
  bridge?.classList.remove('hidden');
  requestAnimationFrame(() => bridge?.classList.add('active'));

  setTimeout(() => {
    switchScene('scene-gallery', 'scene-letter', 'entering-from-envelope');
    gallery.classList.remove('exiting-to-letter');
    bridge?.classList.remove('active');
    bridge?.classList.add('hidden');
    setTimeout(() => {
      letterScene?.classList.remove('entering-from-envelope');
      letter.play();
    }, 900);
  }, 650);
}

document.addEventListener('DOMContentLoaded', () => {
  initTelegram();

  const canvas = document.getElementById('stars-canvas');
  const starsCtrl = initStars(canvas);
  canvas._starsCtrl = starsCtrl;

  const heart = initHeartIntro(() => {
    switchScene('scene-intro', 'scene-minesweeper');
  });
  heart.setStarsCtrl(starsCtrl);

  initTutorial();

  const msScene = document.getElementById('scene-minesweeper');
  initButterflies(msScene);

  const letterScene = document.getElementById('scene-letter');
  initFloatingDecor(letterScene, { hearts: 6, butterflies: 5 });

  const letter = initLetter({ onReplayPrank: showPrankAndRestart });

  initMinesweeper(() => {
    switchScene('scene-minesweeper', 'scene-gallery', 'entering');
  });

  const galleryScene = document.getElementById('scene-gallery');
  initButterflies(galleryScene);

  initGallery(() => openLetterFromGallery(letter));

  if (sessionStorage.getItem('loveMyA_prank') === '1') {
    applyPrankIntro();
  }
});
