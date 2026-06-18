export function initTelegram() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return null;

  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0a0014');
  tg.setBackgroundColor('#0a0014');
  return tg;
}

export function switchScene(fromId, toId, extraClass = '') {
  const from = document.getElementById(fromId);
  const to = document.getElementById(toId);

  if (from) {
    from.classList.remove('active');
  }

  if (to) {
    to.classList.add('active');
    if (extraClass) {
      to.classList.add(extraClass);
      setTimeout(() => to.classList.remove(extraClass), 1000);
    }
  }
}

export function haptic(type = 'light') {
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
    else if (type === 'error') tg.HapticFeedback.notificationOccurred('error');
    else tg.HapticFeedback.impactOccurred(type);
  }
}
