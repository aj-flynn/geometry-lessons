const ledger = document.querySelector('[data-reaction-ledger]');

if (ledger) {
  const count = ledger.querySelector('[data-count]');
  const lead = ledger.querySelector('[data-pb]');
  const nitrogen = ledger.querySelector('[data-n]');
  const oxygen = ledger.querySelector('[data-o]');
  const status = ledger.querySelector('[data-ledger-status]');
  const less = ledger.querySelector('[data-less]');
  const more = ledger.querySelector('[data-more]');
  const restart = ledger.querySelector('[data-restart]');
  let coefficient = 1;

  function draw(announce = false) {
    const nitrogenAtoms = 2 * coefficient;
    const oxygenAtoms = 6 * coefficient + 8;
    count.textContent = coefficient === 1 ? '' : `${coefficient} `;
    lead.textContent = coefficient;
    nitrogen.textContent = nitrogenAtoms;
    oxygen.textContent = oxygenAtoms;
    lead.toggleAttribute('data-match', coefficient === 3);
    less.setAttribute('aria-disabled', coefficient === 1);
    more.setAttribute('aria-disabled', coefficient === 4);
    if (announce) {
      status.textContent = `Lead(II) nitrate coefficient ${coefficient}. Left totals are ${coefficient} Pb, 6 K, 2 P, ${nitrogenAtoms} N and ${oxygenAtoms} O atoms.`;
    }
  }

  less.addEventListener('click', () => {
    if (coefficient > 1) {
      coefficient -= 1;
      draw(true);
    }
  });
  more.addEventListener('click', () => {
    if (coefficient < 4) {
      coefficient += 1;
      draw(true);
    }
  });
  restart.addEventListener('click', () => {
    coefficient = 1;
    draw(true);
  });
  draw();
  ledger.hidden = false;
}

const trials = document.querySelector('[data-oxygen-trials]');

if (trials) {
  const choices = [...trials.querySelectorAll('[data-trial]')];
  const reset = trials.querySelector('[data-trial-reset]');
  const status = trials.querySelector('[data-trial-status]');
  const cells = Object.fromEntries([
    'o2-coefficient', 'no-coefficient', 'water-coefficient',
    'n-right', 'h-right', 'o-left', 'o-right', 'o-no', 'o-water',
  ].map(name => [name, trials.querySelector(`[data-${name}]`)]));

  function showTrial(choice, announce = true) {
    const oxygen = choice === 'o2' ? 3 : 2;
    const nitrogenMonoxide = choice === 'no' ? 3 : 2;
    const water = choice === 'water' ? 4 : 3;
    const oxygenLeft = 2 * oxygen;
    const oxygenRight = nitrogenMonoxide + water;
    const hydrogenRight = 2 * water;
    const values = {
      'o2-coefficient': oxygen,
      'no-coefficient': nitrogenMonoxide,
      'water-coefficient': water,
      'n-right': nitrogenMonoxide,
      'h-right': hydrogenRight,
      'o-left': oxygenLeft,
      'o-right': oxygenRight,
      'o-no': nitrogenMonoxide,
      'o-water': water,
    };
    for (const [name, value] of Object.entries(values)) cells[name].textContent = value;
    cells['n-right'].toggleAttribute('data-match', nitrogenMonoxide === 2);
    cells['h-right'].toggleAttribute('data-match', hydrogenRight === 6);
    for (const button of choices) {
      button.setAttribute('aria-pressed', button.dataset.trial === choice);
    }
    if (announce) {
      const action = choice ? '' : 'Starting equation restored. ';
      status.textContent = `${action}Nitrogen atoms, left 2 and right ${nitrogenMonoxide}. Hydrogen, left 6 and right ${hydrogenRight}. Oxygen, left ${oxygenLeft} and right ${oxygenRight}. On the right, ${nitrogenMonoxide} oxygen atoms come from nitrogen monoxide and ${water} from water.`;
    }
  }

  for (const button of choices) {
    button.addEventListener('click', () => showTrial(button.dataset.trial));
  }
  reset.addEventListener('click', () => showTrial(null));
  showTrial(null, false);
  trials.hidden = false;
}
