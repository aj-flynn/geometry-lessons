const controls = document.querySelector('[data-isotope-controls]');
const share = controls?.querySelector('input');
const result = controls?.querySelector('output');
const reset = controls?.querySelector('[data-isotope-reset]');
const marker = document.querySelector('[data-mean-marker]');
const description = document.querySelector('[data-model-desc]');

if (share && result && reset && marker && description) {
  function updateModel() {
    const percent = Number(share.value);
    const fraction = percent / 100;
    const mass = (20 + 2 * fraction).toFixed(2);
    marker.setAttribute('cx', String(20 + 240 * fraction));
    result.value = `${percent}% heavier · ${mass} u average`;
    description.textContent = `With ${percent} percent heavier atoms, the mean is ${mass} u. The ends of the scale are 20.00 u and 22.00 u.`;
  }

  share.addEventListener('input', updateModel);
  reset.addEventListener('click', () => {
    share.value = share.defaultValue;
    updateModel();
  });
  updateModel();
  controls.hidden = false;
}
