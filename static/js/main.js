/**
 * Sunka Style B2B Industrial Battery Application Controller
 * Fully Mobile & Desktop Responsive
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeaderSearch();
  initCatalogFilters();
  initRFQBasket();
  initRFQModal();
  initPDPGallery();
});

/* ==========================================================================
   1. Mobile Navigation & Drawer Handlers
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const bottomBarMenuBtn = document.getElementById('mobile-bar-menu-btn');
  const closeBtn = document.getElementById('mobile-nav-close');
  const drawer = document.getElementById('mobile-nav-drawer');
  const overlay = document.getElementById('mobile-nav-overlay');

  function openMobileNav() {
    if (drawer && overlay) {
      drawer.classList.add('active');
      overlay.classList.add('active');
      if (toggleBtn) toggleBtn.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileNav() {
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      if (toggleBtn) toggleBtn.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drawer && drawer.classList.contains('active')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (bottomBarMenuBtn) {
    bottomBarMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMobileNav();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileNav);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileNav);
  }

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileNav();
      const filterSidebar = document.getElementById('filter-sidebar');
      const filterOverlay = document.getElementById('filter-sidebar-overlay');
      if (filterSidebar) filterSidebar.classList.remove('mobile-open');
      if (filterOverlay) filterOverlay.classList.remove('active');
      const rfqModal = document.getElementById('rfq-modal-overlay');
      if (rfqModal) rfqModal.classList.remove('active');
    }
  });
}

/* ==========================================================================
   2. Live Search Autocomplete (Desktop & Mobile)
   ========================================================================== */
