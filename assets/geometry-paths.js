// Native disclosures remain usable without JavaScript. Enhance deep links and
// print all paths without retaining any learner state outside this page.
function revealTarget(hash) {
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  for (let element = target; element; element = element.parentElement) {
    if (element.tagName === 'DETAILS') element.open = true;
  }
}
document.addEventListener('click', event => {
  const link = event.target.closest?.('a[href^="#"]');
  if (link) revealTarget(link.getAttribute('href'));
});
window.addEventListener('hashchange', () => revealTarget(location.hash));
revealTarget(location.hash);

let printState;
window.addEventListener('beforeprint', () => {
  if (printState) return;
  printState = [...document.querySelectorAll('details')].map(element => ({element, open:element.open, name:element.getAttribute('name')}));
  for (const {element} of printState) element.removeAttribute('name');
  for (const {element} of printState) element.open = true;
});
window.addEventListener('afterprint', () => {
  if (!printState) return;
  for (const {element,open,name} of printState) {
    element.open = open;
    if (name !== null) element.setAttribute('name',name);
  }
  printState = undefined;
});
