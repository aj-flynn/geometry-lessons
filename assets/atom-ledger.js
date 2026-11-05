for (const demo of document.querySelectorAll('[data-ledger]')) {
  const controls = demo.querySelector('[data-live-ledger]');
  const coefficient = controls.querySelector('input');
  const nitrogen = controls.querySelector('[data-n]');
  const oxygen = controls.querySelector('[data-o]');
  const status = controls.querySelector('[data-inventory]');

  function showInventory() {
    const molecules = Number(coefficient.value);
    const oxygenAtoms = 2 * molecules;
    nitrogen.textContent = String(molecules);
    oxygen.textContent = String(oxygenAtoms);
    const comparison = molecules === 2 ? 'Both rows match.' :
      molecules === 1 ? 'Both product counts are short.' : 'Both product counts are too high.';
    status.value = `Products: ${molecules} N and ${oxygenAtoms} O atoms. ${comparison}`;
  }

  coefficient.addEventListener('input', showInventory);
  controls.querySelector('.ledger-reset').addEventListener('click', () => {
    coefficient.value = coefficient.defaultValue;
    showInventory();
  });
  showInventory();
  controls.hidden = false;
}
