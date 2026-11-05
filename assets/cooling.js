for (const model of document.querySelectorAll('[data-cooling-model]')) {
  const count = model.querySelector('select');
  const test = model.querySelector('[data-model-test]');
  const reset = model.querySelector('[data-model-reset]');
  const result = model.querySelector('[data-model-result]');
  const comparison = model.nextElementSibling;
  if (!count || !test || !reset || !result || !comparison?.matches('[data-model-static]')) continue;

  const energyOut = 24;
  const tileHeatCapacity = 4;
  test.addEventListener('click', () => {
    const tiles = Number(count.value);
    const capacity = tiles * tileHeatCapacity;
    const drop = energyOut / capacity;
    result.textContent = `At ${capacity} J per °C, taking away ${energyOut} J gives a drop of ${drop} °C.`;
  });
  count.addEventListener('change', () => { result.textContent = ''; });
  reset.addEventListener('click', () => {
    count.value = '2';
    result.textContent = 'Reset to two tiles. Predict before testing again.';
  });

  model.hidden = false;
  comparison.hidden = true;
}
