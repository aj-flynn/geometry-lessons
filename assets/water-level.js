// Enhances the fictional tray only. The comparison remains usable without this file.
for (const tray of document.querySelectorAll('[data-tray]')) {
  const controls = tray.querySelector('[data-model-controls]');
  const fan = controls.querySelector('select');
  const reset = controls.querySelector('[data-reset]');
  const figure = tray.querySelector('[data-model-figure]');
  const water = figure.querySelector('[data-water]');
  const description = figure.querySelector('[data-tray-desc]');
  const result = figure.querySelector('[data-model-result]');
  const comparison = tray.querySelector('[data-model-comparison]');
  const settings = {
    off: {
      surface: 'M45 96 H385 V146 H45 Z',
      explanation: 'Fan off. The surface is level and matches the dashed still-water line.',
    },
    sealed: {
      surface: 'M45 113 L385 79 V146 H45 Z',
      explanation: 'Wind toward the sealed end. Water stands above the still-water line there and below it at the gate end.',
    },
    gate: {
      surface: 'M45 79 L385 113 V146 H45 Z',
      explanation: 'Wind toward the gate end. Water stands above the still-water line there and below it at the sealed end.',
    },
  };

  function draw() {
    const setting = settings[fan.value];
    water.setAttribute('d', setting.surface);
    description.textContent = setting.explanation;
    result.textContent = setting.explanation;
  }

  fan.addEventListener('change', draw);
  reset.addEventListener('click', () => {
    fan.value = 'off';
    draw();
    fan.focus();
  });
  draw();
  fan.disabled = false;
  reset.disabled = false;
  controls.hidden = false;
  figure.hidden = false;
  comparison.hidden = true;
}
