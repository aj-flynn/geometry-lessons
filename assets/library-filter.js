// Library subject filter. Filtering itself is CSS (:target on the empty spans before the
// subject links), so every lesson stays visible without JavaScript. This script only marks the
// current subject link and announces how many lessons the filter shows.
const nav = document.querySelector('.subject-filter');
const status = document.querySelector('.filter-status');
if (nav && status) {
  const links = [...nav.querySelectorAll('a[data-filter]')];
  const names = new Map(links.map(link => [link.dataset.filter, link.firstChild.textContent.trim()]));
  const cards = [...document.querySelectorAll('#lessons .feed-latest[data-subject], #lessons .feed-item[data-subject]')];
  const update = () => {
    const match = /^#subject-([a-z0-9-]+)$/.exec(window.location.hash);
    const active = match && names.has(match[1]) ? match[1] : 'all';
    for (const link of links) {
      if (link.dataset.filter === active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    if (active === 'all') {
      // Announce a return to the full list, but stay quiet on first load.
      status.textContent = status.dataset.used ? `Showing all ${cards.length} lessons.` : '';
      return;
    }
    status.dataset.used = 'true';
    const shown = cards.filter(card => card.dataset.subject === active).length;
    status.textContent = shown
      ? `Showing ${shown} ${names.get(active)} ${shown === 1 ? 'lesson' : 'lessons'}.`
      : `No ${names.get(active)} lessons yet.`;
  };
  window.addEventListener('hashchange', update);
  update();
}
