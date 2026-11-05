// The static comparison holds every label. Show a copy only after a prediction.
for (const lab of document.querySelectorAll('[data-label-lab]')) {
  const comparisons = lab.nextElementSibling;
  const choices = [...lab.querySelectorAll('input[type="radio"]')];
  const first = choices.find(choice => choice.checked);
  const show = lab.querySelector('[data-show-label]');
  const reset = lab.querySelector('[data-reset-label]');
  const result = lab.querySelector('[data-label-result]');
  if (!comparisons?.matches('[data-label-comparisons]') || !first || !show || !reset || !result) continue;

  const examples = new Map(
    [...comparisons.querySelectorAll('[data-label-example]')]
      .map(detail => [detail.dataset.labelExample, detail.querySelector('.label-example')])
  );
  if (choices.some(choice => !examples.get(choice.value))) continue;

  lab.addEventListener('change', () => result.replaceChildren());
  show.addEventListener('click', () => {
    const selected = choices.find(choice => choice.checked);
    if (selected) result.replaceChildren(examples.get(selected.value).cloneNode(true));
  });
  reset.addEventListener('click', () => {
    first.checked = true;
    result.replaceChildren();
    first.focus();
  });

  lab.hidden = false;
  comparisons.hidden = true;
}
