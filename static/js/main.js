/**
 * Power-Sonic Style B2B Industrial Battery Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initRFQBasket();
  initHeaderSearch();
  initCatalogFilters();
  initRFQModal();
  initPDPGallery();
});

/* ==========================================================================
   1. RFQ Quote Basket (LocalStorage State)
   ========================================================================== */
let rfqBasket = [];

function initRFQBasket() {
  const saved = localStorage.getItem('power_sonic_rfq_basket');
  if (saved) {
    try {
      rfqBasket = JSON.parse(saved);
    } catch (e) {
      rfqBasket = [];
    }
  }
  updateBasketUI();

  // Drawer Toggle Handlers
  const basketBtn = document.getElementById('rfq-basket-btn');
  const drawerOverlay = document.getElementById('rfq-drawer-overlay');
  const drawer = document.getElementById('rfq-drawer');
  const drawerCloseBtn = document.getElementById('rfq-drawer-close');

  if (basketBtn && drawer && drawerOverlay) {
    basketBtn.addEventListener('click', () => {
      drawerOverlay.classList.add('active');
      drawer.classList.add('active');
    });
  }

  if (drawerCloseBtn && drawer && drawerOverlay) {
    drawerCloseBtn.addEventListener('click', () => {
      drawerOverlay.classList.remove('active');
      drawer.classList.remove('active');
    });
    drawerOverlay.addEventListener('click', (e) => {
      if (e.target === drawerOverlay) {
        drawerOverlay.classList.remove('active');
        drawer.classList.remove('active');
      }
    });
  }
}

function saveBasket() {
  localStorage.setItem('power_sonic_rfq_basket', JSON.stringify(rfqBasket));
  updateBasketUI();
}

function addToRFQBasket(product, qty = 1) {
  const existing = rfqBasket.find(item => item.id === product.id);
  if (existing) {
    existing.qty += parseInt(qty, 10);
  } else {
    rfqBasket.push({
      id: product.id,
      model: product.model,
      title: product.title,
      chemistry: product.chemistry,
      voltage: product.voltage,
      capacity_ah: product.capacity_ah,
      moq: product.moq || 1,
      qty: parseInt(qty, 10) || (product.moq || 1)
    });
  }
  saveBasket();
  showToast(`Added ${product.model} to RFQ Quote Basket`, 'success');

  // Open drawer automatically
  const drawerOverlay = document.getElementById('rfq-drawer-overlay');
  const drawer = document.getElementById('rfq-drawer');
  if (drawerOverlay && drawer) {
    drawerOverlay.classList.add('active');
    drawer.classList.add('active');
  }
}

function removeFromBasket(id) {
  rfqBasket = rfqBasket.filter(item => item.id !== id);
  saveBasket();
  showToast('Item removed from Quote Basket', 'info');
}

function updateBasketQty(id, qty) {
  const item = rfqBasket.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, parseInt(qty, 10) || 1);
    saveBasket();
  }
}

function updateBasketUI() {
  const countBadge = document.getElementById('basket-count-badge');
  const drawerBody = document.getElementById('rfq-drawer-items');
  const drawerFooter = document.getElementById('rfq-drawer-footer');

  const totalCount = rfqBasket.reduce((sum, item) => sum + item.qty, 0);

  if (countBadge) {
    countBadge.textContent = totalCount;
  }

  if (drawerBody) {
    if (rfqBasket.length === 0) {
      drawerBody.innerHTML = `
        <div class="text-center py-5 text-muted">
          <p class="mb-2" style="font-size: 2rem;">🛒</p>
          <p style="font-weight: 600;">Your RFQ Basket is Empty</p>
          <p style="font-size: 0.825rem;">Browse catalog and select battery specs to request bulk pricing.</p>
        </div>
      `;
      if (drawerFooter) drawerFooter.style.display = 'none';
    } else {
      if (drawerFooter) drawerFooter.style.display = 'block';
      drawerBody.innerHTML = rfqBasket.map(item => `
        <div class="drawer-item">
          <div class="drawer-item-info">
            <h4>${item.model}</h4>
            <p>${item.voltage}V ${item.capacity_ah}Ah | ${item.chemistry}</p>
          </div>
          <div class="drawer-item-qty">
            <input type="number" class="qty-input" value="${item.qty}" min="${item.moq}" onchange="updateBasketQty('${item.id}', this.value)">
            <button class="btn btn-sm text-danger" style="background:none; border:none; cursor:pointer;" onclick="removeFromBasket('${item.id}')">✕</button>
          </div>
        </div>
      `).join('');
    }
  }
}

