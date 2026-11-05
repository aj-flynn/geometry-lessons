// This inventory models only the new silver oxide example. Trials stay in the page.
const atomModel = document.querySelector('[data-atom-model]');
if (atomModel) {
  const oxide = atomModel.querySelector('[data-oxide]');
  const silver = atomModel.querySelector('[data-silver]');
  const status = atomModel.querySelector('[data-count-status]');
  const set = (selector, value) => {
    atomModel.querySelector(selector).textContent = value;
  };

  function showTrial() {
    const oxideUnits = Number(oxide.value);
    const silverAtoms = Number(silver.value);
    const leftSilver = 2 * oxideUnits;
    set('[data-oxide-number]', oxideUnits === 1 ? '' : oxideUnits);
    set('[data-silver-number]', silverAtoms === 1 ? '' : silverAtoms);
    set('[data-ag-left]', leftSilver);
    set('[data-ag-right]', silverAtoms);
    set('[data-o-left]', oxideUnits);

    const agMatch = leftSilver === silverAtoms;
    const oMatch = oxideUnits === 2;
    const next = agMatch && oMatch
      ? 'Both rows match. Explain why you could fix Ag without moving the O totals.'
      : oMatch
        ? 'O matches. Change the amount of Ag on the right to repair the Ag count.'
        : 'O differs. Compare the left count to the two O atoms in one oxygen molecule.';
    status.textContent = `Ag atoms, ${leftSilver} left and ${silverAtoms} right. O atoms, ${oxideUnits} left and 2 right. ${next}`;
  }

  oxide.addEventListener('change', showTrial);
  silver.addEventListener('change', showTrial);
  atomModel.querySelector('[data-reset]').addEventListener('click', () => {
    oxide.value = '1';
    silver.value = '1';
    showTrial();
  });
  showTrial();
  atomModel.hidden = false;
}
