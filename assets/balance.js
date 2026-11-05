const trial = document.querySelector('#coefficient-trial');
const [phosphorusChloride, oxygenGas, phosphorusOxychloride] = trial.querySelectorAll('input');
const target = trial.querySelector('select');
const factors = trial.querySelectorAll('[data-factor]');
const status = trial.querySelector('[data-trial-status]');
const cells = Object.fromEntries([...trial.querySelectorAll('[data-atom]')].map(row => [
  row.dataset.atom, row.querySelectorAll('td')
]));

function greatestCommonDivisor(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

function showTrial(announce = true) {
  const leftCompound = phosphorusChloride.valueAsNumber;
  const leftOxygen = oxygenGas.valueAsNumber;
  const rightCompound = phosphorusOxychloride.valueAsNumber;
  const counts = {
    P: [leftCompound, rightCompound],
    Cl: [3 * leftCompound, 3 * rightCompound],
    O: [2 * leftOxygen, rightCompound]
  };
  const coefficients = [leftCompound, leftOxygen, rightCompound];
  coefficients.forEach((factor, index) => {
    factors[index].textContent = factor === 1 ? '' : String(factor);
  });
  for (const [atom, [left, right]] of Object.entries(counts)) {
    cells[atom][0].textContent = left;
    cells[atom][1].textContent = right;
  }
  if (!announce) return;

  const [left, right] = counts[target.value];
  const mismatch = Object.entries(counts).find(([, pair]) => pair[0] !== pair[1]);
  let next;
  if (left !== right) {
    next = `Adjust a coefficient for a formula containing ${target.value}. Recheck every atom in that formula and test again.`;
  } else if (mismatch) {
    next = `That count matches. Next check ${mismatch[0]} (${mismatch[1][0]} on the left and ${mismatch[1][1]} on the right) and test again.`;
  } else {
    const divisor = coefficients.reduce(greatestCommonDivisor);
    next = divisor === 1
      ? 'Every atom count matches, the total charge is zero on each side, and this is the simplest ratio.'
      : `Every count matches and the total charge is zero on each side. Divide all three coefficients by ${divisor} and test again for the simplest ratio.`;
  }
  status.textContent = `Tested coefficients ${coefficients.join(', ')}. ${target.value} has ${left} on the left and ${right} on the right. ${next}`;
}

trial.addEventListener('submit', event => {
  event.preventDefault();
  showTrial();
});
trial.addEventListener('reset', event => {
  event.preventDefault();
  target.selectedIndex = 0;
  for (const input of trial.querySelectorAll('input')) input.value = input.defaultValue;
  showTrial();
});
trial.querySelector('button[type="submit"]').disabled = false;
trial.dataset.trialReady = 'true';
trial.hidden = false;
