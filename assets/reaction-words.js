const lab = document.querySelector('#coefficient-lab');
const controls = lab.querySelector('[data-balance-controls]');
const inputs = [...controls.querySelectorAll('input')];
const coefficients = [...controls.querySelectorAll('[data-coefficient]')];
const displayedValues = [...controls.querySelectorAll('[data-value]')];
const cells = [...controls.querySelectorAll('[data-count]')];
const move = controls.querySelector('[data-move]');
const reason = controls.querySelector('[data-reason]');
const tally = controls.querySelector('[data-tally]');
const start = inputs.map(input => input.value);

function greatestCommonDivisor(a, b) {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

function update() {
  if (tally.textContent) tally.textContent = '';
  const [ammonia, oxygen, monoxide, water] = inputs.map(input => Number(input.value));
  const ratio = [ammonia, oxygen, monoxide, water];
  const left = [ammonia, 3 * ammonia, 2 * oxygen];
  const right = [monoxide, 2 * water, monoxide + water];
  const totals = [...left, ...right];
  coefficients.forEach((node, i) => {
    node.textContent = ratio[i] === 1 ? '' : ratio[i];
    displayedValues[i].textContent = ratio[i];
  });
  cells.forEach((cell, i) => { cell.textContent = totals[i]; });

  let next;
  let why;
  if (ammonia !== monoxide) {
    next = 'Check nitrogen.';
    why = 'Each ammonia or nitrogen monoxide molecule contributes one nitrogen atom.';
  } else if (3 * ammonia !== 2 * water) {
    next = 'Check hydrogen.';
    why = 'Nitrogen matches. Ammonia contributes three H per molecule and water contributes two.';
  } else if (2 * oxygen !== monoxide + water) {
    next = 'Check oxygen.';
    why = 'Nitrogen and hydrogen match. Count oxygen from both products.';
    if ((monoxide + water) % 2 === 1) {
      next = 'Check oxygen pairs.';
      why += ' The right total is odd, while oxygen gas supplies pairs. Consider scaling the linked coefficients.';
    }
  } else if (ratio.reduce(greatestCommonDivisor) > 1) {
    next = 'Reduce the ratio.';
    why = 'Every element matches. Divide every coefficient by the same common factor.';
  } else {
    next = 'Balanced in simplest terms.';
    why = 'Every element matches. Explain why scaling only the oxygen coefficient could undo the balance.';
  }
  if (move.textContent !== next) move.textContent = next;
  reason.textContent = why;
}

for (const input of inputs) input.addEventListener('input', update);
controls.querySelector('[data-reset]').addEventListener('click', () => {
  inputs.forEach((input, i) => { input.value = start[i]; });
  update();
});
const readTally = controls.querySelector('[data-read-tally]');
readTally.addEventListener('click', () => {
  const [leftN, leftH, leftO, rightN, rightH, rightO] = cells.map(cell => cell.textContent);
  tally.textContent = `Nitrogen ${leftN} left, ${rightN} right. Hydrogen ${leftH} left, ${rightH} right. Oxygen ${leftO} left, ${rightO} right.`;
});
readTally.disabled = false;
update();
controls.hidden = false;

for (const form of document.querySelectorAll('[data-formula-check]')) {
  const feedback = form.querySelector('[data-formula-feedback]');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const answer = form.querySelector('input:checked');
    feedback.textContent = answer ? answer.dataset.explanation : 'Choose a formula, then check its charges.';
  });
  form.addEventListener('change', () => { feedback.textContent = ''; });
  form.querySelector('fieldset').disabled = false;
  form.querySelector('button').disabled = false;
}

const transfer = document.querySelector('[data-transfer-check]');
const transferFeedback = transfer.querySelector('[data-transfer-feedback]');
transfer.addEventListener('input', () => { transferFeedback.textContent = ''; });
transfer.addEventListener('submit', event => {
  event.preventDefault();
  const ratio = [...transfer.querySelectorAll('input')].map(input => input.valueAsNumber);
  const [oxide, hydrogen, iron, water] = ratio;
  const counts = [
    ['Iron', 2 * oxide, iron],
    ['Oxygen', 3 * oxide, water],
    ['Hydrogen', 2 * hydrogen, 2 * water],
  ];
  const tally = counts.map(([name, left, right]) => `${name} ${left} left, ${right} right.`).join(' ');
  const mismatch = counts.find(([, left, right]) => left !== right);
  let next = 'Correct ratio. Check each formula and state on paper.';
  if (mismatch) next = `Check ${mismatch[0].toLowerCase()} first.`;
  else if (ratio.reduce(greatestCommonDivisor) > 1) next = 'All elements match. Divide the whole ratio by its common factor.';
  transferFeedback.textContent = `${tally} ${next}`;
});
transfer.querySelector('button').disabled = false;
transfer.closest('details').hidden = false;
