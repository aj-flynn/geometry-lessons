const model = document.querySelector('#charge-trial');
const controls = model?.querySelector('[data-trial-controls]');
const add = controls?.querySelector('[data-add]');
const remove = controls?.querySelector('[data-remove]');
const reset = controls?.querySelector('[data-reset]');
const status = model?.querySelector('[data-inventory]');
const extraTiles = model?.querySelectorAll('[data-potassium]');

if (add && remove && reset && status && extraTiles?.length === 2) {
  const amounts = ['One', 'Two', 'Three'];
  let potassiumCount = 1;

  function renderTrial() {
    for (const [index, tile] of extraTiles.entries()) {
      tile.hidden = index + 2 > potassiumCount;
    }
    const charges = ['−1', '0', '+1'];
    const perIon = potassiumCount === 1 ? 'ion (+1)' : 'ions (+1 each)';
    status.textContent = `${amounts[potassiumCount - 1]} potassium ${perIon} and one sulfide ion (−2). Total charge ${charges[potassiumCount - 1]}.`;
    // Keep focus on the active control at an endpoint. The handler also
    // enforces the limit for keyboard and pointer input.
    add.setAttribute('aria-disabled', String(potassiumCount === 3));
    remove.setAttribute('aria-disabled', String(potassiumCount === 1));
  }

  add.addEventListener('click', () => {
    if (potassiumCount < 3) {
      potassiumCount += 1;
      renderTrial();
    }
  });
  remove.addEventListener('click', () => {
    if (potassiumCount > 1) {
      potassiumCount -= 1;
      renderTrial();
    }
  });
  reset.addEventListener('click', () => {
    potassiumCount = 1;
    renderTrial();
  });

  renderTrial();
  add.disabled = false;
  remove.disabled = false;
  reset.disabled = false;
  controls.hidden = false;
}

