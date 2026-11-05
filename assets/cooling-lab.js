const outcomes = {
  1: 'One packet loses 80 J. The batch cools by 4 °C.',
  2: 'Each of the two packets loses 40 J. The batch cools by 2 °C.',
  4: 'Each of the four packets loses 20 J. The batch cools by 1 °C, half the drop for two packets.'
};

const model = document.querySelector('[data-mass-model]');
const packets = model?.querySelector('select');
const reset = model?.querySelector('[data-reset-model]');
const result = model?.querySelector('output');

if (packets && reset && result) {
  function showDrop() {
    result.value = outcomes[packets.value];
  }

  packets.addEventListener('change', showDrop);
  reset.addEventListener('click', () => {
    packets.value = '2';
    showDrop();
  });
  showDrop();
  packets.disabled = false;
  reset.disabled = false;
  model.hidden = false;
  model.dataset.modelReady = 'true';
}

for (const form of document.querySelectorAll('[data-choice-check]')) {
  const group = form.querySelector('fieldset');
  const feedback = form.querySelector('[data-choice-result]');
  const submit = form.querySelector('button[type="submit"]');
  if (!group || !feedback || !submit) continue;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const choice = form.querySelector('input:checked');
    feedback.textContent = choice?.dataset.reply ?? 'Choose an option before checking.';
  });
  group.disabled = false;
  submit.disabled = false;
  form.dataset.choiceReady = 'true';
}
