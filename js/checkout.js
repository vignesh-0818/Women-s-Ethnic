/**
 * VIRAASAT - Checkout Engine
 * Dynamic Cart Retrieval, Real-Time Form Validation, Payment Method Switching & Order Confirmation
 */

document.addEventListener('DOMContentLoaded', () => {
  initCheckoutPage();
});

let currentPaymentMethod = 'cod';

function initCheckoutPage() {
  renderCheckoutOrderSummary();
  setupPaymentMethods();
  setupCheckoutForm();
}

function renderCheckoutOrderSummary() {
  const container = document.querySelector('#checkout-items-list');
  const subtotalEl = document.querySelector('#checkout-subtotal');
  const shippingEl = document.querySelector('#checkout-shipping');
  const totalEl = document.querySelector('#checkout-grand-total');
  const emptyState = document.querySelector('#checkout-empty-state');
  const mainLayout = document.querySelector('#checkout-main-layout');

  const cart = JSON.parse(localStorage.getItem('viraasat_cart') || '[]');

  if (cart.length === 0) {
    if (mainLayout) mainLayout.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (mainLayout) mainLayout.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  let subtotal = 0;
  let itemsHtml = '';

  cart.forEach(cartItem => {
    const product = PRODUCTS_DATA.find(p => p.id === cartItem.id);
    if (!product) return;

    const itemTotal = product.price * cartItem.quantity;
    subtotal += itemTotal;
    const color = cartItem.color || product.color;

    itemsHtml += `
      <div class="order-summary-item">
        <img src="${product.image}" alt="${product.name}" class="order-summary-thumb">
        <div style="flex:1;">
          <h4 style="font-family:var(--font-serif); font-size:1rem; margin-bottom:4px; line-height:1.3;">${product.name}</h4>
          <div style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:6px;">
            Size: <strong>${cartItem.size}</strong> ${color ? `• Shade: ${color}` : ''}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.82rem; color:var(--color-text-secondary);">Qty: <strong>${cartItem.quantity}</strong> × ₹${product.price.toLocaleString('en-IN')}</span>
            <span style="font-weight:700; color:var(--color-primary); font-size:0.95rem;">₹${itemTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    `;
  });

  if (container) container.innerHTML = itemsHtml;

  // Free shipping above 4999
  const shippingFee = subtotal >= 4999 ? 0 : 250;
  const grandTotal = subtotal + shippingFee;

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (shippingEl) shippingEl.textContent = shippingFee === 0 ? 'COMPLIMENTARY' : `₹${shippingFee}`;
  if (totalEl) totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

  // Store totals on window for order placement
  window.currentCheckoutSubtotal = subtotal;
  window.currentCheckoutShipping = shippingFee;
  window.currentCheckoutGrandTotal = grandTotal;
}

function setupPaymentMethods() {
  const options = document.querySelectorAll('.payment-method-option');
  const panels = {
    cod: document.querySelector('#cod-panel'),
    upi: document.querySelector('#upi-panel'),
    paypal: document.querySelector('#paypal-panel'),
    card: document.querySelector('#card-panel')
  };

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');

      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      currentPaymentMethod = opt.getAttribute('data-method');

      // Toggle panels
      Object.keys(panels).forEach(key => {
        if (panels[key]) {
          panels[key].classList.toggle('active', key === currentPaymentMethod);
        }
      });
    });
  });

  // Cardholder Name: strictly accept letters and spaces only
  const cardNameInput = document.querySelector('#card-name');
  if (cardNameInput) {
    cardNameInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    });
  }

  // Card number auto-formatting (#### #### #### ####) - digits only
  const cardInput = document.querySelector('#card-number');
  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 16);
      let formatted = value.match(/.{1,4}/g)?.join(' ') || '';
      e.target.value = formatted;
    });
  }

  // Card expiry formatting (MM/YY)
  const expiryInput = document.querySelector('#card-expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 4) value = value.substring(0, 4);
      if (value.length >= 3) {
        e.target.value = value.substring(0, 2) + '/' + value.substring(2);
      } else {
        e.target.value = value;
      }
    });
  }

  // CVV formatting (3 digits)
  const cvvInput = document.querySelector('#card-cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
    });
  }
}