function setupSearchAutocomplete(inputId, resultsId) {
  const input = document.getElementById(inputId);
  const resultsContainer = document.getElementById(resultsId);

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
                <span class="pdp-badge" style="font-size:0.75rem;">${p.voltage}V</span>
              </a>
            `).join('');
            resultsContainer.classList.add('active');
          } else {
            resultsContainer.innerHTML = `
              <div style="padding: 1rem; color: #64748B; font-size: 0.85rem; text-align: center;">
                No battery specs matching "${q}"
              </div>
            `;
            resultsContainer.classList.add('active');
          }
        })
        .catch(() => {
          resultsContainer.classList.remove('active');
        });
    }, 250);
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.classList.remove('active');
    }
  });
}

function initHeaderSearch() {
  setupSearchAutocomplete('header-search-input', 'header-search-results');
  setupSearchAutocomplete('mobile-search-input', 'mobile-search-results');
}

/* ==========================================================================
   3. Catalog Dynamic Filtering & Mobile Offcanvas Sheet
   ========================================================================== */
function initCatalogFilters() {
  const catalogGrid = document.getElementById('catalog-product-grid');
  const filterForm = document.getElementById('catalog-filter-form');
  const catalogSearchInput = document.getElementById('catalog-search-input');
  const resultCountEl = document.getElementById('catalog-result-count');
  const mobileCountEl = document.getElementById('mobile-catalog-count');
  const resetBtn = document.getElementById('reset-filters-btn');
  const filterBadge = document.getElementById('active-filter-badge');

  // Mobile Filter Drawer Elements
  const filterToggleBtn = document.getElementById('mobile-filter-toggle-btn');
  const filterSidebar = document.getElementById('filter-sidebar');
  const filterOverlay = document.getElementById('filter-sidebar-overlay');
  const closeFilterBtn = document.getElementById('close-filter-sidebar-btn');
  const applyFilterBtn = document.getElementById('apply-filters-btn');

  function openMobileFilter() {
    if (filterSidebar && filterOverlay) {
      filterSidebar.classList.add('mobile-open');
      filterOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileFilter() {
    if (filterSidebar && filterOverlay) {
      filterSidebar.classList.remove('mobile-open');
      filterOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (filterToggleBtn) {
    filterToggleBtn.addEventListener('click', openMobileFilter);
  }
  if (closeFilterBtn) {
    closeFilterBtn.addEventListener('click', closeMobileFilter);
  }
  if (applyFilterBtn) {
    applyFilterBtn.addEventListener('click', closeMobileFilter);
  }
  if (filterOverlay) {
    filterOverlay.addEventListener('click', closeMobileFilter);
  }

  if (!catalogGrid) return;

  function updateFilterBadge() {
    if (!filterForm || !filterBadge) return;
    const checkedCount = filterForm.querySelectorAll('input[type="checkbox"]:checked').length;
    if (checkedCount > 0) {
      filterBadge.textContent = checkedCount;
      filterBadge.style.display = 'inline-block';
    } else {
      filterBadge.style.display = 'none';
    }
  }

  function fetchFilteredProducts() {
    const chemistry = Array.from(document.querySelectorAll('input[name="chemistry"]:checked')).map(cb => cb.value);
    const voltage = Array.from(document.querySelectorAll('input[name="voltage"]:checked')).map(cb => cb.value);
    const capacity = Array.from(document.querySelectorAll('input[name="capacity"]:checked')).map(cb => cb.value);
    const terminal = Array.from(document.querySelectorAll('input[name="terminal"]:checked')).map(cb => cb.value);
    const applications = Array.from(document.querySelectorAll('input[name="application"]:checked')).map(cb => cb.value);
    const search = catalogSearchInput ? catalogSearchInput.value.trim() : '';

    updateFilterBadge();

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
          const countText = `Showing ${data.filtered_count} of ${data.total_count} Batteries`;
          if (resultCountEl) {
            resultCountEl.textContent = countText;
          }
          if (mobileCountEl) {
            mobileCountEl.textContent = `${data.filtered_count} Models`;
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
      <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1rem; background: white; border: 1px solid #E2E8F0; border-radius: 10px;">
        <h3 style="color: #0B192C; margin-bottom: 0.5rem; font-size: 1.3rem;">No Matching Battery Specifications</h3>
        <p style="color: #64748B; max-width: 480px; margin: 0 auto 1.5rem auto; font-size: 0.95rem;">Try adjusting your voltage, chemistry, or capacity filters to view available industrial models.</p>
        <button onclick="document.getElementById('reset-filters-btn').click()" class="btn btn-outline-navy btn-sm">Reset All Filters</button>
      </div>
    `;
    return;
  }

  catalogGrid.innerHTML = products.map(p => `
    <div class="product-card">
      <span class="product-badge-tag ${p.chemistry_code === 'lithium' ? 'badge-lithium' : (p.chemistry_code === 'gel' ? 'badge-gel' : '')}">${p.chemistry}</span>
      <div class="product-img-wrapper">
        <img src="${p.image}" alt="${p.model}" loading="lazy">
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
            <strong>${(p.terminal_code || 'F2').toUpperCase()}</strong>
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
   4. RFQ Basket LocalStorage State
   ========================================================================== */
let rfqBasket = [];

function initRFQBasket() {
  const saved = localStorage.getItem('sunka_rfq_basket') || localStorage.getItem('power_sonic_rfq_basket');
  if (saved) {
    try {
      rfqBasket = JSON.parse(saved);
    } catch (e) {
      rfqBasket = [];
    }
  }
  updateBasketUI();
}

function saveBasket() {
  localStorage.setItem('sunka_rfq_basket', JSON.stringify(rfqBasket));
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
}

function updateBasketUI() {
  const countBadge = document.getElementById('basket-count-badge');
  const totalCount = rfqBasket.reduce((sum, item) => sum + item.qty, 0);
  if (countBadge) {
    countBadge.textContent = totalCount;
  }
}

/* ==========================================================================
   5. B2B RFQ Form Modal & API Submit
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
      if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
  });

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
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
            closeModal();
            rfqForm.reset();
            rfqBasket = [];
            saveBasket();
            showToast(`✅ ${data.message}`, 'success');
          } else {
            showToast(`⚠️ Error: ${data.message}`, 'error');
          }
        })
        .catch(err => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          showToast('Network connection error. Please try again.', 'error');
        });
    });
  }
}

/* ==========================================================================
   6. PDP Image Gallery & Tabs
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
   7. Toast Notifications
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
  }, 4000);
}
