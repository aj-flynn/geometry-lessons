// Practice is checked in this page only. Nothing is sent or saved.
for (const box of document.querySelectorAll('[data-choice-check]')) {
  const group = box.querySelector('fieldset');
  const check = box.querySelector('[data-check]');
  const reset = box.querySelector('[data-reset]');
  const feedback = box.querySelector('[role="status"]');
  const first = group?.querySelector('input');
  if (!group || !check || !reset || !feedback || !first) continue;
  check.addEventListener('click', () => {
    const choice = group.querySelector('input:checked');
    feedback.textContent = choice?.dataset.message || 'Choose an answer first, or use the written comparison below.';
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
