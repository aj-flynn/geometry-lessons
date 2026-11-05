// In-memory checker for the original propene example.
const builder = document.querySelector('[data-ledger-builder]');
const panel = builder?.querySelector('fieldset');
const inputs = [...(panel?.querySelectorAll('input[type="number"]') ?? [])];
const feedback = builder?.querySelector('[data-ledger-feedback]');
const table = builder?.querySelector('table');
const cells = [...(table?.querySelectorAll('td') ?? [])];
const auditButton = panel?.querySelector('[data-audit]');
const resetButton = panel?.querySelector('[data-clear]');

function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function clearResult() {
  table.hidden = true;
  feedback.textContent = '';
}

function audit() {
  const values = inputs.map(input => input.valueAsNumber);
  const invalid = values.findIndex(value => !Number.isSafeInteger(value) || value < 1 || value > 1000000);
  if (invalid !== -1) {
    table.hidden = true;
    feedback.textContent = 'Enter a whole number from 1 to 1,000,000 for each substance, then check again.';
    inputs[invalid].focus();
    return;
  }

  const [fuel, oxygen, carbonDioxide, water] = values;
  const totals = [3 * fuel, carbonDioxide, 6 * fuel, 2 * water, 2 * oxygen, 2 * carbonDioxide + water];
  totals.forEach((total, index) => { cells[index].textContent = total; });
  table.hidden = false;

  if (totals[0] !== totals[1]) {
    feedback.textContent = 'Start with carbon. Each fuel molecule has three C atoms and each carbon dioxide molecule has one. Edit the carbon dioxide count and recheck.';
  } else if (totals[2] !== totals[3]) {
    feedback.textContent = 'Carbon matches. Now compare hydrogen. Each water molecule contains two H atoms, and water is the only product carrying hydrogen.';
  } else if (totals[4] !== totals[5] && totals[5] % 2 !== 0) {
    feedback.textContent = 'Carbon and hydrogen match. The products need an odd number of O atoms, but the oxygen supply comes in pairs. Try scaling up the fuel and both products together.';
  } else if (totals[4] !== totals[5]) {
    feedback.textContent = 'Carbon and hydrogen match. Count O in both products. Divide the total O demand by two to find the needed number of oxygen molecules.';
  } else {
    const divisor = values.reduce(gcd);
    feedback.textContent = divisor > 1
      ? `Every atom row matches. Divide all four coefficients by ${divisor} to keep the ratio and get the smallest whole-number set.`
      : 'Every atom row matches and the coefficients have no common divisor greater than one. Explain why starting with one fuel molecule did not work.';
  }
}

if (panel && inputs.length === 4 && feedback && table && cells.length === 6 && auditButton && resetButton) {
  auditButton.addEventListener('click', audit);
  resetButton.addEventListener('click', () => {
    inputs.forEach(input => { input.value = '1'; });
    clearResult();
    inputs[0].focus();
  });
  panel.addEventListener('input', clearResult);
  panel.disabled = false;
  builder.hidden = false;
}
