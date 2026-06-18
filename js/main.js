import { initTelegram, switchScene } from './utils.js';
import { initStars, initHeartIntro } from './heart.js';
import { initMinesweeper } from './minesweeper.js';
import { initGallery } from './gallery.js';
import { initLetter } from './letter.js';
import { initTutorial } from './tutorial.js';
import { initButterflies } from './butterflies.js';
import { initFloatingDecor } from './floating-decor.js';

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

  const letter = initLetter();

  initMinesweeper(() => {
    switchScene('scene-minesweeper', 'scene-gallery', 'entering');
  });

  const galleryScene = document.getElementById('scene-gallery');
  initButterflies(galleryScene);

  initGallery(() => {
    switchScene('scene-gallery', 'scene-letter');
    setTimeout(() => letter.play(), 300);
  });
});
