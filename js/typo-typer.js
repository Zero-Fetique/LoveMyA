const LINE_HEIGHT = 32;
const CHARS_PER_LINE = 28;

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
    if (ch === '\n') delay = 300;
    if (ch === ',') delay = 200;
    await sleep(delay);
  }

  if (cursorEl) cursorEl.style.display = 'none';
  if (onComplete) onComplete();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function countVisualLines(text) {
  const paragraphs = text.split('\n');
  let total = 0;
  for (const para of paragraphs) {
    if (!para.trim()) {
      total += 1;
    } else {
      total += Math.ceil(para.length / CHARS_PER_LINE);
    }
  }
  return total;
}

export function getFixedLineCount(texts) {
  const maxLines = texts.reduce((max, t) => Math.max(max, countVisualLines(t)), 0);
  return Math.max(maxLines + 5, 18);
}

export function setupFixedPaper(paperEl, writingAreaEl, texts) {
  const lineCount = getFixedLineCount(texts);
  const writingHeight = lineCount * LINE_HEIGHT;
  const paperHeight = 72 + writingHeight + 96;

  writingAreaEl.style.height = `${writingHeight}px`;
  writingAreaEl.style.minHeight = `${writingHeight}px`;
  writingAreaEl.style.maxHeight = `${writingHeight}px`;

  paperEl.style.height = `${paperHeight}px`;
  paperEl.style.minHeight = `${paperHeight}px`;
  paperEl.style.maxHeight = `${paperHeight}px`;
  paperEl.dataset.lines = String(lineCount);
}