function setupCheckoutForm() {
  const form = document.querySelector('#checkout-form');
  if (!form) return;

  const nameInput = document.querySelector('#cust-name');
  const phoneInput = document.querySelector('#cust-phone');
  const pincodeInput = document.querySelector('#cust-pincode');

  // Customer Name: strictly letters and spaces only
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    });
  }

  // Phone Number: strictly digits only (max 10)
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
    });
  }

  // PIN Code: strictly digits only (max 6)
  if (pincodeInput) {
    pincodeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
    });
  }

  const validateField = (input, condition, errorMsg) => {
    const errorEl = input.parentElement.querySelector('.form-error-msg');
    if (!condition) {
      input.classList.add('error');
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.classList.add('visible');
      }
      return false;
    } else {
      input.classList.remove('error');
      if (errorEl) errorEl.classList.remove('visible');
      return true;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.querySelector('#cust-name');
    const phoneInput = document.querySelector('#cust-phone');
    const emailInput = document.querySelector('#cust-email');
    const addressInput = document.querySelector('#cust-address');
    const cityInput = document.querySelector('#cust-city');
    const stateInput = document.querySelector('#cust-state');
    const pincodeInput = document.querySelector('#cust-pincode');

    // Delivery field validations
    const isNameOk = validateField(nameInput, nameInput.value.trim().length >= 3, 'Please enter recipient full name');
    const isPhoneOk = validateField(phoneInput, /^[+]?[\d\s-]{10,15}$/.test(phoneInput.value.trim()), 'Please enter a valid 10-digit mobile number');
    const isEmailOk = validateField(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()), 'Please enter a valid email address');
    const isAddressOk = validateField(addressInput, addressInput.value.trim().length >= 10, 'Please enter complete delivery address');
    const isCityOk = validateField(cityInput, cityInput.value.trim().length >= 2, 'Please enter city');
    const isStateOk = validateField(stateInput, stateInput.value !== '', 'Please select delivery state');
    const isPinOk = validateField(pincodeInput, /^\d{6}$/.test(pincodeInput.value.trim()), 'Please enter a valid 6-digit PIN code');

    // Payment validations
    let isPaymentOk = true;
    if (currentPaymentMethod === 'upi') {
      const upiInput = document.querySelector('#upi-id');
      const isUpiValid = /^[\w.-]+@[\w.-]+$/.test(upiInput.value.trim());
      isPaymentOk = validateField(upiInput, isUpiValid, 'Please enter a valid UPI ID (e.g. name@okhdfcbank)');
    } else if (currentPaymentMethod === 'paypal') {
      const paypalInput = document.querySelector('#paypal-email');
      const isPaypalValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalInput.value.trim());
      isPaymentOk = validateField(paypalInput, isPaypalValid, 'Please enter your registered PayPal email address');
    } else if (currentPaymentMethod === 'card') {
      const cardName = document.querySelector('#card-name');
      const cardNum = document.querySelector('#card-number');
      const cardExp = document.querySelector('#card-expiry');
      const cardCvv = document.querySelector('#card-cvv');

      const isCNameOk = validateField(cardName, cardName.value.trim().length >= 3, 'Please enter cardholder name');
      const isCNumOk = validateField(cardNum, cardNum.value.replace(/\s/g, '').length === 16, 'Please enter complete 16-digit card number');
      const isCExpOk = validateField(cardExp, /^\d{2}\/\d{2}$/.test(cardExp.value.trim()), 'Enter format MM/YY');
      const isCCvvOk = validateField(cardCvv, cardCvv.value.trim().length === 3, 'Enter 3-digit CVV');

      isPaymentOk = isCNameOk && isCNumOk && isCExpOk && isCCvvOk;
    }

    if (isNameOk && isPhoneOk && isEmailOk && isAddressOk && isCityOk && isStateOk && isPinOk && isPaymentOk) {
      processOrderPlacement({
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        address: `${addressInput.value.trim()}, ${cityInput.value.trim()}, ${stateInput.value} - ${pincodeInput.value.trim()}`,
        method: currentPaymentMethod.toUpperCase(),
        total: window.currentCheckoutGrandTotal || 0
      });
    } else {
      if (typeof showToast === 'function') {
        showToast('Please correct the highlighted fields before placing your order.');
      }
    }
  });
}

