// Change one product coefficient in the original pyrite trial.
for (const lab of document.querySelectorAll('[data-balance-lab]')) {
  const input = lab.querySelector('select');
  const product = lab.querySelector('[data-product-count]');
  const ironCell = lab.querySelector('[data-iron]');
  const oxygenCell = lab.querySelector('[data-oxygen]');
  const status = lab.querySelector('[data-balance-status]');

  function update() {
    const units = Number(input.value);
    const iron = units * 2;
    const oxygen = units * 3 + 8;
    product.textContent = units === 1 ? '' : String(units);
    ironCell.textContent = iron;
    oxygenCell.textContent = oxygen;
    const match = iron === 2 ? 'Fe and S match.' : 'Only S matches.';
    status.textContent = `Right side has ${iron} Fe, 4 S and ${oxygen} O atoms. ${match}`;
  }

  input.addEventListener('change', update);
  lab.querySelector('[data-balance-reset]').addEventListener('click', () => {
    input.value = '1';
    update();
  });
  update();
  lab.querySelector('.enhanced').hidden = false;
}
