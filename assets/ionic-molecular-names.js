// This charge model reads original trial states supplied in the lesson's static comparison.
const model = document.querySelector('#charge-trials');
const controls = model.querySelector('.trial-controls');
const trials = [...controls.querySelectorAll('button[data-trial]')];
const status = controls.querySelector('[data-trial-status]');
const comparison = [...model.querySelectorAll('.trial-fallback li')];

for (const [index, button] of trials.entries()) {
  const trial = button.dataset.trial;
  if (trial !== 'reset') button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    for (const option of trials) {
      if (option.dataset.trial !== 'reset') option.setAttribute('aria-pressed', String(option === button));
    }
    status.textContent = trial === 'reset' ? 'No trial selected.' : comparison[index].textContent;
  });
}
model.dataset.trialReady = 'true';
controls.hidden = false;
