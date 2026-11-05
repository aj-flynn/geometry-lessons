const model = document.querySelector('[data-charge-model]');
if (model) {
  const aluminum = model.querySelector('#al-count');
  const sulfide = model.querySelector('#s-count');
  const output = model.querySelector('[data-charge-output]');
  const reset = model.querySelector('[data-charge-reset]');
  const fallback = model.nextElementSibling;

  function drawCharges() {
    const aluminumCount = Number(aluminum.value);
    const sulfideCount = Number(sulfide.value);
    const positive = aluminumCount * 3;
    const negative = sulfideCount * 2;
    const total = positive - negative;
    const sign = total > 0 ? '+' : total < 0 ? '−' : '';
    let comment = 'Try another pair of counts to reach zero.';
    if (total === 0) {
      comment = aluminumCount === 2
        ? 'Neutral. This is the smallest ratio.'
        : 'Neutral. Try dividing both counts by two.';
    }
    output.textContent = `Al: ${aluminumCount} × (+3) = +${positive}. S: ${sulfideCount} × (−2) = −${negative}. Total: ${sign}${Math.abs(total)}. ${comment}`;
  }

  if (aluminum && sulfide && output && reset && fallback?.matches('[data-model-fallback]')) {
    aluminum.addEventListener('change', drawCharges);
    sulfide.addEventListener('change', drawCharges);
    reset.addEventListener('click', () => {
      aluminum.value = '1';
      sulfide.value = '1';
      drawCharges();
    });
    drawCharges();
    model.hidden = false;
  }
}
