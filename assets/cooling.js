const model = document.querySelector('[data-cooling]');
const comparison = document.querySelector('[data-model-fallback]');
const output = model?.querySelector('[data-result]');
const submit = model?.querySelector('button[type="submit"]');

const results = {
  mass: 'About 23.3 °C. The cooler removes the same 60 J, but it takes 90 J per degree for this mass. The drop is about 0.7 °C.',
  time: '21 °C. The cooler removes 90 J in 3 min. This mass still takes 30 J per degree, so the drop is 3 °C.'
};

if (model && comparison && output && submit) {
  model.addEventListener('submit', event => {
    event.preventDefault();
    const choice = new FormData(model).get('test');
    output.textContent = Object.hasOwn(results, choice) ? results[choice] : 'Choose a test first.';
  });
  model.addEventListener('reset', () => {
    output.textContent = 'Model reset. Choose a test and predict again.';
  });
  model.addEventListener('change', () => {
    output.textContent = '';
  });
  submit.disabled = false;
  model.hidden = false;
  comparison.hidden = true;
}
