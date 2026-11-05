// Enable each check only after its local feedback and reset handlers are ready.
for (const practice of document.querySelectorAll('[data-quick-check]')) {
  const form = practice.querySelector('form');
  const fieldset = form?.querySelector('fieldset');
  const buttons = form?.querySelectorAll('button');
  const feedback = form?.querySelector('[role="status"]');
  const comparison = practice.querySelector('.static-reading');
  if (!fieldset || !buttons.length || !feedback || !comparison) continue;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const choice = fieldset.querySelector('input:checked');
    feedback.textContent = choice?.dataset.response ?? 'Choose a reading first, then check it.';
  });
  form.addEventListener('change', () => { feedback.textContent = ''; });
  form.addEventListener('reset', () => {
    feedback.textContent = 'Choice cleared.';
    fieldset.querySelector('input')?.focus();
  });

  fieldset.disabled = false;
  buttons.forEach(button => { button.disabled = false; });
  comparison.hidden = true;
}

let closedForPrint;
addEventListener('beforeprint', () => {
  if (closedForPrint) return;
  closedForPrint = [...document.querySelectorAll('details:not([open])')];
  closedForPrint.forEach(detail => { detail.open = true; });
});
addEventListener('afterprint', () => {
  closedForPrint?.forEach(detail => { detail.open = false; });
  closedForPrint = undefined;
});
