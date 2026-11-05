for (const model of document.querySelectorAll('[data-inventory]')) {
  const factors = [...model.querySelectorAll('[data-factor]')];
  const buttons = [...model.querySelectorAll('[data-increase]')];
  const totals = model.querySelector('[data-totals]');
  const trial = [1, 1, 1];

  function drawTrial() {
    const [co, oxygen, carbonDioxide] = trial;
    const leftO = co + 2 * oxygen;
    const rightO = 2 * carbonDioxide;
    const matched = co === carbonDioxide && leftO === rightO;
    for (const [index, factor] of factors.entries()) {
      factor.textContent = trial[index];
      buttons[index].disabled = trial[index] === 6;
    }
    totals.textContent = `Trial counts. Left has ${co} C and ${leftO} O atoms. Right has ${carbonDioxide} C and ${rightO} O atoms. ${matched ? 'Both rows match. Now check the simplest ratio.' : 'At least one row still differs.'}`;
  }

  for (const [index, button] of buttons.entries()) {
    button.addEventListener('click', () => {
      trial[index]++;
      drawTrial();
      if (button.disabled) model.querySelector('[data-reset]').focus();
    });
  }
  model.querySelector('[data-reset]').addEventListener('click', () => {
    trial.fill(1);
    drawTrial();
  });

  drawTrial();
  model.hidden = false;
}

for (const practice of document.querySelectorAll('[data-balance-practice]')) {
  const inputs = [...practice.querySelectorAll('input')];
  const result = practice.querySelector('[data-result]');
  const check = practice.querySelector('[data-check]');
  const clear = practice.querySelector('[data-clear]');

  check.addEventListener('click', () => {
    const values = inputs.map(input => input.valueAsNumber);
    const invalid = values.findIndex(value => !Number.isInteger(value) || value < 1 || value > 99);
    if (invalid !== -1) {
      result.textContent = 'Enter a whole number from 1 to 99 for each coefficient. Use 1 where the equation would normally leave it blank.';
      inputs[invalid].focus();
      return;
    }

    const [phosphorus, base, water, phosphine, salt] = values;
    const leftP = 4 * phosphorus;
    const rightP = phosphine + salt;
    const leftH = base + 2 * water;
    const rightH = 3 * phosphine + 2 * salt;
    const leftO = base + water;
    const rightO = 2 * salt;
    const counts = `Left and right counts. P ${leftP} and ${rightP}. Na ${base} and ${salt}. H ${leftH} and ${rightH}. O ${leftO} and ${rightO}.`;

    let next;
    if (base !== salt) next = 'Match Na first. Each sodium formula contributes one Na per copy.';
    else if (leftO !== rightO) next = 'Recount O. The water and the base both supply O to the salt.';
    else if (leftH !== rightH) next = 'After matching Na and O, work out how many H atoms are left for PH₃. The salt takes two H atoms per copy.';
    else if (leftP !== rightP) next = 'Recount P. Add the P in both products, then check if the sum can come from whole copies of P₄.';
    else if (phosphine !== 1) next = `Every row matches. Divide all five coefficients by ${phosphine} to reach the simplest ratio.`;
    else next = 'Every row matches, the written charge is zero on each side, and the 1 prevents further reduction. Explain how you used two element counts together.';
    result.textContent = `${counts} ${next}`;
  });

  clear.addEventListener('click', () => {
    for (const input of inputs) input.value = '';
    result.textContent = '';
    inputs[0].focus();
  });
  for (const input of inputs) {
    input.addEventListener('input', () => { result.textContent = ''; });
    input.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      check.click();
    });
  }

  practice.hidden = false;
  practice.dataset.ready = 'true';
}
