const demo = document.querySelector('[data-tag]');
if (demo) {
  const actions = demo.querySelector('.tag-actions');
  const buttons = actions.querySelectorAll('button');
  const comparison = demo.querySelector('.tag-static');
  const description = demo.querySelector('[data-tag-desc]');
  const feedback = demo.querySelector('[data-tag-result]');
  const original = description.textContent;
  const explanations = {
    rim: 'Trace the four outside sides. The two 4 cm sides and two 2 cm sides make 12 cm around.',
    face: 'Count the squares inside. Two rows of four square centimeters cover 8 square centimeters.',
    both: 'Reset. The outline and the squares are both shown.'
  };
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const mode = button.dataset.show;
      demo.dataset.mode = mode;
      feedback.textContent = explanations[mode];
      description.textContent = mode === 'both' ? original : explanations[mode];
      for (const choice of buttons) {
        if (choice.hasAttribute('aria-pressed')) {
          choice.setAttribute('aria-pressed', String(choice === button));
        }
      }
    });
    button.disabled = false;
  }
  actions.hidden = false;
  comparison.hidden = true;
}

for (const form of document.querySelectorAll('form[data-practice-ready="true"]')) {
  const comparison = form.nextElementSibling;
  if (comparison?.matches('.static-feedback')) comparison.hidden = true;
}
