const trial = document.querySelector('[data-trial]');
const controls = document.querySelector('[data-copy-controls]');
const factors = [...trial.querySelectorAll('[data-factor]')];
const buttons = [...controls.querySelectorAll('[data-add]')];
const status = trial.querySelector('[data-inventory]');
const reset = controls.querySelector('[data-reset]');
const counts = [1, 1];

function updateTrial() {
  const [nitricOxide, nitrogenDioxide] = counts;
  const leftOxygen = nitricOxide + 2;
  const rightOxygen = 2 * nitrogenDioxide;
  const balanced = nitricOxide === nitrogenDioxide && leftOxygen === rightOxygen;

  for (const [index, factor] of factors.entries()) {
    factor.textContent = counts[index];
    buttons[index].disabled = counts[index] === 6;
  }

  const verdict = balanced ? 'Both elements match.' : 'At least one element differs.';
  status.textContent = `Left: N ${nitricOxide}, O ${leftOxygen}. Right: N ${nitrogenDioxide}, O ${rightOxygen}. ${verdict}`;
}

for (const [index, button] of buttons.entries()) {
  button.addEventListener('click', () => {
    counts[index]++;
    updateTrial();
    if (button.disabled) reset.focus();
  });
}

reset.addEventListener('click', () => {
  counts.fill(1);
  updateTrial();
});

updateTrial();
trial.hidden = false;
controls.hidden = false;
