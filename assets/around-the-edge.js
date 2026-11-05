const route = document.querySelector('[data-trace]');
if (route) {
  const stops = [
    { x: 64, y: 56, length: 0, direction: '' },
    { x: 256, y: 56, length: 4, direction: 'right' },
    { x: 256, y: 104, length: 1, direction: 'down' },
    { x: 160, y: 104, length: 2, direction: 'left' },
    { x: 160, y: 200, length: 2, direction: 'down' },
    { x: 64, y: 200, length: 2, direction: 'left' },
    { x: 64, y: 56, length: 3, direction: 'up' },
  ];
  const controls = route.querySelector('[data-trace-controls]');
  const status = route.querySelector('[data-trace-status]');
  const back = route.querySelector('[data-prev]');
  const next = route.querySelector('[data-next]');
  const reset = route.querySelector('[data-reset]');
  const robot = route.querySelector('[data-robot]');
  const legs = Array.from(route.querySelectorAll('[data-leg]'));
  if (controls && status && back && next && reset && robot && legs.length === stops.length - 1) {
    let index = 0;
    function draw() {
      const stop = stops[index];
      const total = stops.slice(0, index + 1).reduce((sum, item) => sum + item.length, 0);
      robot.setAttribute('cx', stop.x);
      robot.setAttribute('cy', stop.y);
      legs.forEach((leg, step) => leg.classList.toggle('is-traced', step < index));
      const movement = index === 0 ? 'At the start.' :
        'Stretch ' + index + ': ' + stop.direction + ' ' + stop.length + (stop.length === 1 ? ' unit.' : ' units.');
      status.textContent = movement + (index === legs.length ? ' Back at the start.' : '') + ' Total: ' + total + ' units.';
      back.setAttribute('aria-disabled', String(index === 0));
      next.setAttribute('aria-disabled', String(index === legs.length));
      reset.setAttribute('aria-disabled', String(index === 0));
    }
    back.addEventListener('click', () => { if (index > 0) { index -= 1; draw(); } });
    next.addEventListener('click', () => { if (index < legs.length) { index += 1; draw(); } });
    reset.addEventListener('click', () => { if (index > 0) { index = 0; draw(); } });
    draw();
    back.disabled = false;
    next.disabled = false;
    reset.disabled = false;
    controls.hidden = false;
  }
}
