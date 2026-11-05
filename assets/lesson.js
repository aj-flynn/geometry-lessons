// Enhances new, analogous practice only. No network, storage, or homework grading.
// Angle explorers use mathematically computed points, never a stretched SVG.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

for (const explorer of document.querySelectorAll('[data-angle-explorer]')) {
  const slider = explorer.querySelector('input[type="range"]');
  const ray = explorer.querySelector('[data-ray]');
  const arc = explorer.querySelector('[data-arc]');
  const label = explorer.querySelector('[data-angle-label]');
  const replay = explorer.querySelector('[data-replay]');
  const stop = explorer.querySelector('[data-stop]');
  const output = explorer.querySelector('output');
  if (!slider || !ray || !arc || !label || !output) continue;
  let frame = null;
  const startValue = Number(slider.value);
  function draw(value) {
    const theta = value * Math.PI / 180;
    const x = 180 + 140 * Math.cos(theta);
    const y = 220 - 140 * Math.sin(theta);
    ray.setAttribute('x2', x.toFixed(2));
    ray.setAttribute('y2', y.toFixed(2));
    arc.setAttribute('d', `M 235 220 A 55 55 0 0 0 ${(180 + 55 * Math.cos(theta)).toFixed(2)} ${(220 - 55 * Math.sin(theta)).toFixed(2)}`);
    label.textContent = `${Math.round(value)}°`;
    output.value = `${Math.round(value)} degrees`;
    slider.value = value;
  }
  function cancel() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    replay?.setAttribute('aria-pressed', 'false');
  }
  slider.addEventListener('input', () => { cancel(); draw(Number(slider.value)); });
  stop?.addEventListener('click', cancel);
  replay?.addEventListener('click', () => {
    cancel();
    if (reducedMotion.matches) { draw(startValue); return; }
    const from = Number(slider.min), to = startValue;
    const started = performance.now();
    replay.setAttribute('aria-pressed', 'true');
    const tick = now => {
      const progress = Math.min((now - started) / 1300, 1);
      draw(from + (to - from) * progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else cancel();
    };
    frame = requestAnimationFrame(tick);
  });
  explorer.querySelector('[data-reset]')?.addEventListener('click', () => { cancel(); draw(startValue); });
  reducedMotion.addEventListener('change', () => { cancel(); draw(Number(slider.value)); });
  draw(startValue);
}

for (const form of document.querySelectorAll('form[data-practice]')) {
  const feedback = form.querySelector('[data-feedback]');
  const input = form.querySelector('input');
  if (!feedback || !input) continue;
  const authoredExpected = form.dataset.expected;
  const authoredTolerance = Number(form.dataset.tolerance || 0.001);
  if (typeof authoredExpected !== 'string' || !authoredExpected.trim() ||
      !Number.isFinite(Number(authoredExpected)) || !Number.isFinite(authoredTolerance) || authoredTolerance < 0) continue;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const entered = Number(input.value);
    if (!input.value.trim() || !Number.isFinite(entered)) {
      feedback.textContent = 'Enter a number to try this new example.';
      return;
    }
    const expected = Number(form.dataset.expected);
    const tolerance = Number(form.dataset.tolerance || 0.001);
    if (!Number.isFinite(expected) || !Number.isFinite(tolerance) || tolerance < 0) {
      feedback.textContent = 'This practice check is unavailable. Explain your reasoning in the chat.';
      return;
    }
    const correct = Math.abs(entered - expected) <= tolerance;
    let hint = form.dataset.hint || 'Look again at the relationship in the diagram. Try the first hint.';
    try {
      const mistakes = JSON.parse(form.dataset.mistakes || '{}');
      for (const [value, explanation] of Object.entries(mistakes)) {
        if (typeof explanation === 'string' && Math.abs(entered - Number(value)) < 0.025) { hint = explanation; break; }
      }
    } catch { /* Optional authored misconception hints must not break practice. */ }
    feedback.textContent = correct
      ? (form.dataset.success || 'That fits this practice example. Can you explain why?')
      : hint;
  });
  form.dataset.practiceReady = 'true';
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.disabled = false;
}

