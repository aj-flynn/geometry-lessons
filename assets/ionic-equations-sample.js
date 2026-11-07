(() => {
  const controls = document.querySelector('#coef-controls');
  const value = document.querySelector('#coef-value');
  const counts = document.querySelectorAll('#coef-results tbody tr');
  const note = document.querySelector('#coef-note');
  const doubleButton = document.querySelector('#coef-double');
  const resetButton = document.querySelector('#coef-reset');

  function render(ratio) {
    value.textContent = ratio === 1 ? '' : '2 ';
    for (const row of counts) {
      const element = row.cells[0].textContent;
      if (element === 'Rb' || element === 'I') {
        row.cells[1].querySelector('.screen-value').textContent = ratio;
      }
    }
    note.textContent = ratio === 1
      ? 'RbI coefficient 1. Left counts of Rb and I are both 1.'
      : 'RbI coefficient 2. Left counts of Rb and I are both 2. All other counts stayed the same.';
  }

  doubleButton.addEventListener('click', () => render(2));
  resetButton.addEventListener('click', () => render(1));
  controls.hidden = false;
})();
