// Shared reading-lens and practice controls. All learner responses remain in memory.
for (const explorer of document.querySelectorAll('[data-explorer]')) {
  const buttons = [...explorer.querySelectorAll('[data-lens]')];
  function selectLens(button) {
    explorer.querySelector('[data-lens-title]').textContent = button.dataset.title;
    explorer.querySelector('[data-lens-prompt]').textContent = button.dataset.prompt;
    explorer.querySelector('[data-lens-copy]').textContent = button.dataset.copy;
    explorer.querySelector('[data-lens-note]').textContent = button.dataset.note;
    explorer.querySelector('#lens-result').hidden = true;
    explorer.querySelector('[data-lens-reveal]').setAttribute('aria-expanded', 'false');
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }
  explorer.hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => selectLens(button)));
  explorer.querySelector('[data-lens-reveal]').addEventListener('click', event => {
    const result = explorer.querySelector('#lens-result');
    result.hidden = !result.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!result.hidden));
  });
  explorer.querySelector('[data-restart]').addEventListener('click', () => { selectLens(buttons[0]); buttons[0].focus(); });
  selectLens(buttons[0]);
}
for (const lab of document.querySelectorAll('[data-context-lab]')) {
  const buttons = [...lab.querySelectorAll('[data-context]')];
  const result = lab.querySelector('[data-context-result]');
  const contexts = {
    quiet: ['The packer stays after everyone leaves and carefully wraps the bowls.', 'Helping happens without immediate public praise. This strengthens a generous reading, but private motives remain uncertain. The original promise and the action now support each other.'],
    audience: ['When visitors enter, the packer calls out, “See how much I do for this club!”', 'The appeal to visitors directly supports wanting recognition. That can coexist with helping: the work and its motive are different questions. Keep the evidence for helpful behavior while revising a claim of complete selflessness.']
  };
  lab.querySelector('[data-context-controls]').hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => {
    const [direction, reasoning] = contexts[button.dataset.context];
    result.replaceChildren();
    for (const [label, text] of [['New context: ', direction], ['Reading to compare: ', reasoning]]) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = label;
      p.append(strong, text);
      result.append(p);
    }
    result.hidden = false;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  lab.querySelector('[data-context-reset]').addEventListener('click', () => {
    result.hidden = true;
    result.replaceChildren();
    buttons.forEach(button => button.setAttribute('aria-pressed', 'false'));
    buttons[0].focus();
  });
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
    feedback.textContent = !selected ? 'Choose an explanation, then check your reasoning.' : selected.value === form.dataset.correct ? form.dataset.success : (selected.dataset.feedback || form.dataset.hint || 'Use the hint and compare the wording before trying again.');
  });
  form.addEventListener('change', () => { feedback.textContent = ''; });
  // Bind prevention before enabling controls: no-script mode cannot submit choices.
  form.querySelector('fieldset').disabled = false;
  form.querySelector('button[type="submit"]').disabled = false;
}
