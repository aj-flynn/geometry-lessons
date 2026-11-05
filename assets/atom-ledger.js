const controls = document.querySelector('[data-model-controls]');
const countLabel = document.querySelector('[data-model-n]');
const modelStatus = document.querySelector('[data-model-status]');
const moleculeDescription = document.querySelector('#react-desc');
const oxygenGroups = document.querySelectorAll('[data-oxygen-pair]');
let oxygenMolecules = 2;

function showModel() {
  countLabel.textContent = oxygenMolecules;
  moleculeDescription.textContent = `Two CO molecules and ${oxygenMolecules} O2 molecules.`;
  for (const group of oxygenGroups) {
    const visible = Number(group.dataset.oxygenPair) <= oxygenMolecules;
    group.setAttribute('visibility', visible ? 'visible' : 'hidden');
  }
  const leftOxygen = 2 + 2 * oxygenMolecules;
  const result = leftOxygen === 4 ? 'The oxygen counts match.' : 'There is extra oxygen on the left.';
  modelStatus.textContent = `${oxygenMolecules} O2 on the left. C: 2 before, 2 after. O: ${leftOxygen} before, 4 after. ${result}`;
}

if (controls && countLabel && modelStatus && moleculeDescription && oxygenGroups.length === 3) {
  for (const button of controls.querySelectorAll('[data-change]')) {
    button.addEventListener('click', () => {
      oxygenMolecules = Math.min(3, Math.max(1, oxygenMolecules + Number(button.dataset.change)));
      showModel();
    });
  }
  controls.querySelector('[data-model-reset]').addEventListener('click', () => {
    oxygenMolecules = 2;
    showModel();
  });
  controls.hidden = false;
}

function greatestCommonDivisor(a, b) {
  while (b > 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

for (const form of document.querySelectorAll('form[data-balance]')) {
  const entries = [...form.querySelectorAll('input[type="number"]')];
  const feedback = form.querySelector('[role="status"]');
  const table = form.querySelector('table');
  const rows = [...table.querySelectorAll('tbody tr')].map(row => ({
    name: row.querySelector('th').textContent,
    cells: row.querySelectorAll('td'),
    sides: [row.dataset.before, row.dataset.after].map(side => side.split(',').map(Number))
  }));
  if (!feedback || !entries.length || !rows.length) continue;

  function clearFeedback() {
    table.hidden = true;
    feedback.textContent = '';
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const coefficients = entries.map(input => input.valueAsNumber);
    const mismatches = [];
    for (const row of rows) {
      const [before, after] = row.sides.map(side =>
        side.reduce((sum, atoms, index) => sum + atoms * coefficients[index], 0));
      row.cells[0].textContent = before;
      row.cells[1].textContent = after;
      if (before !== after) mismatches.push(`${row.name} has ${before} before and ${after} after`);
    }
    table.hidden = false;
    if (mismatches.length) {
      feedback.textContent = `Recheck one row first. ${mismatches[0]}. Change a whole-formula coefficient, then see which other rows it affects.`;
      return;
    }
    const divisor = coefficients.reduce(greatestCommonDivisor);
    if (divisor > 1) {
      feedback.textContent = `Every row agrees. Divide all coefficients by ${divisor} to keep the same ratio in smaller whole numbers, then retry.`;
      return;
    }
    feedback.textContent = 'Every row agrees, and the coefficients have no common divisor above one. Explain why you started with the row or group you chose.';
  });
  form.addEventListener('reset', clearFeedback);
  form.addEventListener('input', clearFeedback);
  form.querySelector('button[type="submit"]').disabled = false;
  form.querySelector('button[type="reset"]').disabled = false;
  form.dataset.practiceReady = 'true';
}
