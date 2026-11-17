document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#catalog-filter-form');
  const grid = document.querySelector('#catalog-product-grid');
  const search = document.querySelector('#catalog-search-input');
  if (!form || !grid) return;
  const chips = document.createElement('div');
  chips.className = 'active-filter-chips';
  chips.setAttribute('aria-label', 'Active filters');
  grid.before(chips);
  function render() {
    chips.replaceChildren();
    form.querySelectorAll('input:checked').forEach(input => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = (input.closest('label')?.textContent.trim() || input.value) + ' ×';
      button.addEventListener('click', () => {
        input.checked = false;
        input.dispatchEvent(new Event('change', {bubbles:true}));
      });
      chips.append(button);
    });
    if (search?.value.trim()) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Search ' + search.value + ' ×';
      button.addEventListener('click', () => {search.value=''; search.dispatchEvent(new Event('input',{bubbles:true}));});
      chips.append(button);
    }
  }
  form.addEventListener('change', render);
  form.addEventListener('reset', () => setTimeout(render, 0));
  search?.addEventListener('input', render);
  render();
});
