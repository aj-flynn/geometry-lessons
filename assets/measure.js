const mosaic = document.querySelector('[data-mosaic]');
const controls = mosaic?.querySelector('[data-mosaic-controls]');
const feedback = mosaic?.querySelector('[data-mosaic-feedback]');

if (controls && feedback) {
  const explanations = {
    edge: 'Trace around the four sides. Count 4, then 2, then 4, then 2 small edges. That is 12 inches.',
    tiles: 'Look inside the outline. Count two rows of four tiles. That is 8 square inches.',
    plain: 'Picture reset. Choose a way to count.'
  };

  for (const button of controls.querySelectorAll('[data-show]')) {
    button.addEventListener('click', () => {
      const mode = button.dataset.show;
      mosaic.dataset.mode = mode;
      feedback.textContent = explanations[mode];
    });
  }

  controls.hidden = false;
}
