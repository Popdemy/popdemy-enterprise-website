/* ==========================================================================
   POPDEMY ENTERPRISE — POPDEMY COFFEE
   Frontend Storefront, Cart, Currency, Delivery & Form Demonstration Logic
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. CENTRAL PRODUCT, CURRENCY & SHIPPING CONFIGURATION
     Update sample prices, package weights, demo currency rate, or shipping
     rates here in one place.
     ------------------------------------------------------------------------ */
  const POPDEMY_CONFIG = {
    storageKeys: {
      cart: "popdemy_coffee_cart_v1",
      currency: "popdemy_coffee_currency_v1"
    },
    // Configurable demonstration conversion setting (NOT a live market feed)
    exchangeRateUGXPerUSD: 3700,

    // Configurable sample shipping rates (demonstration estimates only)
    shippingRatesUGX: {
      uganda: {
        label: "Uganda",
        baseUGX: 8000,
        perKgUGX: 4000
      },
      africa: {
        label: "Other African Countries",
        baseUGX: 45000,
        perKgUGX: 22000
      },
      international: {
        label: "International Destinations",
        baseUGX: 95000,
        perKgUGX: 45000
      }
    }
  };

  // Five Popdemy Coffee product categories (SAMPLE PRICES for demonstration)
  const PRODUCT_CATALOG = [
    {
      id: "whole-roasted-beans",
      name: "Whole Roasted Coffee Beans",
      brand: "POPDEMY COFFEE",
      packagingSubtitle: "Whole Beans",
      description:
        "Freshly roasted whole coffee beans prepared for home grinders and espresso or filter enthusiasts.",
      packageSizePlaceholder: "250g / 500g Pouch (Placeholder)",
      weightKg: 0.25,
      samplePriceUGX: 28000,
      image:
        "https://images.unsplash.com/photo-1612346903007-b5ac8bb135bb?auto=format&fit=crop&w=900&q=80",
      alt: "Popdemy Coffee whole roasted coffee beans packaging preview"
    },
    {
      id: "ground-coffee",
      name: "Ground Coffee",
      brand: "POPDEMY COFFEE",
      packagingSubtitle: "Freshly Ground",
      description:
        "Conveniently ground roasted coffee ready for French press, pour-over, moka pot, or drip brewing.",
      packageSizePlaceholder: "250g / 500g Pouch (Placeholder)",
      weightKg: 0.25,
      samplePriceUGX: 26000,
      image:
        "https://images.unsplash.com/photo-1610889556528-9a770e32642f?auto=format&fit=crop&w=900&q=80",
      alt: "Popdemy Coffee freshly ground coffee preview"
    },
    {
      id: "coffee-gift-packages",
      name: "Coffee Gift Packages",
      brand: "POPDEMY COFFEE",
      packagingSubtitle: "Artisan Gift Set",
      description:
        "Thoughtfully presented Popdemy Coffee gift selections crafted for celebrations, hosts, and corporate gifting.",
      packageSizePlaceholder: "Curated Gift Box — Est. 750g (Placeholder)",
      weightKg: 0.75,
      samplePriceUGX: 75000,
      image:
        "https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=900&q=80",
      alt: "Popdemy Coffee artisan gift package preview"
    },
    {
      id: "ready-to-drink-bottled",
      name: "Ready-to-Drink Bottled Coffee",
      brand: "POPDEMY COFFEE",
      packagingSubtitle: "Ready-to-Drink",
      description:
        "Smooth brewed coffee bottled for convenient enjoyment at home, at work, or on the move.",
      packageSizePlaceholder: "330ml Bottle (Placeholder)",
      weightKg: 0.40,
      samplePriceUGX: 12000,
      image:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
      alt: "Popdemy Coffee ready-to-drink bottled coffee preview"
    },
    {
      id: "instant-coffee",
      name: "Instant Coffee",
      brand: "POPDEMY COFFEE",
      packagingSubtitle: "Instant Roast",
      description:
        "Quick-dissolving artisan instant coffee prepared for fast, dependable cups anywhere.",
      packageSizePlaceholder: "100g / 200g Jar (Placeholder)",
      weightKg: 0.20,
      samplePriceUGX: 22000,
      image:
        "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=900&q=80",
      alt: "Popdemy Coffee instant coffee preparation preview"
    }
  ];

  /* ------------------------------------------------------------------------
     2. STATE & STORAGE HELPERS
     ------------------------------------------------------------------------ */
  let cart = loadCart();
  let currentCurrency = loadCurrency();

  function loadCart() {
    try {
      const saved = localStorage.getItem(POPDEMY_CONFIG.storageKeys.cart);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(POPDEMY_CONFIG.storageKeys.cart, JSON.stringify(cart));
    } catch (error) {
      // Ignore storage quota errors cleanly
    }
  }

  function loadCurrency() {
    try {
      const saved = localStorage.getItem(POPDEMY_CONFIG.storageKeys.currency);
      return saved === "USD" ? "USD" : "UGX";
    } catch (error) {
      return "UGX";
    }
  }

  function saveCurrency(currency) {
    try {
      localStorage.setItem(POPDEMY_CONFIG.storageKeys.currency, currency);
    } catch (error) {
      // Ignore storage errors cleanly
    }
  }

  /* ------------------------------------------------------------------------
     3. CURRENCY & FORMATTING HELPERS
     ------------------------------------------------------------------------ */
  function formatMoney(amountUGX, currency = currentCurrency) {
    if (currency === "USD") {
      const usdValue = amountUGX / POPDEMY_CONFIG.exchangeRateUGXPerUSD;
      return `$${usdValue.toFixed(2)} USD`;
    }
    return `UGX ${Math.round(amountUGX).toLocaleString("en-UG")}`;
  }

  function getProductById(productId) {
    return PRODUCT_CATALOG.find((item) => item.id === productId) || null;
  }

  function calculateCartMetrics() {
    let totalItems = 0;
    let totalWeightKg = 0;
    let subtotalUGX = 0;

    cart.forEach((cartItem) => {
      const product = getProductById(cartItem.id);
      if (!product) return;
      totalItems += cartItem.quantity;
      totalWeightKg += product.weightKg * cartItem.quantity;
      subtotalUGX += product.samplePriceUGX * cartItem.quantity;
    });

    return { totalItems, totalWeightKg, subtotalUGX };
  }

  function calculateShippingUGX(destinationKey, totalWeightKg) {
    if (totalWeightKg <= 0) return 0;
    const rule =
      POPDEMY_CONFIG.shippingRatesUGX[destinationKey] ||
      POPDEMY_CONFIG.shippingRatesUGX.uganda;
    return rule.baseUGX + Math.ceil(totalWeightKg * 2) * (rule.perKgUGX / 2);
  }

  /* ------------------------------------------------------------------------
     4. RENDER PRODUCT CATALOGUE (HOME PAGE)
     ------------------------------------------------------------------------ */
  function renderProducts() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = PRODUCT_CATALOG.map(
      (product) => `
      <article class="product-card">
        <div class="product-media">
          <img src="${product.image}" alt="${product.alt}" loading="lazy" />
          <div class="packaging-label-overlay" aria-hidden="true">
            <span class="packaging-brand">${product.brand}</span>
            <span class="packaging-sub">${product.packagingSubtitle}</span>
          </div>
        </div>

        <div class="product-body">
          <span class="product-brand-kicker">${product.brand}</span>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description}</p>

          <div class="product-meta">
            <span class="product-size"><strong>Size:</strong> ${product.packageSizePlaceholder}</span>
            <span class="product-size"><strong>Est. Weight:</strong> ${product.weightKg.toFixed(2)} kg</span>
            <div class="product-price-wrap">
              <span class="product-price">${formatMoney(product.samplePriceUGX)}</span>
              <span class="sample-pill">Sample Price</span>
            </div>
          </div>

          <button
            type="button"
            class="btn btn-primary btn-full add-to-cart-btn"
            data-product-id="${product.id}"
          >
            Add to Cart
          </button>
        </div>
      </article>
    `
    ).join("");
  }

  /* ------------------------------------------------------------------------
     5. CART ACTIONS & RENDERING (ALL PAGES)
     ------------------------------------------------------------------------ */
  function addToCart(productId, triggerBtn) {
    const product = getProductById(productId);
    if (!product) return;

    const existing = cart.find((item) => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }

    saveCart();
    updateAllCartUI();

    if (triggerBtn) {
      const originalText = triggerBtn.textContent;
      triggerBtn.textContent = "Added to Cart";
      triggerBtn.classList.add("added");
      setTimeout(() => {
        triggerBtn.textContent = originalText;
        triggerBtn.classList.remove("added");
      }, 950);
    }
  }

  function updateQuantity(productId, delta) {
    const item = cart.find((entry) => entry.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((entry) => entry.id !== productId);
    }

    saveCart();
    updateAllCartUI();
  }

  function removeFromCart(productId) {
    cart = cart.filter((entry) => entry.id !== productId);
    saveCart();
    updateAllCartUI();
  }

  function updateAllCartUI() {
    const { totalItems, totalWeightKg, subtotalUGX } = calculateCartMetrics();

    // Navbar counter badge
    const countBadge = document.getElementById("cart-count");
    if (countBadge) {
      countBadge.textContent = String(totalItems);
    }

    // Cart Drawer
    const drawerList = document.getElementById("cart-drawer-items");
    const drawerEmpty = document.getElementById("cart-drawer-empty");
    const drawerWeight = document.getElementById("cart-drawer-weight");
    const drawerSubtotal = document.getElementById("cart-drawer-subtotal");

    if (drawerList && drawerEmpty) {
      if (cart.length === 0) {
        drawerEmpty.hidden = false;
        drawerList.innerHTML = "";
      } else {
        drawerEmpty.hidden = true;
        drawerList.innerHTML = cart
          .map((cartItem) => {
            const product = getProductById(cartItem.id);
            if (!product) return "";
            const lineTotalUGX = product.samplePriceUGX * cartItem.quantity;

            return `
            <li class="cart-item-row">
              <div class="cart-item-top">
                <div>
                  <strong>${product.brand} — ${product.name}</strong>
                  <div class="cart-item-sub">
                    ${formatMoney(product.samplePriceUGX)} each &middot; ${(product.weightKg * cartItem.quantity).toFixed(2)} kg
                  </div>
                </div>
                <strong>${formatMoney(lineTotalUGX)}</strong>
              </div>
              <div class="cart-item-controls">
                <div class="qty-control">
                  <button
                    type="button"
                    class="qty-btn"
                    data-action="decrease"
                    data-id="${product.id}"
                    aria-label="Decrease quantity of ${product.name}"
                  >&minus;</button>
                  <span>${cartItem.quantity}</span>
                  <button
                    type="button"
                    class="qty-btn"
                    data-action="increase"
                    data-id="${product.id}"
                    aria-label="Increase quantity of ${product.name}"
                  >+</button>
                </div>
                <button
                  type="button"
                  class="remove-btn"
                  data-action="remove"
                  data-id="${product.id}"
                >Remove</button>
              </div>
            </li>
          `;
          })
          .join("");
      }
    }

    if (drawerWeight) drawerWeight.textContent = `${totalWeightKg.toFixed(2)} kg`;
    if (drawerSubtotal) drawerSubtotal.textContent = formatMoney(subtotalUGX);

    // Checkout Section Summary (Home Page)
    renderCheckoutSummary(totalWeightKg, subtotalUGX);
  }

  function renderCheckoutSummary(totalWeightKg, subtotalUGX) {
    const checkoutList = document.getElementById("checkout-items");
    const checkoutEmpty = document.getElementById("checkout-empty-note");
    const checkoutWeight = document.getElementById("checkout-weight");
    const checkoutSubtotal = document.getElementById("checkout-subtotal");
    const checkoutShipping = document.getElementById("checkout-shipping");
    const checkoutTotal = document.getElementById("checkout-total");
    const destinationSelect = document.getElementById("checkout-country");

    if (!checkoutList) return;

    if (cart.length === 0) {
      if (checkoutEmpty) checkoutEmpty.hidden = false;
      checkoutList.innerHTML = "";
    } else {
      if (checkoutEmpty) checkoutEmpty.hidden = true;
      checkoutList.innerHTML = cart
        .map((cartItem) => {
          const product = getProductById(cartItem.id);
          if (!product) return "";
          const lineTotalUGX = product.samplePriceUGX * cartItem.quantity;

          return `
          <li class="checkout-item">
            <div>
              <strong>${product.brand} — ${product.name}</strong>
              <div class="muted">
                Qty: ${cartItem.quantity} &middot; Est. ${(product.weightKg * cartItem.quantity).toFixed(2)} kg
              </div>
            </div>
            <strong>${formatMoney(lineTotalUGX)}</strong>
          </li>
        `;
        })
        .join("");
    }

    const destinationKey = destinationSelect ? destinationSelect.value : "uganda";
    const shippingUGX = calculateShippingUGX(destinationKey, totalWeightKg);
    const grandTotalUGX = subtotalUGX + shippingUGX;

    if (checkoutWeight) checkoutWeight.textContent = `${totalWeightKg.toFixed(2)} kg`;
    if (checkoutSubtotal) checkoutSubtotal.textContent = formatMoney(subtotalUGX);
    if (checkoutShipping) checkoutShipping.textContent = formatMoney(shippingUGX);
    if (checkoutTotal) checkoutTotal.textContent = formatMoney(grandTotalUGX);
  }

  /* ------------------------------------------------------------------------
     6. DRAWER, MOBILE MENU & CURRENCY CONTROLS
     ------------------------------------------------------------------------ */
  function setupCartDrawer() {
    const toggleBtn = document.getElementById("cart-toggle-btn");
    const closeBtn = document.getElementById("cart-close-btn");
    const backdrop = document.getElementById("cart-backdrop");
    const drawer = document.getElementById("cart-drawer");
    const drawerCheckoutBtn = document.getElementById("drawer-checkout-btn");

    if (!toggleBtn || !drawer || !backdrop) return;

    function openDrawer() {
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      toggleBtn.setAttribute("aria-expanded", "true");
      backdrop.hidden = false;
    }

    function closeDrawer() {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      toggleBtn.setAttribute("aria-expanded", "false");
      backdrop.hidden = true;
    }

    toggleBtn.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);

    if (drawerCheckoutBtn) {
      drawerCheckoutBtn.addEventListener("click", () => {
        if (document.body.dataset.page === "home") {
          closeDrawer();
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer.classList.contains("open")) {
        closeDrawer();
      }
    });

    // Delegate quantity & remove clicks inside cart drawer
    const drawerItems = document.getElementById("cart-drawer-items");
    if (drawerItems) {
      drawerItems.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const productId = button.dataset.id;

        if (action === "increase") updateQuantity(productId, 1);
        if (action === "decrease") updateQuantity(productId, -1);
        if (action === "remove") removeFromCart(productId);
      });
    }
  }

  function setupMobileMenu() {
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const nav = document.getElementById("primary-nav");
    if (!toggleBtn || !nav) return;

    toggleBtn.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupCurrencyToggle() {
    const buttons = document.querySelectorAll(".currency-btn");
    if (!buttons.length) return;

    function syncCurrencyButtons() {
      buttons.forEach((btn) => {
        const isActive = btn.dataset.currency === currentCurrency;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    }

    syncCurrencyButtons();

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const selected = btn.dataset.currency;
        if (selected !== "UGX" && selected !== "USD") return;
        currentCurrency = selected;
        saveCurrency(currentCurrency);
        syncCurrencyButtons();
        renderProducts();
        updateAllCartUI();
      });
    });
  }

  function setupProductGridEvents() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.addEventListener("click", (event) => {
      const btn = event.target.closest(".add-to-cart-btn");
      if (!btn) return;
      addToCart(btn.dataset.productId, btn);
    });
  }

  /* ------------------------------------------------------------------------
     7. FORM VALIDATION & HONEST DEMONSTRATION HANDLERS
     ------------------------------------------------------------------------ */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFeedback(container, type, htmlMessage) {
    if (!container) return;
    container.className = `form-feedback ${type}`;
    container.innerHTML = htmlMessage;
  }

  function setupCheckoutForm() {
    const form = document.getElementById("checkout-form");
    const destinationSelect = document.getElementById("checkout-country");
    const feedback = document.getElementById("checkout-feedback");

    if (destinationSelect) {
      destinationSelect.addEventListener("change", () => {
        const { totalWeightKg, subtotalUGX } = calculateCartMetrics();
        renderCheckoutSummary(totalWeightKg, subtotalUGX);
      });
    }

    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const { totalItems, totalWeightKg, subtotalUGX } = calculateCartMetrics();
      if (totalItems === 0) {
        showFeedback(
          feedback,
          "error",
          "<strong>Your cart is empty.</strong> Please add at least one Popdemy Coffee product before previewing checkout."
        );
        return;
      }

      const name = document.getElementById("checkout-name").value.trim();
      const email = document.getElementById("checkout-email").value.trim();
      const destinationKey = document.getElementById("checkout-country").value;
      const city = document.getElementById("checkout-city").value.trim();
      const address = document.getElementById("checkout-address").value.trim();
      const paymentRadio = form.querySelector('input[name="paymentMethod"]:checked');
      const paymentMethod = paymentRadio ? paymentRadio.value : "Not selected";

      if (!name || !email || !city || !address) {
        showFeedback(
          feedback,
          "error",
          "Please fill in all required delivery fields (name, email, city/country, and address)."
        );
        return;
      }

      if (!isValidEmail(email)) {
        showFeedback(
          feedback,
          "error",
          "Please enter a valid email address."
        );
        return;
      }

      const destinationInfo =
        POPDEMY_CONFIG.shippingRatesUGX[destinationKey] ||
        POPDEMY_CONFIG.shippingRatesUGX.uganda;
      const shippingUGX = calculateShippingUGX(destinationKey, totalWeightKg);
      const grandTotalUGX = subtotalUGX + shippingUGX;

      showFeedback(
        feedback,
        "info",
        `<strong>Demonstration Order Preview Generated (No Real Payment Processed)</strong><br />
        Customer: <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)})<br />
        Destination: <strong>${escapeHtml(destinationInfo.label)}</strong> — ${escapeHtml(city)}, ${escapeHtml(address)}<br />
        Package Weight: <strong>${totalWeightKg.toFixed(2)} kg</strong> &middot;
        Sample Total: <strong>${formatMoney(grandTotalUGX)}</strong><br />
        Selected Intended Payment Method: <strong>${escapeHtml(paymentMethod)}</strong><br /><br />
        <em>Note: Real payment processing (MTN Mobile Money, Airtel Money, Card &amp; International providers)
        will be activated only after integration with a suitable payment gateway. No payment was charged.</em>`
      );
    });
  }

  function setupNewsletterForm() {
    const form = document.getElementById("newsletter-form");
    const emailInput = document.getElementById("newsletter-email");
    const feedback = document.getElementById("newsletter-feedback");
    if (!form || !emailInput) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = emailInput.value.trim();

      if (!email || !isValidEmail(email)) {
        showFeedback(
          feedback,
          "error",
          "Please enter a valid email address to test the newsletter preview."
        );
        return;
      }

      showFeedback(
        feedback,
        "info",
        `<strong>Demonstration Mode:</strong> Thank you for testing the newsletter preview with
        <strong>${escapeHtml(email)}</strong>. No mailing-list service is connected yet, so your
        email was not transmitted or stored.`
      );
      form.reset();
    });
  }

  function setupContactForm() {
    const form = document.getElementById("contact-form");
    const feedback = document.getElementById("contact-feedback");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const subject = document.getElementById("contact-subject").value.trim();
      const message = document.getElementById("contact-message").value.trim();

      if (!name || !email || !subject || !message) {
        showFeedback(
          feedback,
          "error",
          "Please complete all required fields: Customer Name, Email Address, Subject, and Message."
        );
        return;
      }

      if (!isValidEmail(email)) {
        showFeedback(
          feedback,
          "error",
          "Please enter a valid email address (for example, name@example.com)."
        );
        return;
      }

      showFeedback(
        feedback,
        "info",
        `<strong>Demonstration Validation Complete — Message Not Transmitted:</strong><br />
        Thank you, <strong>${escapeHtml(name)}</strong>. Your enquiry fields passed validation,
        however no backend or email service is currently connected to this website, so this message
        has <strong>not</strong> been delivered. Official Popdemy Enterprise contact channels will be
        activated soon.`
      );
      form.reset();
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setFooterYears() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll(".current-year").forEach((el) => {
      el.textContent = year;
    });
  }

  /* ------------------------------------------------------------------------
     8. INITIALIZE APPLICATION
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    setFooterYears();
    setupMobileMenu();
    setupCartDrawer();
    setupCurrencyToggle();
    renderProducts();
    setupProductGridEvents();
    updateAllCartUI();
    setupCheckoutForm();
    setupNewsletterForm();
    setupContactForm();
  });
})();
