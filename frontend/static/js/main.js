/**
 * MERI Industries - B2B Industrial Battery Application Controller
 * Fully Mobile & Desktop Responsive
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeaderSearch();
  initCatalogFilters();
  initContactPage();
  initRFQBasket();
  initRFQModal();
  initFloatingRFQ();
  initPDPGallery();
  initBackToTop();
  initTextScramble();
  initTextEffect();
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
      if (typeof window.closeRFQModal === 'function') window.closeRFQModal();
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
   3. Catalog Dynamic Filtering & Expandable Sidebar System
   ========================================================================== */
function initCatalogFilters() {
  const catalogGrid = document.getElementById('catalog-product-grid');
  const catalogLayout = document.getElementById('catalog-layout');
  const filterForm = document.getElementById('catalog-filter-form');
  const catalogSearchInput = document.getElementById('catalog-search-input');
  const resultCountEl = document.getElementById('catalog-result-count');
  const mobileCountEl = document.getElementById('mobile-catalog-count');
  const resetBtn = document.getElementById('reset-filters-btn');
  const filterBadge = document.getElementById('active-filter-badge');
  const desktopFilterBadge = document.getElementById('active-filter-badge-desktop');

  // Desktop Expandable Sidebar Controls
  const toggleSidebarBtn = document.getElementById('toggle-filter-sidebar-btn');
  const toggleSidebarText = document.getElementById('toggle-filter-btn-text');
  const collapseSidebarBtn = document.getElementById('collapse-sidebar-btn');

  // Mobile Filter Drawer Elements
  const filterToggleBtn = document.getElementById('mobile-filter-toggle-btn');
  const filterSidebar = document.getElementById('filter-sidebar');
  const filterOverlay = document.getElementById('filter-sidebar-overlay');
  const closeFilterBtn = document.getElementById('close-filter-sidebar-btn');

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

  function toggleSidebar(expand) {
    if (!catalogLayout) return;
    const isCollapsed = catalogLayout.classList.contains('sidebar-collapsed');
    const shouldCollapse = expand !== undefined ? !expand : !isCollapsed;

    if (shouldCollapse) {
      catalogLayout.classList.add('sidebar-collapsed');
      if (toggleSidebarBtn) {
        toggleSidebarBtn.setAttribute('aria-expanded', 'false');
      }
      if (toggleSidebarText) {
        toggleSidebarText.textContent = 'Filter Specifications';
      }
    } else {
      catalogLayout.classList.remove('sidebar-collapsed');
      if (toggleSidebarBtn) {
        toggleSidebarBtn.setAttribute('aria-expanded', 'true');
      }
      if (toggleSidebarText) {
        toggleSidebarText.textContent = 'Hide Filters';
      }
    }
  }

  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        openMobileFilter();
      } else {
        toggleSidebar();
      }
    });
  }

  if (collapseSidebarBtn) {
    collapseSidebarBtn.addEventListener('click', () => {
      toggleSidebar(false);
    });
  }

  // Filter Accordion Groups Handler
  const accordionHeaders = document.querySelectorAll('.filter-accordion .filter-group-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = header.closest('.filter-accordion');
      if (parent) {
        const isActive = parent.classList.toggle('active');
        header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      }
    });
  });

  const applyMobileFilterBtn = document.getElementById('apply-mobile-filter-btn');

  if (filterToggleBtn) {
    filterToggleBtn.addEventListener('click', openMobileFilter);
  }
  if (closeFilterBtn) {
    closeFilterBtn.addEventListener('click', closeMobileFilter);
  }
  if (filterOverlay) {
    filterOverlay.addEventListener('click', closeMobileFilter);
  }
  if (applyMobileFilterBtn) {
    applyMobileFilterBtn.addEventListener('click', () => {
      fetchFilteredProducts();
      closeMobileFilter();
    });
  }

  // Auto close mobile drawers on window resize to desktop
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 992) {
        closeMobileFilter();
        const drawer = document.getElementById('mobile-nav-drawer');
        const overlay = document.getElementById('mobile-nav-overlay');
        if (drawer) drawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        if (toggleBtn) toggleBtn.classList.remove('open');
        document.body.style.overflow = '';
      }
    }, 150);
  }, { passive: true });

  if (!catalogGrid) return;

  const toolbarResetBtn = document.getElementById('toolbar-reset-filters-btn');

  function updateFilterBadge() {
    if (!filterForm) return;
    const checkedCount = filterForm.querySelectorAll('input[type="checkbox"]:checked').length;
    const hasSearch = catalogSearchInput && catalogSearchInput.value.trim().length > 0;
    const totalActiveFilters = checkedCount + (hasSearch ? 1 : 0);

    if (totalActiveFilters > 0) {
      if (filterBadge) {
        filterBadge.textContent = totalActiveFilters;
        filterBadge.style.display = 'inline-block';
      }
      if (desktopFilterBadge) {
        desktopFilterBadge.textContent = totalActiveFilters;
        desktopFilterBadge.style.display = 'inline-block';
      }
      if (toolbarResetBtn) {
        toolbarResetBtn.style.display = 'inline-flex';
      }
    } else {
      if (filterBadge) filterBadge.style.display = 'none';
      if (desktopFilterBadge) desktopFilterBadge.style.display = 'none';
      if (toolbarResetBtn) toolbarResetBtn.style.display = 'none';
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

  function resetAllFilters() {
    if (filterForm) filterForm.reset();
    if (catalogSearchInput) catalogSearchInput.value = '';
    fetchFilteredProducts();
  }

  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
  if (toolbarResetBtn) toolbarResetBtn.addEventListener('click', resetAllFilters);

  // Check URL params for initial filters on catalog page
  const urlParams = new URLSearchParams(window.location.search);
  const chemParam = urlParams.get('chemistry');
  const voltParam = urlParams.get('voltage');
  const capParam = urlParams.get('capacity');
  const termParam = urlParams.get('terminal');
  const appParam = urlParams.get('application') || urlParams.get('applications');
  const searchParam = urlParams.get('search') || urlParams.get('q') || urlParams.get('query');

  let hasInitialFilters = false;

  if (filterForm) {
    if (chemParam) {
      hasInitialFilters = true;
      const chemValues = chemParam.split(',');
      chemValues.forEach(val => {
        const clean = val.trim().toLowerCase();
        const cb = filterForm.querySelector(`input[name="chemistry"][value="${clean}"]`);
        if (cb) cb.checked = true;
      });
    }
    if (voltParam) {
      hasInitialFilters = true;
      const voltValues = voltParam.split(',');
      voltValues.forEach(val => {
        const clean = val.trim();
        const cb = filterForm.querySelector(`input[name="voltage"][value="${clean}"]`);
        if (cb) cb.checked = true;
      });
    }
    if (capParam) {
      hasInitialFilters = true;
      const capValues = capParam.split(',');
      capValues.forEach(val => {
        const clean = val.trim();
        const cb = filterForm.querySelector(`input[name="capacity"][value="${clean}"]`);
        if (cb) cb.checked = true;
      });
    }
    if (termParam) {
      hasInitialFilters = true;
      const termValues = termParam.split(',');
      termValues.forEach(val => {
        const clean = val.trim().toLowerCase();
        const cb = filterForm.querySelector(`input[name="terminal"][value="${clean}"]`);
        if (cb) cb.checked = true;
      });
    }
    if (appParam) {
      hasInitialFilters = true;
      const appValues = appParam.split(',');
      appValues.forEach(val => {
        const cleanVal = val.trim().toLowerCase();
        filterForm.querySelectorAll('input[name="application"]').forEach(cb => {
          if (cb.value.toLowerCase().includes(cleanVal) || cleanVal.includes(cb.value.toLowerCase())) {
            cb.checked = true;
          }
        });
      });
    }
  }

  if (searchParam && catalogSearchInput) {
    hasInitialFilters = true;
    catalogSearchInput.value = searchParam;
  }

  // If initial filters exist and on desktop, auto-expand sidebar so user sees applied filters
  if (hasInitialFilters && window.innerWidth > 992 && typeof toggleSidebar === 'function') {
    toggleSidebar(true);
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
      <span class="product-badge-tag ${p.chemistry_code === 'lithium' ? 'badge-lithium' : ''}">${p.chemistry}</span>
      <div class="product-img-wrapper">
        <img src="${p.image}" alt="${p.model} ${p.voltage}V ${p.capacity_ah}Ah ${p.chemistry} Industrial Battery" loading="lazy" width="300" height="220" onerror="this.onerror=null; this.src='/static/images/deep_cycle_gel_battery.jpg';">
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
          <button type="button" class="btn btn-accent btn-sm open-rfq-modal-btn" data-product-model="${p.model}">Request Quote</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   4. Contact & Bulk Quote Page Form Handling
   ========================================================================== */
function initContactPage() {
  const contactForm = document.getElementById('contact-page-form');
  if (!contactForm) return;

  // 1. Auto pre-fill fields from URL query parameters (e.g. ?model=PSL-121000&qty=20&chemistry=SLA&voltage=12V)
  const urlParams = new URLSearchParams(window.location.search);
  const modelParam = urlParams.get('model');
  const qtyParam = urlParams.get('qty');
  const chemistryParam = urlParams.get('chemistry');
  const voltageParam = urlParams.get('voltage');

  const modelInput = document.getElementById('contact-product-model');
  const qtyInput = document.getElementById('contact-qty');
  const appInput = document.getElementById('contact-application');
  const msgInput = document.getElementById('contact-message');
  const statusBox = document.getElementById('contact-form-status');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (modelParam && modelInput) {
    modelInput.value = modelParam;
  }
  if (qtyParam && qtyInput) {
    qtyInput.value = qtyParam;
  }
  if (chemistryParam || voltageParam) {
    const specs = [chemistryParam, voltageParam].filter(Boolean).join(', ');
    if (modelInput && !modelInput.value) {
      modelInput.value = specs;
    }
    if (msgInput && !msgInput.value) {
      msgInput.value = `Requesting official pricing and specification data for ${specs}.`;
    }
  }

  // 2. Handle Contact & Quote AJAX Submission via Formspree
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Submit Bulk Quote Request';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>⏳ Submitting B2B Request...</span>`;
    }
    if (statusBox) {
      statusBox.style.display = 'none';
      statusBox.className = 'form-status-box';
    }

    const quoteId = `RFQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const formData = new FormData(contactForm);
    formData.set('quote_id', quoteId);
    
    if (rfqBasket && rfqBasket.length > 0) {
      const itemsFormatted = rfqBasket.map(item => `${item.model} (${item.qty} units)`).join(', ');
      formData.set('basket_items', itemsFormatted);
    }

    // Submit to Formspree Endpoint
    fetch(contactForm.action || 'https://formspree.io/f/mwlkyyrr', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(async (res) => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }

        if (res.ok) {
          contactForm.reset();
          if (statusBox) {
            statusBox.className = 'form-status-box status-success';
            statusBox.innerHTML = `
              <div class="status-icon">✅</div>
              <div class="status-content">
                <h4 style="color:#065F46; font-size:1.05rem; margin-bottom:0.25rem;">Bulk Quote Request Received!</h4>
                <p style="color:#047857; font-size:0.9rem; margin-bottom:0.4rem;">
                  Your Tracking ID: <strong style="color:#064E3B; font-family:monospace; font-size:0.95rem;">${quoteId}</strong>
                </p>
                <p style="color:#065F46; font-size:0.85rem;">
                  Our application engineer will review your technical specifications and reach out with formal distributor pricing and datasheets within 2 business hours.
                </p>
              </div>
            `;
            statusBox.style.display = 'flex';
          }
          showToast(`RFQ ${quoteId} submitted successfully!`, 'success');
          statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Background sync to local Flask backend if available
          try {
            fetch('/api/rfq', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quote_id: quoteId,
                full_name: formData.get('full_name') || '',
                company_name: formData.get('company_name') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                product_model: formData.get('product_model') || '',
                estimated_qty: formData.get('estimated_qty') || '10',
                application_details: formData.get('application_details') || '',
                message: formData.get('message') || '',
                items: rfqBasket
              })
            }).catch(() => {});
          } catch (_) {}
        } else {
          const data = await res.json().catch(() => ({}));
          let errorMsg = 'Please verify required fields and try again.';
          if (data && data.errors && data.errors.length > 0) {
            errorMsg = data.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join(', ');
          } else if (data && data.error) {
            errorMsg = data.error;
          }

          if (statusBox) {
            statusBox.className = 'form-status-box status-error';
            statusBox.innerHTML = `
              <div class="status-icon">⚠️</div>
              <div class="status-content">
                <h4 style="color:#991B1B; font-size:0.95rem; margin-bottom:0.25rem;">Submission Notice</h4>
                <p style="color:#B91C1C; font-size:0.85rem;">${errorMsg}</p>
              </div>
            `;
            statusBox.style.display = 'flex';
          }
          showToast(`Error: ${errorMsg}`, 'error');
        }
      })
      .catch(err => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
        if (statusBox) {
          statusBox.className = 'form-status-box status-error';
          statusBox.innerHTML = `
            <div class="status-icon">⚠️</div>
            <div class="status-content">
              <h4 style="color:#991B1B; font-size:0.95rem;">Network Error</h4>
              <p style="color:#B91C1C; font-size:0.85rem;">Unable to submit form. Please check your internet connection or call our support hotline directly.</p>
            </div>
          `;
          statusBox.style.display = 'flex';
        }
        showToast('Network error while submitting quote request.', 'error');
      });
  });
}

/* ==========================================================================
   5. RFQ Basket LocalStorage State
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
   6. Global Central B2B RFQ Modal Controller
   ========================================================================== */
function initRFQModal() {
  const modalOverlay = document.getElementById('rfq-modal-overlay');
  const closeBtn = document.getElementById('rfq-modal-close');
  const form = document.getElementById('b2b-center-rfq-form');
  const modelInput = document.getElementById('modal-rfq-model');
  const nameInput = document.getElementById('modal-rfq-name');
  const statusBox = document.getElementById('rfq-modal-status');
  const submitBtn = document.getElementById('modal-rfq-submit');
  const productBanner = document.getElementById('rfq-modal-product-banner');
  const selectedModelText = document.getElementById('rfq-selected-model-text');

  if (!modalOverlay) return;

  let isOpen = false;

  function openModal(prefillModel = '') {
    isOpen = true;
    modalOverlay.style.display = 'flex';
    modalOverlay.offsetHeight; // trigger reflow
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (statusBox) {
      statusBox.style.display = 'none';
      statusBox.className = 'rfq-modal-status-box';
    }

    if (prefillModel) {
      if (modelInput) modelInput.value = prefillModel;
      if (selectedModelText) selectedModelText.textContent = prefillModel;
      if (productBanner) productBanner.style.display = 'flex';
    } else {
      if (productBanner) productBanner.style.display = 'none';
    }

    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 150);
  }

  function closeModal() {
    isOpen = false;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!isOpen) {
        modalOverlay.style.display = 'none';
      }
    }, 280);
  }

  // Global helper functions
  window.openRFQModal = openModal;
  window.closeRFQModal = closeModal;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeModal();
    }
  });

  // Global event delegation for all RFQ buttons with .open-rfq-modal-btn
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-rfq-modal-btn');
    if (btn) {
      e.preventDefault();
      const model = btn.getAttribute('data-product-model') || '';
      openModal(model);
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const origBtnHTML = submitBtn ? submitBtn.innerHTML : '<span>⚡ Submit Official RFQ Request</span>';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳ Submitting Official RFQ...</span>`;
      }
      if (statusBox) {
        statusBox.style.display = 'none';
        statusBox.className = 'rfq-modal-status-box';
      }

      const quoteId = `RFQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const formData = new FormData(form);
      formData.set('quote_id', quoteId);

      if (rfqBasket && rfqBasket.length > 0) {
        const itemsFormatted = rfqBasket.map(item => `${item.model} (${item.qty} units)`).join(', ');
        formData.set('basket_items', itemsFormatted);
      }

      fetch(form.action || 'https://formspree.io/f/mwlkyyrr', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(async (res) => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnHTML;
          }

          if (res.ok) {
            form.reset();
            if (statusBox) {
              statusBox.className = 'rfq-modal-status-box status-success';
              statusBox.innerHTML = `
                <div class="status-icon">✅</div>
                <div class="status-content">
                  <h4 style="color:#065F46; font-size:1.1rem; margin-bottom:0.25rem;">RFQ Request Submitted Successfully!</h4>
                  <p style="color:#047857; font-size:0.925rem; margin-bottom:0.4rem;">
                    Tracking Reference ID: <strong style="color:#064E3B; font-family:monospace; font-size:1rem;">${quoteId}</strong>
                  </p>
                  <p style="color:#065F46; font-size:0.85rem;">
                    Thank you for contacting MERI Industries. Our application engineering team has received your technical specifications and will provide formal distributor pricing and datasheets within 2 business hours.
                  </p>
                  <button type="button" class="btn btn-navy btn-sm mt-3" onclick="window.closeRFQModal();">
                    Done / Close
                  </button>
                </div>
              `;
              statusBox.style.display = 'flex';
            }
            showToast(`✅ RFQ ${quoteId} submitted successfully!`, 'success');

            // Background sync to local Flask backend if available
            try {
              fetch('/api/rfq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  quote_id: quoteId,
                  full_name: formData.get('full_name') || '',
                  company_name: formData.get('company_name') || '',
                  email: formData.get('email') || '',
                  phone: formData.get('phone') || '',
                  product_model: formData.get('product_model') || '',
                  estimated_qty: formData.get('estimated_qty') || '10',
                  application_details: formData.get('application_details') || '',
                  message: formData.get('message') || '',
                  items: rfqBasket
                })
              }).catch(() => {});
            } catch (_) {}
          } else {
            const data = await res.json().catch(() => ({}));
            let errorMsg = 'Please verify required fields and try again.';
            if (data && data.errors && data.errors.length > 0) {
              errorMsg = data.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join(', ');
            } else if (data && data.error) {
              errorMsg = data.error;
            }

            if (statusBox) {
              statusBox.className = 'rfq-modal-status-box status-error';
              statusBox.innerHTML = `
                <div class="status-icon">⚠️</div>
                <div class="status-content">
                  <h4 style="color:#991B1B; font-size:0.95rem; margin-bottom:0.25rem;">Submission Notice</h4>
                  <p style="color:#B91C1C; font-size:0.85rem;">${errorMsg}</p>
                </div>
              `;
              statusBox.style.display = 'flex';
            }
            showToast(`Error: ${errorMsg}`, 'error');
          }
        })
        .catch(err => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnHTML;
          }
          if (statusBox) {
            statusBox.className = 'rfq-modal-status-box status-error';
            statusBox.innerHTML = `
              <div class="status-icon">⚠️</div>
              <div class="status-content">
                <h4 style="color:#991B1B; font-size:0.95rem;">Network Connection Error</h4>
                <p style="color:#B91C1C; font-size:0.85rem;">Unable to connect. Please check your internet connection or call our hotline directly at +91 7538844410.</p>
              </div>
            `;
            statusBox.style.display = 'flex';
          }
          showToast('Network error while submitting quote request.', 'error');
        });
    });
  }
}

/* ==========================================================================
   7. Persistent Floating RFQ Bottom-Right Widget Controller
   ========================================================================== */
function initFloatingRFQ() {
  const container = document.getElementById('floating-rfq-container');
  const triggerBtn = document.getElementById('floating-rfq-trigger');
  const popup = document.getElementById('floating-rfq-popup');
  const closeBtn = document.getElementById('floating-rfq-close');
  const minimizeBtn = document.getElementById('floating-rfq-minimize');
  const backdrop = document.getElementById('floating-rfq-backdrop');
  const form = document.getElementById('b2b-floating-rfq-form');
  const statusBox = document.getElementById('floating-rfq-status');
  const mobileBarRfqBtn = document.getElementById('mobile-bar-rfq-btn');
  const submitBtn = document.getElementById('floating-rfq-submit');
  const modelInput = document.getElementById('floating-model');

  if (!container || !triggerBtn || !popup) return;

  let isOpen = false;

  function openRFQ(prefillModel = null) {
    isOpen = true;
    popup.classList.add('active');
    triggerBtn.classList.add('active');
    triggerBtn.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.classList.add('active');

    if (prefillModel && modelInput) {
      modelInput.value = prefillModel;
    }

    // Focus first appropriate input
    setTimeout(() => {
      const nameInput = document.getElementById('floating-name');
      if (nameInput && !nameInput.value) {
        nameInput.focus();
      } else if (modelInput && !modelInput.value) {
        modelInput.focus();
      }
    }, 150);
  }

  function closeRFQ() {
    isOpen = false;
    popup.classList.remove('active');
    triggerBtn.classList.remove('active');
    triggerBtn.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.classList.remove('active');
  }

  function toggleRFQ() {
    if (isOpen) {
      closeRFQ();
    } else {
      openRFQ();
    }
  }

  // Toggle on button click
  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleRFQ();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeRFQ();
    });
  }

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeRFQ();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeRFQ);
  }

  if (mobileBarRfqBtn) {
    mobileBarRfqBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openRFQModal === 'function') {
        window.openRFQModal();
      } else {
        openRFQ();
      }
    });
  }

  // Global window helper
  window.openRFQPopup = function (model = null) {
    openRFQ(model);
  };

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeRFQ();
    }
  });

  // Click outside on desktop closes popup
  document.addEventListener('click', (e) => {
    if (isOpen && !container.contains(e.target)) {
      closeRFQ();
    }
  });

  // Handle Form Submission via Formspree Vanilla JS AJAX
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const origBtnHTML = submitBtn ? submitBtn.innerHTML : 'Send Message ✉️';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳ Sending your message...</span>`;
      }
      if (statusBox) {
        statusBox.style.display = 'none';
        statusBox.className = 'rfq-popup-status';
      }

      const quoteId = `RFQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const formData = new FormData(form);
      formData.set('quote_id', quoteId);
      
      if (rfqBasket && rfqBasket.length > 0) {
        const itemsFormatted = rfqBasket.map(item => `${item.model} (${item.qty} units)`).join(', ');
        formData.set('basket_items', itemsFormatted);
      }

      fetch(form.action || 'https://formspree.io/f/mwlkyyrr', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(async (res) => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnHTML;
          }

          if (res.ok) {
            form.reset();
            if (statusBox) {
              statusBox.className = 'rfq-popup-status status-success';
              statusBox.innerHTML = `
                <div class="rfq-status-card">
                  <div class="rfq-status-icon">💬</div>
                  <h4 class="rfq-status-title">Message Sent Successfully!</h4>
                  <p class="rfq-status-ref">Tracking Reference: <strong>${quoteId}</strong></p>
                  <p class="rfq-status-desc">
                    Thank you for contacting MERI Industries. Our application engineers have received your inquiry and will be in touch with you shortly.
                  </p>
                  <button type="button" class="btn btn-outline-navy btn-sm mt-2" onclick="document.getElementById('floating-rfq-status').style.display='none';">
                    Send Another Message
                  </button>
                </div>
              `;
              statusBox.style.display = 'block';
            }
            showToast(`✅ Message sent! Reference: ${quoteId}`, 'success');

            // Background sync to local Flask backend if available
            try {
              fetch('/api/rfq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  quote_id: quoteId,
                  full_name: formData.get('full_name') || '',
                  company_name: formData.get('company_name') || '',
                  email: formData.get('email') || '',
                  phone: formData.get('phone') || '',
                  product_model: formData.get('product_model') || '',
                  estimated_qty: formData.get('estimated_qty') || '10',
                  application_details: formData.get('application_details') || '',
                  message: formData.get('message') || '',
                  items: rfqBasket
                })
              }).catch(() => {});
            } catch (_) {}
          } else {
            const data = await res.json().catch(() => ({}));
            let errorMsg = 'Please verify required fields.';
            if (data && data.errors && data.errors.length > 0) {
              errorMsg = data.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join(', ');
            } else if (data && data.error) {
              errorMsg = data.error;
            }

            if (statusBox) {
              statusBox.className = 'rfq-popup-status status-error';
              statusBox.innerHTML = `
                <div class="rfq-status-card">
                  <div class="rfq-status-icon">⚠️</div>
                  <h4 class="rfq-status-title" style="color:#991B1B;">Submission Error</h4>
                  <p class="rfq-status-desc" style="color:#B91C1C;">${errorMsg}</p>
                </div>
              `;
              statusBox.style.display = 'block';
            }
            showToast(`⚠️ Error: ${errorMsg}`, 'error');
          }
        })
        .catch(err => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnHTML;
          }
          if (statusBox) {
            statusBox.className = 'rfq-popup-status status-error';
            statusBox.innerHTML = `
              <div class="rfq-status-card">
                <div class="rfq-status-icon">⚠️</div>
                <h4 class="rfq-status-title" style="color:#991B1B;">Network Error</h4>
                <p class="rfq-status-desc" style="color:#B91C1C;">Unable to connect. Please check your internet connection or call +91 7538844410 directly.</p>
              </div>
            `;
            statusBox.style.display = 'block';
          }
          showToast('Network error while sending message.', 'error');
        });
    });
  }
}

/* ==========================================================================
   7. PDP Image Gallery & Interactive Slider
   ========================================================================== */
function initPDPGallery() {
  const sliderWrapper = document.getElementById('pdp-slider-wrapper');
  const track = document.getElementById('pdp-slider-track');
  const slides = document.querySelectorAll('.pdp-slide');
  const prevBtn = document.getElementById('pdp-slider-prev');
  const nextBtn = document.getElementById('pdp-slider-next');
  const counterEl = document.getElementById('current-slide-num');
  const totalCounterEl = document.getElementById('total-slide-num');
  const dots = document.querySelectorAll('.slider-dot');
  const thumbs = document.querySelectorAll('#pdp-slider-thumbs .thumb-btn');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  if (totalCounterEl) {
    totalCounterEl.textContent = totalSlides;
  }

  function updateSlider(index) {
    currentIndex = (index + totalSlides) % totalSlides;

    // Smooth slide transition
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update Counter
    if (counterEl) {
      counterEl.textContent = currentIndex + 1;
    }

    // Update Active Slide class
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    // Update Active Dot
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    // Update Active Thumbnail
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentIndex);
    });
  }

  // Next & Prev Arrow Handlers
  if (nextBtn) {
    nextBtn.addEventListener('click', () => updateSlider(currentIndex + 1));
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => updateSlider(currentIndex - 1));
  }

  // Dots click handlers
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideTo = parseInt(dot.getAttribute('data-slide-to'), 10);
      if (!isNaN(slideTo)) updateSlider(slideTo);
    });
  });

  // Thumbnails click handlers
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const slideTo = parseInt(thumb.getAttribute('data-slide-to'), 10);
      if (!isNaN(slideTo)) updateSlider(slideTo);
    });
  });

  // Touch Swipe Handlers for Mobile
  if (sliderWrapper) {
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    sliderWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    sliderWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Horizontal swipe must be greater than vertical movement
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX < 0) {
          // Swipe Left -> Next Slide
          updateSlider(currentIndex + 1);
        } else {
          // Swipe Right -> Prev Slide
          updateSlider(currentIndex - 1);
        }
      }
    }

    // Keyboard Arrow Keys
    sliderWrapper.setAttribute('tabindex', '0');
    sliderWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        updateSlider(currentIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        updateSlider(currentIndex - 1);
      }
    });
  }
}

/* ==========================================================================
   8. Toast Notifications
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

/* ==========================================================================
   9. Back to Top Smooth Scroll Handler
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (!backToTopBtn) return;

  let ticking = false;

  function toggleBackToTop() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(toggleBackToTop);
      ticking = true;
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Initial visibility check
  toggleBackToTop();
}

/* ==========================================================================
   10. Text Scramble Animation Engine (Inspired by Cult UI / Motion-Primitives)
   ========================================================================== */
class TextScramble {
  constructor(el, options = {}) {
    this.el = el;
    this.chars = options.chars || '!<>-_\\/[]{}—=+*^?#________0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.speed = options.speed || 30; // ms per frame
    this.chance = options.chance || 0.28;
    this.isScrambling = false;
    this.frameRequest = null;
    this.timer = null;
    this.queue = [];
    this.frame = 0;
    this.resolve = null;
    this.update = this.update.bind(this);
  }

  setText(newText, duration = 850) {
    if (this.isScrambling) {
      if (this.timer) clearTimeout(this.timer);
      if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
    }
    this.isScrambling = true;
    const oldText = this.el.getAttribute('data-current-text') || this.el.innerText || '';
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));

    this.queue = [];
    const totalFrames = Math.max(20, Math.floor(duration / this.speed));

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * (totalFrames * 0.35));
      const end = start + Math.floor(Math.random() * (totalFrames * 0.55)) + Math.floor(totalFrames * 0.15);
      this.queue.push({ from, to, start, end, char: '' });
    }

    this.targetText = newText;
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < this.chance) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char">${this.escapeHtml(char)}</span>`;
      } else {
        output += from ? this.escapeHtml(from) : '';
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.isScrambling = false;
      this.el.setAttribute('data-current-text', this.targetText);
      if (this.resolve) this.resolve();
    } else {
      this.frame++;
      this.timer = setTimeout(() => {
        this.frameRequest = requestAnimationFrame(this.update);
      }, this.speed);
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Make globally available
window.TextScramble = TextScramble;

function initTextScramble() {
  const scrambleElements = document.querySelectorAll('.text-scramble, [data-scramble]');
  if (!scrambleElements.length) return;

  scrambleElements.forEach((el, index) => {
    const targetText = el.getAttribute('data-scramble') || el.innerText.trim();
    const duration = parseInt(el.getAttribute('data-scramble-duration'), 10) || 850;
    const hoverEnabled = el.getAttribute('data-scramble-hover') !== 'false';
    const scrambler = new TextScramble(el);
    el._scrambler = scrambler;

    // Trigger on opening the landing page for orange heading
    const delay = parseInt(el.getAttribute('data-scramble-delay'), 10) || 300;
    setTimeout(() => {
      scrambler.setText(targetText, duration);
      el._scramblerScrambled = true;
    }, delay);

    // Re-scramble on hover or click of the orange heading text
    if (hoverEnabled) {
      el.addEventListener('mouseenter', () => {
        if (!scrambler.isScrambling) {
          scrambler.setText(targetText, duration);
        }
      });
      el.addEventListener('click', () => {
        scrambler.setText(targetText, duration);
      });
    }
  });
}

/* ==========================================================================
   11. TextEffect Animation Engine (Preset: 'fade-in-blur', speedReveal: 1.1, speedSegment: 0.3)
   Inspired by motion-primitives / Cult UI TextEffect
   ========================================================================== */
class TextEffect {
  constructor(el, options = {}) {
    this.el = el;
    this.preset = options.preset || el.getAttribute('data-preset') || 'fade-in-blur';
    this.speedReveal = parseFloat(options.speedReveal || el.getAttribute('data-speed-reveal') || '1.1');
    this.speedSegment = parseFloat(options.speedSegment || el.getAttribute('data-speed-segment') || '0.3');
    this.delay = parseFloat(options.delay || el.getAttribute('data-delay') || '0');
    this.isAnimated = false;
    this.init();
  }

  init() {
    if (this.el._textEffectInitialized) return;
    this.el._textEffectInitialized = true;

    const rawText = this.el.textContent.trim();
    if (!rawText) return;

    // Split into words while maintaining structure
    const words = rawText.split(/\s+/);
    this.el.innerHTML = words
      .map((word, i) => {
        return `<span class="text-effect-word" style="--segment-dur: ${this.speedSegment}s;" data-word-index="${i}">${this.escapeHtml(word)}</span>`;
      })
      .join(' ');

    this.el.classList.add('text-effect-ready');
  }

  animate() {
    if (this.isAnimated) return;
    this.isAnimated = true;

    const wordEls = this.el.querySelectorAll('.text-effect-word');
    const baseStagger = 0.032 / (this.speedReveal || 1.1);

    wordEls.forEach((wordEl, i) => {
      const staggerDelay = (this.delay / 1000) + (i * baseStagger);
      wordEl.style.transitionDelay = `${staggerDelay.toFixed(3)}s`;
      wordEl.classList.add('is-visible');
    });
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.TextEffect = TextEffect;

function initTextEffect() {
  // Target all description elements across all pages
  const targets = document.querySelectorAll('.text-effect, .hero-subtitle, .section-desc, .lead-subtitle, .contact-form-intro, .product-title');
  if (!targets.length) return;

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const effectInstance = entry.target._textEffect;
        if (effectInstance && !effectInstance.isAnimated) {
          effectInstance.animate();
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }) : null;

  targets.forEach((el, index) => {
    if (el._textEffect) return;

    const isHeroDesc = el.classList.contains('hero-subtitle') || el.closest('.hero-section');
    const speedReveal = parseFloat(el.getAttribute('data-speed-reveal')) || 1.1;
    const speedSegment = parseFloat(el.getAttribute('data-speed-segment')) || 0.3;

    const effect = new TextEffect(el, {
      preset: 'fade-in-blur',
      speedReveal: speedReveal,
      speedSegment: speedSegment,
      delay: isHeroDesc ? 180 : 0
    });
    el._textEffect = effect;

    if (isHeroDesc || !observer) {
      setTimeout(() => {
        effect.animate();
      }, isHeroDesc ? 220 : index * 60);
    } else {
      observer.observe(el);
    }
  });
}

