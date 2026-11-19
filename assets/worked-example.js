// Step-by-step slideshows for worked examples. No network, storage or homework grading.
// Without this script every slide stays visible as a numbered sequence, so nothing is lost.
// Keyboard: Back/Next buttons, Left/Right arrows, Home/End while focus is in the slideshow.

for (const deck of document.querySelectorAll('[data-deck]')) {
  const slides = [...deck.querySelectorAll('.slide')];
  const controls = deck.querySelector('[data-deck-controls]');
  const prev = deck.querySelector('[data-deck-prev]');
  const next = deck.querySelector('[data-deck-next]');
  const count = deck.querySelector('[data-deck-count]');
  const dots = deck.querySelector('[data-deck-dots]');
  const hint = deck.querySelector('[data-deck-hint]');
  if (slides.length < 2 || !controls || !prev || !next || !count) continue;

  let current = 0;
  const titleOf = slide => slide.querySelector('h3, h4')?.textContent.trim() || '';
  const dotButtons = [];

  if (dots) {
    slides.forEach((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}: ${titleOf(slide)}`);
      dot.addEventListener('click', () => show(index));
      dots.append(dot);
      dotButtons.push(dot);
    });
    dots.hidden = false;
  }

  function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
      slide.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
    });
    dotButtons.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    const title = titleOf(slides[current]);
    count.textContent = `Slide ${current + 1} of ${slides.length}${title ? `: ${title}` : ''}`;
  }

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  deck.addEventListener('keydown', event => {
    if (event.target.closest('input, select, textarea, summary')) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const moves = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    show(moves[event.key]);
  });

  deck.classList.add('is-enhanced');
  if (!deck.hasAttribute('tabindex')) deck.tabIndex = 0;
  controls.hidden = false;
  if (hint) hint.hidden = false;
  show(0);
}
