for (const model of document.querySelectorAll('[data-charge-model]')) {
  const add = model.querySelector('[data-add-bromide]');
  const reset = model.querySelector('[data-reset-inventory]');
  const second = model.querySelector('[data-second-bromide]');
  const description = model.querySelector('desc');
  const status = model.querySelector('[data-inventory-status]');

  add.addEventListener('click', () => {
    second.removeAttribute('hidden');
    description.textContent = 'One copper ion with charge plus two and two bromide ions each with charge minus one.';
    status.textContent = 'Balanced trial: one Cu²⁺ and two Br⁻. Total charge zero.';
  });

  reset.addEventListener('click', () => {
    second.setAttribute('hidden', '');
    description.textContent = 'One copper ion with charge plus two and one bromide ion with charge minus one.';
    status.textContent = 'Trial: one Cu²⁺ and one Br⁻. Total charge +1.';
  });

  add.disabled = false;
  reset.disabled = false;
  model.hidden = false;
}
