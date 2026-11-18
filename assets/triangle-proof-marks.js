// Practice is checked in this page only. Nothing is sent or saved.
const messages = new Map([
  ['asa', 'Check the side endpoints. The ticked side must join both marked angles for ASA. Find which endpoint lacks an arc, then revise.'],
  ['aas', 'AAS fits: the tick is not on the side joining the two marked angles. Now match the vertices in order and compare your full reasoning.'],
  ['none', 'There is more than just angle information. Pair the single arcs, pair the double arcs, and then check where the ticked side sits.'],
]);
for (const box of document.querySelectorAll('[data-proof-check]')) {
  const group = box.querySelector('fieldset');
  const check = box.querySelector('[data-check]');
  const reset = box.querySelector('[data-reset]');
  const feedback = box.querySelector('[role="status"]');
  const first = group?.querySelector('input');
  if (!group || !check || !reset || !feedback || !first) continue;
  check.addEventListener('click', () => {
    const choice = group.querySelector('input:checked')?.value;
    feedback.textContent = messages.get(choice) || 'Choose a test first, or use the written comparison below.';
  });
  reset.addEventListener('click', () => {
    for (const radio of group.querySelectorAll('input')) radio.checked = false;
    feedback.textContent = '';
    first.focus();
  });
  group.addEventListener('change', () => { feedback.textContent = ''; });
  group.disabled = false;
  box.dataset.ready = 'true';
}
