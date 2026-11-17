const model = document.querySelector('[data-trace-model]');
const controls = model?.querySelector('[data-trace-controls]');
const diagram = model?.querySelector('[data-trace-diagram]');
const status = model?.querySelector('[data-trace-status]');
const toggle = model?.querySelector('[data-trace-instant]');
const buttons = model?.querySelectorAll('button[data-trace-choice]');

if (controls && diagram && status && toggle && buttons?.length === 3) {
  const explanations = {
    arcs: 'The paired arcs give equal angles. An angle bisector gives the same left-to-right ratio for the two lengths meeting at the vertex and for the two pieces opposite it.',
    square: 'The right-angle square gives 90 degrees at the foot. That mark gives a height and does not tell how to divide the opposite side.',
    clear: 'Trace cleared. Both marks are visible.'
  };

  const select = choice => {
    diagram.dataset.tracing = choice;
    for (const button of buttons) {
      if (button.hasAttribute('aria-pressed')) {
        button.setAttribute('aria-pressed', String(button.dataset.traceChoice === choice));
      }
    }
    status.textContent = explanations[choice];
  };

  for (const button of buttons) {
    button.addEventListener('click', () => select(button.dataset.traceChoice));
  }
  toggle.addEventListener('change', () => {
    diagram.dataset.instant = String(toggle.checked);
  });
  controls.hidden = false;
}