/* ==========================================================================
   2. Header Live Search Autocomplete
   ========================================================================== */
function initHeaderSearch() {
  const input = document.getElementById('header-search-input');
  const resultsContainer = document.getElementById('header-search-results');

  if (!input || !resultsContainer) return;

  let debounceTimer;
  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const q = e.target.value.trim();

    if (q.length < 2) {
      resultsContainer.classList.remove('active');
      resultsContainer.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && data.products.length > 0) {
            resultsContainer.innerHTML = data.products.map(p => `
              <a href="/product/${p.id}" class="search-result-item">
                <div>
                  <span class="search-result-model">${p.model}</span>
                  <span style="font-size: 0.75rem; color: #64748B; display: block;">${p.title}</span>
                </div>
                <span class="badge" style="background-color:#F1F5F9; color:#1E293B; font-size:0.75rem; padding: 2px 6px; border-radius:3px;">${p.voltage}V</span>
              </a>
            `).join('');
            resultsContainer.classList.add('active');
          } else {
            resultsContainer.innerHTML = `
              <div class="p-3 text-muted style="font-size:0.85rem; text-align:center;">
                No battery specs matching "${q}"
              </div>
            `;
            resultsContainer.classList.add('active');
          }
        });
    }, 250);
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.classList.remove('active');
    }
  });
}

/* ==========================================================================
   3. Catalog Dynamic Filtering (AJAX / REST)
   ========================================================================== */
function initCatalogFilters() {
  const catalogGrid = document.getElementById('catalog-product-grid');
  const filterForm = document.getElementById('catalog-filter-form');
  const catalogSearchInput = document.getElementById('catalog-search-input');
  const resultCountEl = document.getElementById('catalog-result-count');
  const resetBtn = document.getElementById('reset-filters-btn');

  if (!catalogGrid) return;

  function fetchFilteredProducts() {
    const chemistry = Array.from(document.querySelectorAll('input[name="chemistry"]:checked')).map(cb => cb.value);
    const voltage = Array.from(document.querySelectorAll('input[name="voltage"]:checked')).map(cb => cb.value);
    const capacity = Array.from(document.querySelectorAll('input[name="capacity"]:checked')).map(cb => cb.value);
    const terminal = Array.from(document.querySelectorAll('input[name="terminal"]:checked')).map(cb => cb.value);
    const applications = Array.from(document.querySelectorAll('input[name="application"]:checked')).map(cb => cb.value);
    const search = catalogSearchInput ? catalogSearchInput.value.trim() : '';

    const payload = { chemistry, voltage, capacity, terminal, applications, search };

    fetch('/api/filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          renderCatalogProducts(data.products);
          if (resultCountEl) {
            resultCountEl.textContent = `Showing ${data.filtered_count} of ${data.total_count} Batteries`;
          }
        }
      })
      .catch(err => {
        console.error('Error fetching filtered products:', err);
      });
  }

  // Event Listeners on filters
  if (filterForm) {
    filterForm.addEventListener('change', fetchFilteredProducts);
  }
  if (catalogSearchInput) {
    let timer;
    catalogSearchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(fetchFilteredProducts, 300);
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (filterForm) filterForm.reset();
      if (catalogSearchInput) catalogSearchInput.value = '';
      fetchFilteredProducts();
    });
  }

  // Initial load
  fetchFilteredProducts();
}

