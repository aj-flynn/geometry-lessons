const endingCheck = document.querySelector('[data-agreement-check]');

if (endingCheck) {
  const options = endingCheck.querySelectorAll('input[type="radio"]');
  const check = endingCheck.querySelector('[data-check]');
  const reset = endingCheck.querySelector('[data-reset]');
  const feedback = endingCheck.querySelector('[data-ending-feedback]');

  check.addEventListener('click', () => {
    const chosen = endingCheck.querySelector('input:checked');
    const message = endingCheck.querySelector('#feedback-' + (chosen?.value ?? 'empty'));
    feedback.replaceChildren(message.content.cloneNode(true));
  });

  reset.addEventListener('click', () => {
    for (const option of options) option.checked = false;
    feedback.textContent = '';
    options[0].focus();
  });

  endingCheck.addEventListener('change', () => {
    feedback.textContent = '';
  });

  check.disabled = false;
  reset.disabled = false;
  endingCheck.dataset.ready = 'true';
}