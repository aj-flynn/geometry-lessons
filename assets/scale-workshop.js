const controls = document.querySelector('#stamp-controls');
const shape = document.querySelector('[data-shape]');
const widthLabel = document.querySelector('[data-width]');
const heightLabel = document.querySelector('[data-height]');
const seam = document.querySelector('[data-seam]');
const description = document.querySelector('[data-desc]');
const caption = document.querySelector('[data-caption]');

if (controls && shape && widthLabel && heightLabel && seam && description && caption) {
  const original = { width: 7, height: 5 };
  const pixelsPerCm = 12;
  const left = 24;
  const bottom = 154;
  const buttons = [...controls.querySelectorAll('button[data-factor]')];

  function draw(factor) {
    const width = original.width * factor;
    const height = original.height * factor;
    const perimeter = 2 * (width + height);
    const area = width * height;
    const right = left + width * pixelsPerCm;
    const top = bottom - height * pixelsPerCm;
    const center = (left + right) / 2;
    const middle = (top + bottom) / 2;
    shape.setAttribute('width', right - left);
    shape.setAttribute('height', bottom - top);
    shape.setAttribute('y', top);
    widthLabel.setAttribute('x', center);
    widthLabel.setAttribute('y', top - 10);
    widthLabel.textContent = width + ' cm';
    heightLabel.setAttribute('x', right + 8);
    heightLabel.setAttribute('y', middle + 5);
    heightLabel.textContent = height + ' cm';

    seam.toggleAttribute('hidden', factor !== 2);
    if (factor === 2) seam.setAttribute('d', 'M' + center + ' ' + top + 'V' + bottom + ' M' + left + ' ' + middle + 'H' + right);
    const tiles = factor === 2 ? ' Two rows of two original tiles fill the face. Trace only the solid outline.'
      : factor === 1 ? ' One original tile fills the region.' : '';
    description.textContent = 'At factor ' + factor + ' the rectangle is ' + width + ' cm wide by ' + height +
      ' cm tall, with perimeter ' + perimeter + ' cm and area ' + area + ' square centimeters.' + tiles;
    caption.textContent = 'Target at factor ' + factor + ' · ' + perimeter + ' cm around · ' + area + ' cm² inside.' + tiles;
    for (const button of buttons) button.setAttribute('aria-pressed', String(Number(button.dataset.factor) === factor));
  }

  for (const button of buttons) button.addEventListener('click', () => draw(Number(button.dataset.factor)));
  draw(1);
  controls.hidden = false;
}

for (const form of document.querySelectorAll('form[data-practice-ready="true"]')) {
  const comparison = form.nextElementSibling;
  if (comparison?.hasAttribute('data-numeric-comparison')) {
    form.hidden = false;
    comparison.hidden = true;
  }
}
