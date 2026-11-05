for (const form of document.querySelectorAll('form[data-choice]')) {
  const choices = form.querySelector('fieldset');
  const submit = form.querySelector('button[type="submit"]');
  const feedback = form.querySelector('[role="status"]');
  const comparison = form.nextElementSibling;
  if (!choices || !submit || !feedback || !comparison?.matches('.choice-comparison')) continue;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const answer = form.querySelector('input:checked');
    feedback.textContent = answer?.dataset.note || 'Make a choice and check again.';
  });
  form.addEventListener('change', () => { feedback.textContent = ''; });
  form.addEventListener('reset', () => {
    feedback.textContent = '';
    choices.querySelector('input')?.focus();
  });
  choices.disabled = false;
  submit.disabled = false;
  form.hidden = false;
  comparison.hidden = true;
}
