const LINE_HEIGHT = 30;

export async function typeLetterLines(linesContainer, lines, options = {}) {
  const {
    speed = 50,
    typoChance = 0.1,
    onComplete = null,
  } = options;

  const rows = [...linesContainer.querySelectorAll('.letter-line-text')];
  let lineIdx = 0;
  let result = '';

  const typos = {
    а: 'о', о: 'а', е: 'и', и: 'е', т: 'ь',
    н: 'м', с: 'в', р: 'п', л: 'к', у: 'ц', я: 'ч',
  };
  const fakeWords = ['короче', 'ну', 'эм', 'типа'];

  function activeRow() {
    return rows[lineIdx];
  }

  function setCursorVisible(show) {
    const row = activeRow()?.closest('.letter-line');
    const cursor = row?.querySelector('.letter-cursor');
    if (cursor) cursor.style.display = show ? 'inline' : 'none';
  }

  function renderLine(text) {
    if (activeRow()) activeRow().textContent = text;
  }

  for (let r = 0; r < rows.length; r++) {
    lineIdx = r;
    const lineText = lines[r] ?? '';
    result = '';
    setCursorVisible(true);

    if (!lineText) {
      await sleep(120);
      setCursorVisible(false);
      continue;
    }

    for (let i = 0; i < lineText.length; i++) {
      const ch = lineText[i];
      const isLetter = /[а-яё]/i.test(ch);
      const doTypo = isLetter && Math.random() < typoChance && i > 1;

      if (doTypo && Math.random() < 0.35) {
        const fake = fakeWords[Math.floor(Math.random() * fakeWords.length)];
        for (let f = 0; f < fake.length; f++) {
          activeRow().innerHTML = result + `<span class="typo-wrong">${fake.slice(0, f + 1)}</span>`;
          await sleep(speed);
        }
        await sleep(350);
        renderLine(result);
        await sleep(150);
      } else if (doTypo) {
        const lower = ch.toLowerCase();
        const wrong = typos[lower] || lower;
        const w = ch === lower ? wrong : wrong.toUpperCase();
        activeRow().innerHTML = result + `<span class="typo-wrong">${w}</span>`;
        await sleep(speed + 60);
        await sleep(280);
        renderLine(result);
        await sleep(120);
      }

      result += ch;
      renderLine(result);

      let delay = speed + Math.random() * 35;
      if (/[.!?…]/.test(ch)) delay = 400;
      if (ch === ',') delay = 200;
      await sleep(delay);
    }

    setCursorVisible(false);
    await sleep(80);
  }

  if (onComplete) onComplete();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function buildLineElements(container, lines) {
  container.innerHTML = '';
  lines.forEach((lineText) => {
    const row = document.createElement('div');
    row.className = 'letter-line';
    if (!lineText) row.classList.add('letter-line--blank');

    const text = document.createElement('span');
    text.className = 'letter-line-text';
    row.appendChild(text);

    const cursor = document.createElement('span');
    cursor.className = 'letter-cursor';
    cursor.textContent = '|';
    cursor.style.display = 'none';
    row.appendChild(cursor);

    container.appendChild(row);
  });
}

export function applyPaperForLines(paperEl, linesContainerEl, lines) {
  buildLineElements(linesContainerEl, lines);

  const lineCount = lines.length;
  const linesHeight = lineCount * LINE_HEIGHT;
  linesContainerEl.style.height = `${linesHeight}px`;

  paperEl.style.height = 'auto';
  paperEl.style.minHeight = '';
  paperEl.style.maxHeight = '';

  requestAnimationFrame(() => {
    const measured = paperEl.offsetHeight;
    paperEl.style.height = `${measured}px`;
    paperEl.dataset.lines = String(lineCount);
    fitPaperToScreen(paperEl);
  });
}

export function fitPaperToScreen(paperEl) {
  const scene = document.getElementById('scene-letter');
  const wrap = paperEl.closest('.letter-envelope');
  const replayBtn = document.getElementById('letter-replay');
  if (!scene || !wrap) return;

  wrap.style.transform = '';

  requestAnimationFrame(() => {
    const btnSpace = replayBtn ? replayBtn.offsetHeight + 14 : 0;
    const maxH = scene.clientHeight - btnSpace - 12;
    const wrapH = wrap.offsetHeight;

    if (wrapH > maxH && maxH > 0) {
      const scale = Math.max(0.52, maxH / wrapH);
      wrap.style.transform = `scale(${scale})`;
    }
  });
}

export function lockLetterScroll(lock) {
  const scene = document.getElementById('scene-letter');
  if (!scene) return;
  scene.classList.toggle('letter-locked', lock);
  if (lock) window.scrollTo(0, 0);
}