function processOrderPlacement(orderData) {
  const cart = JSON.parse(localStorage.getItem('viraasat_cart') || '[]');
  const orderRef = 'VIR-2026-' + Math.floor(10000 + Math.random() * 90000);
  const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const confirmationView = document.querySelector('#checkout-confirmation-container');
  const mainLayout = document.querySelector('#checkout-main-layout');

  if (!confirmationView) return;

  let itemsSummaryHtml = cart.map(cartItem => {
    const product = PRODUCTS_DATA.find(p => p.id === cartItem.id);
    if (!product) return '';
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px dashed var(--color-border-light);">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${product.image}" style="width:48px; height:64px; object-fit:cover; border-radius:var(--radius-sm);">
          <div>
            <strong style="font-family:var(--font-serif); font-size:0.95rem;">${product.name}</strong>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">Size: ${cartItem.size} | Qty: ${cartItem.quantity}</div>
          </div>
        </div>
        <span style="font-weight:700; color:var(--color-primary);">₹${(product.price * cartItem.quantity).toLocaleString('en-IN')}</span>
      </div>
    `;
  }).join('');

  confirmationView.innerHTML = `
    <div class="order-confirmation-screen">
      <div class="confirmation-badge-icon">⚜</div>
      <span class="section-tag">Order Confirmed</span>
      <h2 style="font-size:2.4rem; margin-bottom:10px;">Thank You, ${orderData.name}</h2>
      <p style="font-size:1.05rem; color:var(--color-text-secondary); max-width:540px; margin:0 auto 24px; line-height:1.7;">
        Your couture order has been placed successfully and registered with our New Delhi master atelier.
      </p>

      <div style="background:var(--bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:24px; margin-bottom:30px; text-align:left;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; font-size:0.9rem;">
          <div><strong>Order Reference:</strong> <span style="color:var(--color-primary); font-weight:700;">${orderRef}</span></div>
          <div><strong>Order Date:</strong> ${now}</div>
          <div><strong>Payment Method:</strong> ${orderData.method}</div>
          <div><strong>Delivery Timeline:</strong> 4 – 7 Business Days</div>
        </div>
        
        <div style="font-size:0.85rem; margin-bottom:16px; border-top:1px solid var(--color-border-light); padding-top:12px;">
          <strong>Dispatch To:</strong><br>
          ${orderData.name} | ${orderData.phone}<br>
          ${orderData.address}
        </div>

        <div style="border-top:1px solid var(--color-border-light); padding-top:12px;">
          <h4 style="font-size:0.95rem; margin-bottom:10px;">Ordered Creations</h4>
          ${itemsSummaryHtml}
          <div style="display:flex; justify-content:space-between; font-size:1.15rem; font-weight:700; margin-top:14px; color:var(--color-primary);">
            <span>Grand Total Paid</span>
            <span>₹${orderData.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap;">
        <a href="products.html" class="btn btn-primary btn-lg">Continue Exploring Collection</a>
        <a href="index.html" class="btn btn-outline btn-lg">Return to Home</a>
      </div>
    </div>
  `;

  if (mainLayout) mainLayout.style.display = 'none';
  confirmationView.style.display = 'block';

  // Clear cart only after successful confirmation
  localStorage.removeItem('viraasat_cart');
  if (typeof Viraasat !== 'undefined') {
    Viraasat.cart = [];
    if (typeof renderDynamicBadges === 'function') renderDynamicBadges();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

