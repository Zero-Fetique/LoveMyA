const LINE_HEIGHT = 30;
const PAPER_TOP = 58;
const PAPER_BOTTOM = 88;

export async function typeLetter(typedEl, cursorEl, text, options = {}) {
  const {
    speed = 50,
    typoChance = 0.1,
    onComplete = null,
  } = options;

  typedEl.textContent = '';
  if (cursorEl) {
    cursorEl.style.display = 'inline';
    cursorEl.textContent = '|';
  }

  const typos = {
    а: 'о', о: 'а', е: 'и', и: 'е', т: 'ь',
    н: 'м', с: 'в', р: 'п', л: 'к', у: 'ц', я: 'ч',
  };

  const fakeWords = ['короче', 'ну', 'эм', 'типа'];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const isLetter = /[а-яё]/i.test(ch);
    const doTypo = isLetter && Math.random() < typoChance && i > 2;

    if (doTypo && Math.random() < 0.35) {
      const fake = fakeWords[Math.floor(Math.random() * fakeWords.length)];
      for (let f = 0; f < fake.length; f++) {
        typedEl.innerHTML = result + `<span class="typo-wrong">${fake.slice(0, f + 1)}</span>`;
        await sleep(speed);
      }
      await sleep(350);
      typedEl.textContent = result;
      await sleep(150);
    } else if (doTypo) {
      const lower = ch.toLowerCase();
      const wrong = typos[lower] || lower;
      const w = ch === lower ? wrong : wrong.toUpperCase();
      typedEl.innerHTML = result + `<span class="typo-wrong">${w}</span>`;
      await sleep(speed + 60);
      await sleep(280);
      typedEl.textContent = result;
      await sleep(120);
    }

    result += ch;
    typedEl.textContent = result;

    let delay = speed + Math.random() * 35;
    if (/[.!?…]/.test(ch)) delay = 400;
    if (ch === '\n') delay = 280;
    if (ch === ',') delay = 200;
    await sleep(delay);
  }

  if (cursorEl) cursorEl.style.display = 'none';
  if (onComplete) onComplete();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function linesToText(lines) {
  return lines.join('\n');
}

export function applyPaperForLines(paperEl, writingAreaEl, lines) {
  const lineCount = lines.length;
  const writingHeight = lineCount * LINE_HEIGHT;
  const paperHeight = PAPER_TOP + writingHeight + PAPER_BOTTOM;

  writingAreaEl.style.height = `${writingHeight}px`;
  writingAreaEl.style.minHeight = `${writingHeight}px`;
  writingAreaEl.style.maxHeight = `${writingHeight}px`;
  writingAreaEl.style.backgroundSize = `100% ${LINE_HEIGHT}px`;

  paperEl.style.height = `${paperHeight}px`;
  paperEl.style.minHeight = `${paperHeight}px`;
  paperEl.style.maxHeight = `${paperHeight}px`;
  paperEl.dataset.lines = String(lineCount);

  fitPaperToScreen(paperEl);
}

export function fitPaperToScreen(paperEl) {
  const scene = document.getElementById('scene-letter');
  const wrap = paperEl.closest('.letter-envelope');
  if (!scene || !wrap) return;

  wrap.style.transform = '';
  const maxH = scene.clientHeight - 72;
  const paperH = paperEl.offsetHeight;

  if (paperH > maxH && maxH > 0) {
    const scale = Math.max(0.72, maxH / paperH);
    wrap.style.transform = `scale(${scale})`;
  }
}
