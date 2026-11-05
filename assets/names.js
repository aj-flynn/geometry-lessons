const subscripts = '₀₁₂₃₄₅₆₇₈₉';
for (const form of document.querySelectorAll('form[data-label-check]')) {
  const input = form.querySelector('input');
  const submit = form.querySelector('button');
  const result = form.querySelector('[data-result]');
  const mistakes = JSON.parse(form.dataset.mistakes);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = form.dataset.mode === 'formula'
      ? input.value.replace(/[₀-₉]/g, digit => String(subscripts.indexOf(digit))).replace(/\s/g, '')
      : input.value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\s+\(/g, '(');
    result.textContent = value === form.dataset.key
      ? form.dataset.success
      : Object.hasOwn(mistakes, value)
        ? mistakes[value] + ' Try again.'
        : 'Read each part back against the given label. Check the element symbols, counts and naming method, then try again.';
  });
  submit.disabled = false;
  form.hidden = false;
  if (form.nextElementSibling?.classList.contains('static-feedback')) form.nextElementSibling.hidden = true;
}

const balance = document.querySelector('[data-balance]');
const zinc = document.querySelector('#zinc-count');
const phosphate = document.querySelector('#phosphate-count');
const status = balance.querySelector('[data-balance-result]');
const initialMessage = status.textContent;

function drawTokens(ion, count) {
  const row = balance.querySelector('[data-tokens="' + ion + '"]');
  const token = row.firstElementChild;
  row.replaceChildren(...Array.from({ length: count }, () => token.cloneNode(true)));
}

balance.addEventListener('submit', event => {
  event.preventDefault();
  const zincCount = zinc.valueAsNumber;
  const phosphateCount = phosphate.valueAsNumber;
  drawTokens('zinc', zincCount);
  drawTokens('phosphate', phosphateCount);
  const net = zincCount * 2 - phosphateCount * 3;
  const total = net > 0 ? '+' + net : String(net).replace('-', '−');
  const equation = zincCount + ' × (+2) + ' + phosphateCount + ' × (−3) = ' + total + '. ';
  let explanation = 'The negative total is larger. Try raising the zinc count.';
  if (net > 0) explanation = 'The positive total is larger. Try raising the phosphate count.';
  if (net === 0) {
    explanation = zincCount === 3
      ? 'This is the smallest neutral ratio. It gives Zn₃(PO₄)₂.'
      : 'This trial is neutral. Divide both counts by two to get the smallest neutral ratio.';
  }
  status.textContent = equation + explanation;
});
balance.addEventListener('reset', () => {
  drawTokens('zinc', 1);
  drawTokens('phosphate', 1);
  status.textContent = initialMessage;
});
for (const button of balance.querySelectorAll('button')) button.disabled = false;
balance.hidden = false;
balance.nextElementSibling.hidden = true;
