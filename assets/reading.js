// Shared reading-lens and practice controls. All learner responses remain in memory.
for (const explorer of document.querySelectorAll('[data-explorer]')) {
  const buttons = [...explorer.querySelectorAll('[data-lens]')];
  const title = explorer.querySelector('[data-lens-title]');
  const prompt = explorer.querySelector('[data-lens-prompt]');
  const result = explorer.querySelector('[data-lens-result]');
  const reveal = explorer.querySelector('[data-lens-reveal]');
  const restart = explorer.querySelector('[data-restart]');
  const fallback = explorer.nextElementSibling;
  if (!buttons.length || !title || !prompt || !result || !reveal || !restart) continue;

  let activeLens;
  function selectLens(button) {
    activeLens = button;
    title.textContent = button.dataset.title;
    prompt.textContent = button.dataset.prompt;
    result.replaceChildren();
    reveal.setAttribute('aria-expanded', 'false');
    reveal.textContent = 'Compare after trying';
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }

  buttons.forEach(button => button.addEventListener('click', () => selectLens(button)));
  reveal.addEventListener('click', () => {
    if (reveal.getAttribute('aria-expanded') === 'true') {
      result.replaceChildren();
      reveal.setAttribute('aria-expanded', 'false');
      reveal.textContent = 'Compare after trying';
      return;
    }

    const copy = document.createElement('p');
    copy.className = 'lens-copy';
    copy.textContent = activeLens.dataset.copy;
    const note = document.createElement('p');
    note.className = 'lens-note';
    note.textContent = activeLens.dataset.note;
    result.replaceChildren(copy, note);
    reveal.setAttribute('aria-expanded', 'true');
    reveal.textContent = 'Hide comparison';
  });
  restart.addEventListener('click', () => {
    selectLens(buttons[0]);
    buttons[0].focus();
  });

  selectLens(buttons[0]);
  explorer.hidden = false;
  if (fallback?.matches('[data-lens-fallback]')) fallback.hidden = true;
}

for (const lab of document.querySelectorAll('[data-context-lab]')) {
  const interaction = lab.querySelector('[data-context-interaction]');
  const buttons = [...lab.querySelectorAll('[data-context]')];
  const comparisons = new Map([...lab.querySelectorAll('[data-context-copy]')].map(copy => [copy.dataset.contextCopy, copy]));
  const result = lab.querySelector('[data-context-result]');
  const reset = lab.querySelector('[data-context-reset]');
  if (!interaction || !result || !reset || !buttons.length || buttons.some(button => !comparisons.has(button.dataset.context))) continue;

  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const paragraph = comparisons.get(button.dataset.context).cloneNode(true);
    paragraph.removeAttribute('data-context-copy');
    result.replaceChildren(paragraph);
  }));
  reset.addEventListener('click', () => {
    result.replaceChildren();
    buttons.forEach(button => button.setAttribute('aria-pressed', 'false'));
    buttons[0].focus();
  });
  interaction.hidden = false;
}


let printDetails = null;
addEventListener('beforeprint', () => {
  if (printDetails !== null) return;
  printDetails = [...document.querySelectorAll('details')].filter(detail => !detail.open);
  printDetails.forEach(detail => { detail.open = true; });
});
addEventListener('afterprint', () => {
  printDetails?.forEach(detail => { detail.open = false; });
  printDetails = null;
});
for (const form of document.querySelectorAll('[data-question] form')) {
  const feedback = form.querySelector('.feedback');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = form.querySelector('input:checked');
    feedback.textContent = !selected ? 'Choose an option, then check your reasoning.' : selected.value === form.dataset.correct ? form.dataset.success : (selected.dataset.feedback || form.dataset.hint || 'Use the hint and compare the wording before trying again.');
  });
  form.addEventListener('change', () => { feedback.textContent = ''; });
  // Bind prevention before enabling controls: no-script mode cannot submit choices.
  form.querySelector('fieldset').disabled = false;
  form.querySelector('button[type="submit"]').disabled = false;
}
