const ledger = document.querySelector('#ledger');
const lower = document.querySelector('#lower');
const raise = document.querySelector('#raise');
const reset = document.querySelector('#reset');
const ironCoefficient = document.querySelector('#iron-coefficient');
const ironTotal = document.querySelector('#total-iron');
const oxygenTotal = document.querySelector('#total-oxygen');
const status = document.querySelector('#ledger-status');

if (ledger && lower && raise && reset && ironCoefficient && ironTotal && oxygenTotal && status) {
  const minimum = 1;
  const maximum = 3;
  let coefficient = minimum;

  function renderTrial(nextCoefficient) {
    coefficient = nextCoefficient;
    const iron = 2 * coefficient;
    const oxygen = 3 * coefficient + 4 * 2;

    ironCoefficient.textContent = coefficient === 1 ? '' : coefficient + ' ';
    ironTotal.textContent = iron;
    oxygenTotal.textContent = oxygen;
    lower.setAttribute('aria-disabled', String(coefficient === minimum));
    raise.setAttribute('aria-disabled', String(coefficient === maximum));
    status.textContent = `Trial coefficient ${coefficient}. Left: Fe 2, S 4, O 2. Right: Fe ${iron}, S 4, O ${oxygen}.`;
  }

  lower.addEventListener('click', () => {
    if (coefficient > minimum) renderTrial(coefficient - 1);
  });
  raise.addEventListener('click', () => {
    if (coefficient < maximum) renderTrial(coefficient + 1);
  });
  reset.addEventListener('click', () => renderTrial(minimum));
  renderTrial(minimum);
  ledger.hidden = false;
}