function renderCatalogProducts(products) {
  const catalogGrid = document.getElementById('catalog-product-grid');
  if (!catalogGrid) return;

  if (products.length === 0) {
    catalogGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: white; border: 1px solid #E2E8F0; border-radius: 8px;">
        <h3 style="color: #0B192C; margin-bottom: 0.5rem;">No Matching Battery Specifications</h3>
        <p style="color: #64748B; max-width: 480px; margin: 0 auto 1.5rem auto;">Try adjusting your voltage, chemistry, or capacity filters to view available industrial models.</p>
        <button onclick="document.getElementById('reset-filters-btn').click()" class="btn btn-outline-navy btn-sm">Reset All Filters</button>
      </div>
    `;
    return;
  }

  catalogGrid.innerHTML = products.map(p => `
    <div class="product-card">
      <span class="product-badge-tag">${p.chemistry}</span>
      <div class="product-img-wrapper">
        <img src="${p.image}" alt="${p.model}">
      </div>
      <div class="product-body">
        <h3 class="product-model">${p.model}</h3>
        <p class="product-title">${p.title}</p>
        <div class="spec-mini-grid">
          <div class="spec-item">
            <strong>${p.voltage}V</strong>
            <span>Voltage</span>
          </div>
          <div class="spec-item">
            <strong>${p.capacity_ah} Ah</strong>
            <span>Capacity</span>
          </div>
          <div class="spec-item">
            <strong>${p.weight_kg} kg</strong>
            <span>Weight</span>
          </div>
          <div class="spec-item">
            <strong>${p.terminal_code.toUpperCase()}</strong>
            <span>Terminal</span>
          </div>
        </div>
        <div class="product-actions">
          <a href="/product/${p.id}" class="btn btn-outline-navy btn-sm">View Specs</a>
          <button class="btn btn-accent btn-sm open-rfq-modal-btn" data-product-model="${p.model}">Request Quote</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   4. B2B RFQ Form Modal & API Submit
   ========================================================================== */
function initRFQModal() {
  const modalOverlay = document.getElementById('rfq-modal-overlay');
  const modalCloseBtn = document.getElementById('rfq-modal-close');
  const rfqForm = document.getElementById('b2b-rfq-form');

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-rfq-modal-btn');
    if (btn) {
      e.preventDefault();
      const singleModel = btn.getAttribute('data-product-model');
      if (singleModel) {
        const modelInput = document.getElementById('rfq-product-model');
        if (modelInput) modelInput.value = singleModel;
      }
      if (modalOverlay) modalOverlay.classList.add('active');
    }
  });

  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  if (rfqForm) {
    rfqForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = rfqForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Request...';

      const formData = new FormData(rfqForm);
      const payload = {
        full_name: formData.get('full_name'),
        company_name: formData.get('company_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        gstin_tax_id: formData.get('gstin_tax_id'),
        product_model: formData.get('product_model'),
        estimated_qty: formData.get('estimated_qty'),
        application_details: formData.get('application_details'),
        message: formData.get('message'),
        items: rfqBasket
      };

      fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;

          if (data.status === 'success') {
            if (modalOverlay) modalOverlay.classList.remove('active');
            rfqForm.reset();
            rfqBasket = [];
            saveBasket();

            // Render Success Dialog
            alert(`✅ ${data.message}`);
          } else {
            alert(`⚠️ Error: ${data.message}`);
          }
        })
        .catch(err => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          alert('Network connection error. Please try again.');
        });
    });
  }
}

/* ==========================================================================
   5. PDP Image Gallery & Tabs
   ========================================================================== */
function initPDPGallery() {
  const mainImg = document.getElementById('pdp-main-image');
  const thumbs = document.querySelectorAll('.thumb-btn');

  if (!mainImg || thumbs.length === 0) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.getAttribute('data-img');
      if (newSrc) mainImg.src = newSrc;
    });
  });
}

/* ==========================================================================
   6. Toast Notifications
   ========================================================================== */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}
