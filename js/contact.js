/**
 * VIRAASAT - Contact & Concierge Engine
 * Form Validation, FAQ Accordion & Atelier Appointment Scheduling Mockup
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initFaqAccordion();
});

function initContactForm() {
  const form = document.querySelector('#boutique-contact-form');
  if (!form) return;

  const nameInput = form.querySelector('#contact-name');
  const emailInput = form.querySelector('#contact-email');
  const phoneInput = form.querySelector('#contact-phone');
  const subjectInput = form.querySelector('#contact-subject');
  const messageInput = form.querySelector('#contact-message');

  // Helper validation functions
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
      if (errorEl) {
        errorEl.classList.remove('visible');
      }
      return true;
    }
  };

  // Real-time blur listeners
  if (nameInput) {
    nameInput.addEventListener('blur', () => {
      validateField(nameInput, nameInput.value.trim().length >= 3, 'Please enter your full name (minimum 3 characters)');
    });
  }

  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validateField(emailInput, emailRegex.test(emailInput.value.trim()), 'Please enter a valid email address');
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('blur', () => {
      const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
      validateField(phoneInput, phoneRegex.test(phoneInput.value.trim()), 'Please enter a valid 10-digit phone number');
    });
  }

  if (subjectInput) {
    subjectInput.addEventListener('change', () => {
      validateField(subjectInput, subjectInput.value !== '', 'Please select an inquiry topic');
    });
  }

  if (messageInput) {
    messageInput.addEventListener('blur', () => {
      validateField(messageInput, messageInput.value.trim().length >= 15, 'Please provide details (minimum 15 characters)');
    });
  }

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 3, 'Please enter your full name (minimum 3 characters)');
    const isEmailValid = validateField(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()), 'Please enter a valid email address');
    const isPhoneValid = validateField(phoneInput, /^[+]?[\d\s-]{10,15}$/.test(phoneInput.value.trim()), 'Please enter a valid 10-digit phone number');
    const isSubjectValid = validateField(subjectInput, subjectInput.value !== '', 'Please select an inquiry topic');
    const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 15, 'Please provide details (minimum 15 characters)');

    if (isNameValid && isEmailValid && isPhoneValid && isSubjectValid && isMessageValid) {
      if (typeof showToast === 'function') {
        showToast(`Thank you, ${nameInput.value.trim()}! Your inquiry has been received. Our concierge will contact you shortly.`);
      }

      form.innerHTML = `
        <div style="text-align:center; padding:50px 20px;">
          <div style="font-size:3rem; color:var(--color-gold); margin-bottom:16px;">✦</div>
          <h3 style="font-family:var(--font-serif); font-size:1.8rem; margin-bottom:12px;">Inquiry Received with Grace</h3>
          <p style="font-size:1rem; color:var(--color-text-secondary); max-width:480px; margin:0 auto 24px; line-height:1.7;">
            We have dispatched your consultation request to our master styling team in New Delhi. A dedicated couture concierge will connect with you via email & WhatsApp within 24 business hours.
          </p>
          <a href="products.html" class="btn btn-primary">Browse Catalogue</a>
        </div>
      `;
    } else {
      if (typeof showToast === 'function') {
        showToast('Please correct highlighted fields before submitting.');
      }
    }
  });
}

function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    if (!header || header.dataset.faqInitialized) return;
    header.dataset.faqInitialized = 'true';

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close other open items
      faqItems.forEach(i => i.classList.remove('active'));
      // Toggle clicked item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

