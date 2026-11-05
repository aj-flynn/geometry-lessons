const form = document.querySelector('form[data-check]');
if (form) {
  const choice = form.querySelector('select');
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[data-feedback]');
  const messages = {
    you: 'That form speaks to Nico as “you.” Nico is replying about himself. Try the “I” form.',
    ending: 'The verb fits “I.” For Nico, use the adjective form that ends in -o. Try again.',
  };
  if (choice && button && status) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (choice.value === 'fit') {
        const verb = document.createElement('span');
        verb.lang = 'es';
        verb.textContent = 'Estoy inquieto.';
        status.replaceChildren(verb, ' Nico speaks about himself, so the “I” form fits. The adjective matches Nico and means “uneasy.”');
      } else {
        status.textContent = messages[choice.value] || 'Choose a reply first.';
      }
    });
    choice.addEventListener('change', () => {
      status.textContent = '';
    });
    button.disabled = false;
    form.hidden = false;
    form.dataset.ready = 'true';
  }
}
