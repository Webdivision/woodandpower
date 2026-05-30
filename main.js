// Wood & Power - Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initScrollAnimations();
  initGalleryFilter();
  initLightbox();
  initLegalModals();
  initQuoteConfigurator();
});

/**
 * 1. Fixed Header Scroll Effect
 */
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Trigger once on load in case page is already scrolled
  handleScroll();
}

/**
 * 2. Mobile Navigation Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('nav-toggle-button');
  const navMenu = document.querySelector('.nav-menu');
  
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    
    // Toggle active state
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking links or clicking outside
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      navMenu.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * 3. Scroll Entrance Animations (Progressive Enhancement)
 */
function initScrollAnimations() {
  // If browser does not natively support CSS view() timelines, use IntersectionObserver fallback
  if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px', // Trigger slightly before element reaches viewport center
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once animated, stop observing for performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(element => {
      element.classList.add('scroll-reveal-fallback');
      observer.observe(element);
    });
  }
}

/**
 * 4. Product Gallery Filter
 */
function initGalleryFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (!filterButtons.length || !galleryItems.length) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const filterValue = button.getAttribute('data-filter');
      
      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        // Hide/Show with small transition
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'flex';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/**
 * 5. Interactive Lightbox Modal
 */
function initLightbox() {
  const lightbox = document.getElementById('product-lightbox');
  const closeBtn = document.getElementById('lightbox-close-button');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (!lightbox || !closeBtn || !galleryItems.length) return;

  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-description');
  const lightboxSpecsList = document.getElementById('lightbox-specs-list');
  const lightboxCtaBtn = document.getElementById('lightbox-cta-btn');

  const openLightbox = (item) => {
    const imgSrc = item.querySelector('.gallery-img-wrapper img').getAttribute('src');
    const title = item.getAttribute('data-title');
    const category = item.getAttribute('data-category');
    const description = item.getAttribute('data-description');
    const specsJSON = item.getAttribute('data-specs');
    
    // Set text and images
    lightboxImg.setAttribute('src', imgSrc);
    lightboxImg.setAttribute('alt', title);
    lightboxCategory.textContent = category.toUpperCase();
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = description;
    
    // Inject Specs
    lightboxSpecsList.innerHTML = '';
    if (specsJSON) {
      try {
        const specs = JSON.parse(specsJSON);
        Object.entries(specs).forEach(([key, value]) => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${key}:</strong> ${value}`;
          lightboxSpecsList.appendChild(li);
        });
      } catch (e) {
        console.error('Error parsing specs metadata', e);
      }
    }
    
    // Customize CTA button text
    lightboxCtaBtn.textContent = `Inquire About this ${title}`;
    lightboxCtaBtn.setAttribute('href', `#configurator`);
    
    // Adjust configurator options based on modal choice
    lightboxCtaBtn.onclick = () => {
      autoFillConfigurator(item);
      closeLightbox();
    };

    // Open lightbox
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Stop scrolling behind modal
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Resume scrolling
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  closeBtn.addEventListener('click', closeLightbox);
  
  // Close when clicking outside content box
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Escape key close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });
}

/**
 * Helper to autofill the configurator dropdowns based on gallery selection
 */
function autoFillConfigurator(galleryItem) {
  const title = galleryItem.getAttribute('data-title').toLowerCase();
  const specsJSON = galleryItem.getAttribute('data-specs');
  
  const furnitureDropdown = document.getElementById('furniture-type');
  const woodDropdown = document.getElementById('wood-type');
  const powerDropdown = document.getElementById('power-option');
  const legDropdown = document.getElementById('leg-style');
  const dimsInput = document.getElementById('dimensions');
  const notesTextArea = document.getElementById('special-notes');

  // Select furniture type
  if (title.includes('dining table') || title.includes('slab table')) {
    furnitureDropdown.value = 'dining-table';
  } else if (title.includes('desk') || title.includes('stand-up')) {
    furnitureDropdown.value = 'standing-desk';
  } else if (title.includes('sofa') || title.includes('c-frame') || title.includes('tray')) {
    furnitureDropdown.value = 'sofa-table';
  } else if (title.includes('stools') || title.includes('stool')) {
    furnitureDropdown.value = 'bar-stools';
  } else if (title.includes('shelves') || title.includes('shelf')) {
    furnitureDropdown.value = 'shelves';
  } else {
    furnitureDropdown.value = 'custom';
  }

  // Parse specs for other selections
  if (specsJSON) {
    try {
      const specs = JSON.parse(specsJSON);
      
      // Select wood type
      if (specs['Wood Type']) {
        const woodStr = specs['Wood Type'].toLowerCase();
        if (woodStr.includes('oak')) woodDropdown.value = 'red-oak';
        else if (woodStr.includes('walnut')) woodDropdown.value = 'walnut';
        else if (woodStr.includes('ash')) woodDropdown.value = 'ash';
        else if (woodStr.includes('pine')) woodDropdown.value = 'pine';
        else if (woodStr.includes('maple')) woodDropdown.value = 'maple';
      }

      // Dimensions
      if (specs['Dimensions']) {
        dimsInput.value = specs['Dimensions'];
      }

      // Power options
      if (specs['Power Options']) {
        const powerStr = specs['Power Options'].toLowerCase();
        if (powerStr.includes('qi') || powerStr.includes('wireless')) {
          powerDropdown.value = 'wireless-qi';
        } else if (powerStr.includes('outlet') || powerStr.includes('strip')) {
          powerDropdown.value = 'flush-outlets';
        } else {
          powerDropdown.value = 'none';
        }
      }

      // Base style
      if (specs['Leg Type']) {
        const legStr = specs['Leg Type'].toLowerCase();
        if (legStr.includes('trapezoid')) legDropdown.value = 'steel-trapezoid';
        else if (legStr.includes('straight') || legStr.includes('rods')) legDropdown.value = 'steel-legs';
        else if (legStr.includes('electric') || legStr.includes('motorized')) legDropdown.value = 'electric-lift';
        else if (legStr.includes('wood')) legDropdown.value = 'wood-base';
        else if (legStr.includes('hidden') || legStr.includes('bracket') || legStr.includes('invisible')) legDropdown.value = 'floating';
      }
    } catch (e) {
      console.error('Autofill specifications processing error', e);
    }
  }

  // Focus and pre-fill note context
  notesTextArea.value = `I am interested in commissioning a custom piece styled like the "${galleryItem.getAttribute('data-title')}".`;
  
  // Smooth scroll to form section
  const configSection = document.getElementById('configurator');
  if (configSection) {
    configSection.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * 6. Custom Quote Configurator Form Handling
 */
function initQuoteConfigurator() {
  const form = document.getElementById('quote-request-form');
  const successAlert = document.getElementById('form-success-alert');
  const errorAlert = document.getElementById('form-error-alert');
  const submitBtn = document.getElementById('submit-commission-btn');

  if (!form || !successAlert || !errorAlert || !submitBtn) return;

  // Real-time button text indicator based on selections
  const updateSubmitButtonText = () => {
    const furnitureSelect = document.getElementById('furniture-type');
    const woodSelect = document.getElementById('wood-type');
    
    const furnitureName = furnitureSelect.options[furnitureSelect.selectedIndex]?.text || '';
    const woodName = woodSelect.options[woodSelect.selectedIndex]?.text || '';
    
    if (furnitureSelect.value && woodSelect.value) {
      const cleanFurniture = furnitureName.replace(/\(.*?\)/g, '').trim();
      const cleanWood = woodName.replace(/\(.*?\)/g, '').trim();
      submitBtn.textContent = `Submit Draft: ${cleanWood} ${cleanFurniture}`;
    } else {
      submitBtn.textContent = 'Submit Commission Draft';
    }
  };

  form.addEventListener('change', updateSubmitButtonText);

  // Form submission intercept
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Hide alerts initially
    successAlert.style.display = 'none';
    errorAlert.style.display = 'none';
    
    // Perform HTML5 Validation
    if (!form.checkValidity()) {
      errorAlert.style.display = 'block';
      errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Highlight invalid inputs using native UI or custom border colors
      form.reportValidity();
      return;
    }

    // Collect data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Form Submission Visual State
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Commission Request...';
    
    // Send form data to submit-quote.php
    fetch('submit-quote.php', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => {
          throw new Error(errData.message || 'Server error. Please try again.');
        });
      }
      return response.json();
    })
    .then(res => {
      if (res.success) {
        // Local storage persistence
        const commissionLogs = JSON.parse(localStorage.getItem('wood_power_commissions') || '[]');
        commissionLogs.push({
          id: 'WP-' + Math.floor(Math.random() * 900000 + 100000),
          date: new Date().toISOString(),
          ...data
        });
        localStorage.setItem('wood_power_commissions', JSON.stringify(commissionLogs));
        
        // Update success message text dynamically for personalization
        const fName = document.getElementById('furniture-type').options[document.getElementById('furniture-type').selectedIndex].text;
        successAlert.innerHTML = `<strong>Order Registered!</strong> Thank you, ${data.name}. We've saved your custom commission draft for the <strong>${fName}</strong>. Our workshop in Virginia will review your timber choices and contact you at <strong>${data.email}</strong> shortly.`;
        
        successAlert.style.display = 'block';
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Reset form state
        form.reset();
        updateSubmitButtonText();
      } else {
        errorAlert.textContent = res.message || 'Please fill in all required fields.';
        errorAlert.style.display = 'block';
        errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    })
    .catch(err => {
      console.error('Error submitting form:', err);
      errorAlert.textContent = err.message || 'Unable to submit request. Please check your internet connection or email info@woodandpower.com directly.';
      errorAlert.style.display = 'block';
      errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    })
    .finally(() => {
      submitBtn.disabled = false;
      if (submitBtn.textContent === 'Submitting Commission Request...') {
        submitBtn.textContent = 'Submit Commission Draft';
      }
    });
  });
}

/**
 * 7. Legal Modals Handler (Privacy Policy & Terms of Commission)
 */
function initLegalModals() {
  const privacyModal = document.getElementById('privacy-modal');
  const termsModal = document.getElementById('terms-modal');
  const openPrivacyBtn = document.getElementById('open-privacy-btn');
  const openTermsBtn = document.getElementById('open-terms-btn');
  const closePrivacyBtn = document.getElementById('privacy-close-button');
  const closeTermsBtn = document.getElementById('terms-close-button');
  
  if (!privacyModal || !termsModal || !openPrivacyBtn || !openTermsBtn) return;

  const openModal = (modal) => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (modal) => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openPrivacyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(privacyModal);
  });

  openTermsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(termsModal);
  });

  if (closePrivacyBtn) {
    closePrivacyBtn.addEventListener('click', () => closeModal(privacyModal));
  }
  
  if (closeTermsBtn) {
    closeTermsBtn.addEventListener('click', () => closeModal(termsModal));
  }

  // Close on background click
  [privacyModal, termsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Escape key close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (privacyModal.classList.contains('open')) closeModal(privacyModal);
      if (termsModal.classList.contains('open')) closeModal(termsModal);
    }
  });
}
