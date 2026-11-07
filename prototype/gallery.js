(() => {
  'use strict';
  if (!window.LessonKit || !window.LessonTemplates) return;
  const { el, button, enhance } = window.LessonKit;
  const stage = document.getElementById('stage');
  const sources = [...document.querySelectorAll('[data-lesson]')];
  const templates = [...document.querySelectorAll('#gal-catalogue [data-template]')].map(node => ({
    key: node.dataset.template,
    name: node.querySelector('[data-name]').textContent,
    description: node.querySelector('[data-desc]').textContent
  }));
  const sourceById = new Map(sources.map(node => [node.dataset.lesson, node]));
  const select = document.getElementById('gal-lesson');
  sources.forEach(source => {
    const option = el('option', '', `${source.dataset.subject} · ${source.querySelector('[data-field="title"]').textContent}`);
    option.value = source.dataset.lesson;
    select.append(option);
  });
  const chips = document.getElementById('gal-chips');
  const chipButtons = templates.map((template, i) => {
    const li = el('li');
    const control = button('', () => navigate({ template: template.key }));
    const drawing = el('span', `layout-swatch swatch-${template.key}`);
    drawing.setAttribute('aria-hidden', 'true');
    for (let j = 0; j < 5; j++) drawing.append(el('i'));
    control.append(drawing, el('span', 'chip-name', template.name), el('span', 'chip-number', String(i + 1)));
    control.title = template.description;
    li.append(control);
    chips.append(li);
    return control;
  });
  const favButton = document.getElementById('gal-fav');
  let state;
  function readState() {
    const params = new URL(location.href).searchParams;
    return {
      template: templates.some(t => t.key === params.get('template')) ? params.get('template') : 'column',
      lesson: sourceById.has(params.get('lesson')) ? params.get('lesson') : '0001',
      favourite: templates.some(t => t.key === params.get('favourite')) ? params.get('favourite') : '',
      standalone: params.get('view') === 'standalone'
    };
  }
  function updatePick() {
    const chosen = templates.find(t => t.key === state.favourite);
    const currentPicked = state.favourite === state.template;
    favButton.textContent = currentPicked ? '✓ Your chosen template' : 'Choose this template';
    favButton.setAttribute('aria-pressed', String(currentPicked));
    document.getElementById('gal-fav-note').textContent = chosen ? `Your pick: ${chosen.name}.` : 'Your choice is still open.';
  }
  function paint() {
    const template = templates.find(t => t.key === state.template);
    const source = sourceById.get(state.lesson);
    const article = window.LessonTemplates.render(source, state.template);
    enhance(article);
    stage.replaceChildren(article);
    select.value = state.lesson;
    document.getElementById('gal-name').textContent = template.name;
    document.getElementById('gal-text').textContent = template.description;
    document.getElementById('gal-source').href = source.dataset.href;
    const previewUrl = new URL(location.href);
    previewUrl.hash = '';
    previewUrl.searchParams.set('template', state.template);
    previewUrl.searchParams.set('lesson', state.lesson);
    previewUrl.searchParams.set('view', 'standalone');
    previewUrl.searchParams.delete('favourite');
    document.getElementById('gal-open').href = previewUrl.href;
    document.documentElement.classList.toggle('standalone-preview', state.standalone);
    document.title = state.standalone
      ? `${source.querySelector('[data-field="title"]').textContent} · ${template.name} prototype`
      : `${template.name} · Lesson template gallery`;
    chipButtons.forEach((control, i) => {
      control.setAttribute('aria-pressed', String(templates[i].key === state.template));
    });
    document.getElementById('gal-live').textContent = `${template.name}. ${source.querySelector('[data-field="title"]').textContent}.`;
    document.getElementById('gal-status').textContent = '';
    updatePick();
    stage.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const target = document.getElementById(link.hash.slice(1));
        if (!target) return;
        event.preventDefault();
        article.revealTarget?.(target);
        for (let parent = target.parentElement; parent; parent = parent.parentElement) {
          if (parent.tagName === 'DETAILS') parent.open = true;
        }
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start' });
      });
    });
  }
  function navigate(change) {
    const prior = state;
    state = { ...state, ...change };
    const url = new URL(location.href);
    url.hash = '';
    url.searchParams.set('template', state.template);
    url.searchParams.set('lesson', state.lesson);
    if (state.favourite) url.searchParams.set('favourite', state.favourite);
    else url.searchParams.delete('favourite');
    history.pushState(null, '', url);
    if (prior.template !== state.template || prior.lesson !== state.lesson) paint();
    else updatePick();
  }
  function cycle(direction) {
    const i = templates.findIndex(t => t.key === state.template);
    navigate({ template: templates[(i + direction + templates.length) % templates.length].key });
  }
  document.getElementById('gal-prev').addEventListener('click', () => cycle(-1));
  document.getElementById('gal-next').addEventListener('click', () => cycle(1));
  select.addEventListener('change', () => navigate({ lesson: select.value }));
  favButton.addEventListener('click', () => {
    navigate({ favourite: state.template });
    document.getElementById('gal-status').textContent = `Chosen: ${templates.find(t => t.key === state.template).name}. The address now includes your pick. Share this link or tell me the template name.`;
  });
  document.addEventListener('keydown', event => {
    if (state.standalone) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === '[') { event.preventDefault(); cycle(-1); }
    else if (event.key === ']') { event.preventDefault(); cycle(1); }
    else if (/^[1-9]$/.test(event.key)) { event.preventDefault(); navigate({ template: templates[Number(event.key) - 1].key }); }
  });
  window.addEventListener('popstate', () => { state = readState(); paint(); });
  let openedForPrint = [];
  window.addEventListener('beforeprint', () => {
    openedForPrint = [...stage.querySelectorAll('details:not([open])')];
    openedForPrint.forEach(node => { node.open = true; });
  });
  window.addEventListener('afterprint', () => {
    openedForPrint.forEach(node => { node.open = false; });
    openedForPrint = [];
  });
  state = readState();
  paint();
  document.querySelectorAll('[data-js-only]').forEach(node => { node.hidden = false; });
  document.documentElement.classList.add('gallery-ready');
})();
