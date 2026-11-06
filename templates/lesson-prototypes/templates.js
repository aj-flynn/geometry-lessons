/* Nine structural interpretations of Claude's shared lesson contract. */
(() => {
  'use strict';
  if (!window.LessonKit) return;
  const { el, button } = window.LessonKit;
  const order = ['prerequisite', 'explanation', 'evidence', 'worked', 'practice', 'glossary', 'recap'];
  const labels = { prerequisite: 'Warm up', explanation: 'Understand', evidence: 'Look closely', worked: 'Follow the reasoning', practice: 'Try it', glossary: 'Word bank', recap: 'Take it with you' };

  function render(source, variant) {
    const copy = source.cloneNode(true);
    const article = el('article', `lesson lesson-${variant}`);
    article.dataset.variant = variant;
    const parts = {};
    copy.querySelectorAll(':scope > [data-part]').forEach(node => {
      parts[node.dataset.part] = node;
      node.id = `part-${node.dataset.part}`;
      node.classList.add('lesson-part');
      const heading = node.querySelector('[data-field="heading"]');
      if (heading) {
        const replacement = el('h2', '', heading.textContent);
        heading.replaceWith(replacement);
      }
    });
    const title = parts.intro.querySelector('[data-field="title"]');
    const h1 = el('h1', '', title.textContent);
    h1.id = title.id;
    title.replaceWith(h1);
    article.setAttribute('aria-labelledby', h1.id);
    const add = (parent, ...keys) => keys.forEach(key => { if (parts[key]) parent.append(parts[key]); });
    const contents = (keys = order.filter(key => key !== 'glossary')) => {
      const nav = el('nav', 'lesson-outline');
      nav.setAttribute('aria-label', 'In this lesson');
      nav.append(el('p', 'outline-title', 'In this lesson'));
      keys.filter(key => parts[key]).forEach(key => {
        const link = el('a', '', labels[key]);
        link.href = `#part-${key}`;
        nav.append(link);
      });
      return nav;
    };
    function noteSpaces(parent, count = 3) {
      const notes = el('div', 'writing-space');
      notes.setAttribute('aria-label', 'Space for handwritten notes when printed');
      for (let i = 0; i < count; i++) notes.append(el('div', 'writing-line'));
      parent.append(notes);
    }

    if (variant === 'column') {
      const body = el('div', 'reading-body');
      add(article, 'intro');
      article.append(contents());
      add(body, ...order);
      article.append(body);
    } else if (variant === 'split') {
      add(article, 'intro', 'prerequisite');
      const pair = el('div', 'split-pair');
      const evidence = el('aside', 'split-evidence');
      const route = el('div', 'split-route');
      add(evidence, 'evidence');
      add(route, 'explanation', 'worked', 'practice');
      route.querySelectorAll(':scope > section').forEach(section => {
        const link = el('a', 'back-evidence', 'Return to the evidence ↑');
        link.href = '#part-evidence';
        section.append(link);
      });
      pair.append(evidence, route);
      article.append(pair);
      add(article, 'glossary', 'recap');
    } else if (variant === 'steps') {
      add(article, 'intro');
      const track = el('nav', 'step-track');
      track.setAttribute('aria-label', 'Lesson stages');
      const panel = el('div', 'guided-panel');
      const keys = order.filter(key => key !== 'glossary' && parts[key]);
      const trackButtons = [];
      keys.forEach((key, i) => {
        const tab = button(`${i + 1}. ${labels[key]}`, () => show(i, true));
        tab.setAttribute('aria-controls', parts[key].id);
        trackButtons.push(tab);
        track.append(tab);
        parts[key].classList.add('guided-pane');
        panel.append(parts[key]);
      });
      const footer = el('div', 'guided-actions');
      const count = el('span', 'guided-count');
      count.setAttribute('role', 'status');
      let index = 0;
      const back = button('← Back', () => show(index - 1, true));
      const next = button('Continue →', () => show(index + 1, true), 'primary-action');
      footer.append(back, count, next);
      article.append(track, panel, footer);
      const glossary = el('details', 'glossary-drawer');
      glossary.append(el('summary', '', 'Open the word bank'));
      add(glossary, 'glossary');
      article.append(glossary);
      function show(value, focus = false) {
        index = Math.max(0, Math.min(keys.length - 1, value));
        keys.forEach((key, i) => {
          parts[key].hidden = i !== index;
          trackButtons[i].setAttribute('aria-current', i === index ? 'step' : 'false');
        });
        count.textContent = `${index + 1} of ${keys.length} · ${labels[keys[index]]}`;
        back.disabled = index === 0;
        next.disabled = index === keys.length - 1;
        if (focus) {
          parts[keys[index]].tabIndex = -1;
          parts[keys[index]].focus({ preventScroll: true });
          panel.scrollIntoView({ block: 'start' });
        }
      }
      const workedSteps = [...(parts.worked?.querySelector('[data-steps]')?.children || [])];
      if (workedSteps.length > 1) {
        let visible = 1;
        const reveal = button('Reveal the next reasoning step', () => {
          visible++;
          workedSteps.forEach((node, i) => { node.hidden = i >= visible; });
          reveal.disabled = visible >= workedSteps.length;
          reveal.textContent = reveal.disabled ? 'All reasoning steps shown' : 'Reveal the next reasoning step';
        }, 'reasoning-reveal');
        workedSteps.forEach((node, i) => { node.hidden = i > 0; });
        parts.worked.append(reveal);
      }
      show(0);
      article.revealTarget = target => {
        const pane = target.closest('.guided-pane');
        if (pane) show(keys.indexOf(pane.dataset.part));
      };
    } else if (variant === 'bento') {
      const grid = el('div', 'bento-grid');
      add(grid, 'intro', ...order);
      article.append(grid);
    } else if (variant === 'ladder') {
      add(article, 'intro');
      const route = el('div', 'ladder-route');
      order.forEach((key, i) => {
        if (!parts[key]) return;
        const stop = el('div', 'ladder-stop');
        const marker = el('span', 'ladder-marker', String(i + 1));
        marker.setAttribute('aria-hidden', 'true');
        stop.append(marker, parts[key]);
        route.append(stop);
      });
      article.append(route);
    } else if (variant === 'inquiry') {
      add(article, 'intro');
      const observe = el('div', 'inquiry-observe');
      const prompt = el('div', 'inquiry-prompt');
      prompt.append(el('h2', '', 'What do you notice?'), el('p', '', parts.evidence?.dataset.prompt || 'Notice what is given. Make a prediction before reading on.'));
      const label = el('label', '', 'Your first thought');
      label.htmlFor = 'inquiry-thought';
      const textarea = el('textarea');
      textarea.id = label.htmlFor;
      textarea.rows = 4;
      prompt.append(label, textarea, el('p', 'note', 'A scratchpad for this visit. Your thought is not saved.'));
      observe.append(prompt);
      add(observe, 'evidence');
      article.append(observe);
      const rest = el('div', 'inquiry-route');
      add(rest, 'prerequisite', 'explanation', 'worked', 'practice', 'glossary', 'recap');
      article.append(rest);
    } else if (variant === 'reference') {
      const navigation = contents();
      const center = el('div', 'reference-body');
      const right = el('aside', 'reference-rail');
      add(center, 'intro', 'prerequisite', 'explanation', 'evidence', 'worked', 'practice', 'recap');
      const facts = el('div', 'reference-facts');
      facts.append(el('h2', '', 'Lesson at a glance'), el('p', '', source.dataset.subject), el('p', '', source.querySelector('[data-field="objective"]').textContent));
      right.append(facts);
      add(right, 'glossary');
      article.append(navigation, center, right);
    } else if (variant === 'editorial') {
      const opening = el('div', 'editorial-opening');
      add(opening, 'intro', 'prerequisite');
      article.append(opening);
      add(article, 'evidence', 'explanation', 'worked', 'practice', 'glossary', 'recap');
    } else if (variant === 'worksheet') {
      const paper = el('div', 'worksheet-paper');
      add(paper, 'intro', 'prerequisite', 'explanation');
      const row = el('div', 'worksheet-row');
      add(row, 'evidence');
      const notes = el('aside', 'worksheet-notes');
      notes.append(el('h2', '', 'My observations'), el('p', '', 'Record what is given, what changes, and what you still need to know.'));
      noteSpaces(notes, 6);
      row.append(notes);
      paper.append(row);
      add(paper, 'worked', 'practice', 'glossary', 'recap');
      paper.querySelectorAll('[data-item]').forEach(item => noteSpaces(item));
      parts.recap?.append(el('p', 'exit-ticket', 'Exit ticket: explain the key idea in your own words.'));
      if (parts.recap) noteSpaces(parts.recap, 2);
      article.append(paper);
    }
    return article;
  }
  window.LessonTemplates = { render };
})();
