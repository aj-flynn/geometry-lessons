// Controls for original examples. Selections are held in this page only.
for (const lab of document.querySelectorAll('[data-lab]')) {
  const live = lab.querySelector('[data-lab-live]');
  const wordButton = lab.querySelector('[data-switch-word]');
  const countButton = lab.querySelector('[data-switch-count]');
  const reset = lab.querySelector('[data-lab-reset]');
  const thing = lab.querySelector('[data-thing]');
  const verb = lab.querySelector('[data-verb]');
  const smooth = lab.querySelector('[data-smooth]');
  const sturdy = lab.querySelector('[data-sturdy]');
  const note = lab.querySelector('[data-lab-note]');
  if (!live || !wordButton || !countButton || !reset || !thing || !verb || !smooth || !sturdy || !note) continue;

  const labels = [
    ['El telón', 'Los telones', 'liso', 'lisos'],
    ['La cortina', 'Las cortinas', 'lisa', 'lisas']
  ];
  let word = 0;
  let count = 0;

  function show(message) {
    thing.textContent = labels[word][count];
    verb.textContent = count ? 'son' : 'es';
    smooth.textContent = labels[word][count + 2];
    sturdy.textContent = count ? 'resistentes' : 'resistente';
    note.textContent = message;
  }

  wordButton.addEventListener('click', () => {
    word = 1 - word;
    show('Only the noun’s gender changed. The smooth ending changes with it. The sturdy ending and the verb stay the same.');
  });
  countButton.addEventListener('click', () => {
    count = 1 - count;
    show('Only the number changed. Both adjective endings and the verb follow it.');
  });
  reset.addEventListener('click', () => {
    word = 0;
    count = 0;
    show('Back to the start. One curtain. The word for it is masculine.');
  });
  live.hidden = false;
}

for (const check of document.querySelectorAll('[data-check]')) {
  const live = check.querySelector('[data-check-live]');
  const compare = check.querySelector('[data-check-static]');
  const checkButton = check.querySelector('[data-check-button]');
  const retry = check.querySelector('[data-check-reset]');
  const feedback = check.querySelector('[data-check-note]');
  const options = [...check.querySelectorAll('input[type="radio"]')];
  if (!live || !compare || !checkButton || !retry || !feedback || !options.length) continue;

  checkButton.addEventListener('click', () => {
    const chosen = options.find(option => option.checked);
    feedback.textContent = chosen ? chosen.dataset.note : 'Choose a line to get feedback.';
    if (!chosen) options[0].focus();
  });
  for (const option of options) {
    option.addEventListener('change', () => { feedback.textContent = ''; });
  }
  retry.addEventListener('click', () => {
    for (const option of options) option.checked = false;
    feedback.textContent = '';
    options[0].focus();
  });
  live.hidden = false;
  compare.hidden = true;
}
