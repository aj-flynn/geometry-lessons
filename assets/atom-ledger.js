const explorer = document.querySelector('[data-count-explorer]');
if (explorer) {
  const count = explorer.querySelector('select');
  const result = explorer.querySelector('output');
  const buttons = explorer.querySelectorAll('button');
  const draw = () => {
    const molecules = Number(count.value);
    const atoms = 2 * molecules;
    const comparison = atoms === 6 ? 'equal' : atoms < 6 ? 'short of 6' : 'more than 6';
    result.textContent = `${molecules} O₂ molecules give ${atoms} O atoms on the right, ${comparison}. The left still has 6 O atoms.`;
  };
  buttons[0].addEventListener('click', draw);
  buttons[1].addEventListener('click', () => {
    count.value = '3';
    result.textContent = '';
    count.focus();
  });
  explorer.dataset.practiceReady = 'true';
}

function greatestCommonDivisor(a, b) {
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

for (const form of document.querySelectorAll('form[data-construct]')) {
  const fields = [...form.querySelectorAll('input[type="number"]')];
  const atoms = fields.map(field => JSON.parse(field.dataset.atoms));
  const productStart = Number(form.dataset.productStart);
  const elements = [...new Set(atoms.flatMap(Object.keys))];
  const feedback = form.querySelector('output');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!fields.every(field => field.validity.valid)) return;
    const coefficients = fields.map(field => field.valueAsNumber);
    const rows = elements.map(element => {
      let left = 0;
      let right = 0;
      atoms.forEach((formula, index) => {
        const count = coefficients[index] * (formula[element] ?? 0);
        if (index < productStart) left += count;
        else right += count;
      });
      return { element, left, right };
    });
    const audit = rows.map(({element, left, right}) => `${element} ${left} left, ${right} right`).join('. ');
    const divisor = coefficients.reduce(greatestCommonDivisor);
    if (rows.some(({left, right}) => left !== right)) {
      feedback.textContent = `${audit}. ${form.dataset.retry}`;
    } else if (divisor > 1) {
      feedback.textContent = `${audit}. Each row matches. Divide every coefficient by ${divisor}, then check again.`;
    } else {
      feedback.textContent = `${audit}. Every row matches and the coefficients have no shared divisor greater than 1. Explain your first decision before comparing the worked reasoning.`;
    }
  });
  form.addEventListener('input', () => { feedback.textContent = ''; });
  form.addEventListener('reset', () => {
    feedback.textContent = '';
    fields[0].focus();
  });
  form.querySelector('button[type="submit"]').disabled = false;
  form.dataset.practiceReady = 'true';
}
