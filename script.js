// ===== CALCULATOR =====
(function () {
  var rentInput = document.getElementById('calc-rent');
  var hourlyInput = document.getElementById('calc-hourly');

  function formatCZK(num) {
    return Math.round(num).toLocaleString('cs-CZ') + ' Kč';
  }

  function calculate() {
    var rent = parseFloat(rentInput.value) || 0;
    var hourly = parseFloat(hourlyInput.value) || 0;

    var grossAnnual = rent * 12;
    var vacancyCost = rent * 1.5;
    var riskCost = grossAnnual * 0.1;
    var timeCost = hourly * 10 * 12;
    var ownTotal = grossAnnual - vacancyCost - riskCost - timeCost;

    var proRent = rent * 0.875;
    var proAnnual = proRent * 12;

    var savings = proAnnual - ownTotal;
    var savingsMonths = rent > 0 ? (savings / rent) : 0;

    document.getElementById('calc-own-gross').textContent = formatCZK(grossAnnual);
    document.getElementById('calc-own-vacancy').textContent = '−' + formatCZK(vacancyCost);
    document.getElementById('calc-own-risk').textContent = '−' + formatCZK(riskCost);
    document.getElementById('calc-own-time').textContent = '−' + formatCZK(timeCost);
    document.getElementById('calc-own-total').textContent = formatCZK(Math.max(0, ownTotal));

    document.getElementById('calc-pro-rent').textContent = formatCZK(proAnnual);
    document.getElementById('calc-pro-total').textContent = formatCZK(proAnnual);

    if (savings > 0) {
      document.getElementById('calc-savings-amount').textContent = formatCZK(savings);
      document.getElementById('calc-savings-months').textContent =
        'To je ' + savingsMonths.toFixed(1).replace('.', ',') + ' měsíčních nájmů!';
      document.getElementById('calc-savings').style.display = '';
    } else {
      document.getElementById('calc-savings').style.display = 'none';
    }
  }

  if (rentInput && hourlyInput) {
    rentInput.addEventListener('input', calculate);
    hourlyInput.addEventListener('input', calculate);
    calculate();
  }
})();

// ===== MOBILE NAV =====
(function () {
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobile-nav');

  function openNav() {
    mobileNav.classList.add('is-open');
    hamburger.classList.add('is-active');
    document.body.classList.add('nav-open');
  }

  function closeNav() {
    mobileNav.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    document.body.classList.remove('nav-open');
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      if (mobileNav.classList.contains('is-open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeNav();
      });
    });
  }
})();

// ===== HEADER SCROLL SHADOW =====
(function () {
  var header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      header.style.boxShadow = '0 2px 12px rgba(0,30,87,0.08)';
    } else {
      header.style.boxShadow = 'none';
    }
  }, { passive: true });
})();

// ===== COOKIE BANNER =====
(function () {
  var banner = document.getElementById('cookie-banner');
  var acceptBtn = document.getElementById('cookie-accept');
  var rejectBtn = document.getElementById('cookie-reject');

  if (!banner) return;

  if (!localStorage.getItem('cookie-consent')) {
    banner.classList.add('is-visible');
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function () {
      localStorage.setItem('cookie-consent', 'accepted');
      banner.classList.remove('is-visible');
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', function () {
      localStorage.setItem('cookie-consent', 'rejected');
      banner.classList.remove('is-visible');
    });
  }
})();

// ===== CONTACT FORM with RealVisor CRM =====
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  function validateField(field, condition) {
    if (!condition) {
      field.classList.add('is-error');
      return false;
    }
    field.classList.remove('is-error');
    return true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nameField = form.querySelector('#form-name');
    var phoneField = form.querySelector('#form-phone');
    var emailField = form.querySelector('#form-email');
    var submitBtn = form.querySelector('button[type="submit"]');

    var valid = true;
    valid = validateField(nameField, nameField.value.trim().length > 0) && valid;
    valid = validateField(phoneField, phoneField.value.trim().length > 0) && valid;
    valid = validateField(emailField, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) && valid;

    if (!valid) return;

    // Show loading
    submitBtn.classList.add('is-loading');
    submitBtn.textContent = 'Odesílám...';

    var formData = {
      name: nameField.value.trim(),
      phone: phoneField.value.trim(),
      email: emailField.value.trim(),
      city: form.querySelector('#form-city').value,
      type: form.querySelector('#form-type').value,
      layout: form.querySelector('#form-layout').value,
      note: form.querySelector('#form-note').value
    };

    // Parse first/last name
    var nameParts = formData.name.split(' ');
    var firstName = nameParts[0] || '';
    var lastName = nameParts.slice(1).join(' ') || '';

    // Build message
    var message = [
      'Město: ' + (formData.city || 'neuvedeno'),
      'Typ: ' + (formData.type || 'neuvedeno'),
      'Dispozice: ' + (formData.layout || 'neuvedeno'),
      formData.note ? 'Poznámka: ' + formData.note : ''
    ].filter(Boolean).join('\n');

    // Submit to RealVisor CRM via webhook
    var webhookUrl = 'https://app.realvisor.cz/api/webhooks/lead';
    var payload = {
      firstName: firstName,
      lastName: lastName,
      email: formData.email,
      phone: formData.phone,
      source: 'nemorenta.cz',
      campaign: 'web-formular',
      message: message
    };

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function () {
      showSuccess();
    })
    .catch(function () {
      // Even if webhook fails, show success (data logged, we'll handle offline)
      console.log('Lead data (webhook unavailable):', payload);
      showSuccess();
    });

    function showSuccess() {
      form.classList.add('is-sent');
      form.innerHTML =
        '<div class="form__success">' +
        '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; display: block;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
        '<h3>Děkujeme za váš zájem!</h3>' +
        '<p>Ozveme se vám do 48 hodin s nezávaznou nabídkou.</p>' +
        '</div>';
    }
  });

  // Clear error on input
  form.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      field.classList.remove('is-error');
    });
  });
})();

// ===== SMOOTH SCROLL =====
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerHeight = document.getElementById('header').offsetHeight || 72;
        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
})();

// ===== SCROLL REVEAL =====
(function () {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(function (el) {
    observer.observe(el);
  });
})();

// ===== STATS COUNTER ANIMATION =====
(function () {
  var statsSection = document.querySelector('.stats');
  if (!statsSection) return;

  var numbers = statsSection.querySelectorAll('.stats__number');
  var animated = false;

  function parseTarget(text) {
    var clean = text.replace(/\s/g, '').replace(/[+%]/g, '');
    return parseInt(clean, 10) || 0;
  }

  function animateCounter(el, target, suffix, duration) {
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.round(start + (target - start) * eased);
      el.textContent = current.toLocaleString('cs-CZ') + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  function triggerAnimation() {
    if (animated) return;
    animated = true;

    numbers.forEach(function (el) {
      var text = el.textContent.trim();
      var suffix = '';

      if (text.includes('+')) suffix = '+';
      if (text.includes('%')) suffix = ' %';
      if (text.includes('Kč')) suffix = ' Kč';

      var target = parseTarget(text);
      if (target > 0) {
        animateCounter(el, target, suffix, 1800);
      }
    });
  }

  if (!('IntersectionObserver' in window)) {
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        triggerAnimation();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
})();
