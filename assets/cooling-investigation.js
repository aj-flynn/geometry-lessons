const model = document.querySelector('#model-comparison');
const summary = model?.querySelector('summary');
const reset = model?.querySelector('[data-reset]');

if (model && summary && reset) {
  reset.addEventListener('click', () => {
    model.open = false;
    summary.focus();
  });
  reset.hidden = false;
}
