// Shared reading-lens and practice controls. All learner responses remain in memory.
for (const explorer of document.querySelectorAll('[data-explorer]')) {
  const buttons = [...explorer.querySelectorAll('[data-lens]')];
  function selectLens(button) {
    explorer.querySelector('[data-lens-title]').textContent = button.dataset.title;
    explorer.querySelector('[data-lens-copy]').textContent = button.dataset.copy;
    explorer.querySelector('[data-lens-note]').textContent = button.dataset.note;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }
  explorer.hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => selectLens(button)));
  explorer.querySelector('[data-restart]').addEventListener('click', () => { selectLens(buttons[0]); buttons[0].focus(); });
  selectLens(buttons[0]);
}
for (const form of document.querySelectorAll('[data-question] form')) {
  const feedback = form.querySelector('.feedback');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = form.querySelector('input:checked');
    feedback.textContent = !selected ? 'Choose an explanation, then check your reasoning.' : selected.value === form.dataset.correct ? form.dataset.success : (selected.dataset.feedback || form.dataset.hint || 'Use the hint and compare the wording before trying again.');
  });
  form.addEventListener('change', () => { feedback.textContent = ''; });
}
