for (const model of document.querySelectorAll('[data-cooling-model]')) {
  const controls = model.querySelector('[data-model-controls]');
  const test = model.querySelector('[data-test-pair]');
  const reset = model.querySelector('[data-reset-pair]');
  const result = model.querySelector('[data-model-result]');
  const comparison = model.querySelector('[data-model-static]');
  if (!controls || !test || !reset || !result || !comparison) continue;

  test.addEventListener('click', () => {
    result.textContent = comparison.querySelector('p').textContent;
  });
  reset.addEventListener('click', () => {
    result.textContent = '';
    test.focus();
  });

  test.disabled = false;
  reset.disabled = false;
  controls.hidden = false;
  comparison.hidden = true;
}
