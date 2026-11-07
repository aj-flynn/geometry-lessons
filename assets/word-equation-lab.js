const inventory = document.querySelector('[data-inventory]');
const amount = inventory.querySelector('input');
const factor = inventory.querySelector('[data-factor]');
const writtenFactor = inventory.querySelector('[data-written-factor]');
const totals = inventory.querySelector('[data-totals]');

function updateTrial() {
  const copies = amount.valueAsNumber;
  const silver = 2 * copies;
  const oxygen = copies;
  factor.textContent = copies;
  writtenFactor.textContent = copies === 1 ? '' : copies;
  const silverCheck = silver === 2 ? 'Ag matches.' : 'Ag differs.';
  const oxygenCheck = oxygen === 2 ? 'O matches.' : 'O differs.';
  totals.textContent = `Left: ${silver} Ag and ${oxygen} O atoms. Right: 2 Ag and 2 O atoms. ${silverCheck} ${oxygenCheck}`;
}

amount.addEventListener('input', updateTrial);
inventory.querySelector('[data-reset]').addEventListener('click', () => {
  amount.value = amount.defaultValue;
  updateTrial();
});
updateTrial();
inventory.hidden = false;
