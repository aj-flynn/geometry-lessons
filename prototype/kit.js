/* Shared, local-only lesson interactions. Source material is public sample content. */
(() => {
  'use strict';
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function button(text, action, className = '') {
    const node = el('button', className, text);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }
  function enhance(root) {
    root.querySelectorAll('form[data-check]').forEach(form => {
      const feedback = form.querySelector('.feedback');
      if (!feedback) return;
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        let message = '';
        if (form.dataset.check === 'choice') {
          message = form.querySelector('input:checked')?.dataset.response || 'Choose an option first.';
        } else {
          const input = form.querySelector('input[type="number"]');
          const value = input.valueAsNumber;
          if (!Number.isFinite(value)) return;
          const expected = Number(form.dataset.expected);
          const tolerance = Number(form.dataset.tolerance || 0.000001);
          const mistakes = JSON.parse(form.dataset.mistakes || '{}');
          message = Math.abs(value - expected) <= tolerance
            ? form.dataset.success : mistakes[String(value)] || form.dataset.hint || 'Try again, then compare your reasoning.';
        }
        feedback.textContent = message;
      });
      form.addEventListener('reset', () => { feedback.textContent = ''; });
      form.querySelectorAll('button').forEach(node => { node.disabled = false; });
    });
    root.querySelectorAll('[data-stepper]').forEach(model => {
      const stages = [...model.querySelectorAll('.stage-notes > ol > li')];
      if (!stages.length) return;
      let index = 0;
      const controls = el('div', 'model-controls');
      const status = el('p', 'model-status');
      status.setAttribute('role', 'status');
      const count = el('span', 'model-count');
      const back = button('Previous', () => show(index - 1));
      const next = button('Next stage', () => show(index + 1));
      const reset = button('Reset model', () => show(0));
      controls.append(back, count, next, reset);
      model.querySelector('figure').after(controls, status);
      function show(value) {
        index = Math.max(0, Math.min(stages.length - 1, value));
        model.querySelectorAll('[data-only]').forEach(node => {
          node.style.display = Number(node.dataset.only) === index ? '' : 'none';
          node.classList.toggle('current-state', Number(node.dataset.only) === index);
          node.setAttribute('aria-hidden', String(Number(node.dataset.only) !== index));
        });
        model.querySelectorAll('[data-layer]').forEach(node => {
          node.style.display = Number(node.dataset.layer) <= index ? '' : 'none';
          node.classList.toggle('current-state', Number(node.dataset.layer) <= index);
          node.setAttribute('aria-hidden', String(Number(node.dataset.layer) > index));
        });
        count.textContent = `${index + 1} / ${stages.length}`;
        status.textContent = stages[index].textContent;
        back.disabled = index === 0;
        next.disabled = index === stages.length - 1;
      }
      show(0);
    });
  }
  window.LessonKit = { el, button, enhance };
})();
