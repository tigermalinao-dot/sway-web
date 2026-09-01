(function () {
  var CONTACT_EMAIL = 'cntact.sway@gmail.com';

  /* ---- Simple contact form (mailto) ---- */
  function wireMailtoForm(formEl, statusEl, buildSubjectAndBody, onSuccess) {
    if (!formEl) return;
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      var required = formEl.querySelectorAll('[required]');
      for (var i = 0; i < required.length; i++) {
        if (!required[i].value.trim()) {
          required[i].focus();
          if (statusEl) statusEl.textContent = 'Falta rellenar algún campo obligatorio.';
          return;
        }
      }
      var built = buildSubjectAndBody();
      var mailto = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(built.subject) + '&body=' + encodeURIComponent(built.body);
      if (statusEl) statusEl.textContent = 'Abriendo tu app de correo con el mensaje ya redactado...';
      window.location.href = mailto;
      if (onSuccess) onSuccess();
    });
  }

  var mainForm = document.getElementById('contactForm');
  wireMailtoForm(mainForm, document.getElementById('cf-status'), function () {
    var name = document.getElementById('cf-name').value.trim();
    var email = document.getElementById('cf-email').value.trim();
    var phone = document.getElementById('cf-phone').value.trim();
    var company = document.getElementById('cf-company').value.trim();
    var message = document.getElementById('cf-message').value.trim();
    var lines = [
      'Nombre: ' + name,
      'Email: ' + email,
      phone ? 'Teléfono: ' + phone : '',
      company ? 'Empresa: ' + company : '',
      '',
      message
    ].filter(Boolean);
    return { subject: 'Contacto desde la web — ' + name, body: lines.join('\n') };
  });

  /* ---- Budget calculator ---- */
  var calcBox = document.querySelector('.calc-box');
  if (!calcBox) return;

  var TOTAL_STEPS = 5;
  var state = { step: 1, services: [], sector: null, tools: [], web: null, plan: null };

  var PLANS = {
    arranque: { label: 'Plan Arranque' },
    total: { label: 'Automatización Total' },
    unsure: { label: 'Aún sin decidir' }
  };

  var stepNumEl = document.getElementById('calcStepNum');
  var progressBar = document.getElementById('calcProgressBar');
  var prevBtn = document.getElementById('calcPrev');
  var nextBtn = document.getElementById('calcNext');
  var resultBox = document.getElementById('calcResult');
  var confirmBox = document.getElementById('calcConfirm');
  var restartBtn = document.getElementById('calcRestart');

  var stepEls = Array.prototype.slice.call(calcBox.querySelectorAll('.calc-step'));

  function isStepValid(step) {
    if (step === 1) return state.services.length > 0;
    if (step === 2) return !!state.sector;
    if (step === 3) return true;
    if (step === 4) return !!state.web;
    if (step === 5) return !!state.plan;
    return true;
  }

  function renderStep() {
    stepEls.forEach(function (el) {
      el.hidden = parseInt(el.dataset.step, 10) !== state.step;
    });
    stepNumEl.textContent = state.step;
    progressBar.style.width = (state.step / TOTAL_STEPS * 100) + '%';
    prevBtn.disabled = state.step === 1;
    nextBtn.textContent = state.step === TOTAL_STEPS ? 'Continuar' : 'Siguiente';
    nextBtn.disabled = !isStepValid(state.step);
  }

  function selectOption(group, btn) {
    var groupEl = btn.closest('.calc-options');
    var multi = groupEl.dataset.multi === 'true';
    var value = btn.dataset.value;

    if (multi) {
      var idx = state[group].indexOf(value);
      if (idx > -1) {
        state[group].splice(idx, 1);
        btn.classList.remove('is-selected');
      } else {
        state[group].push(value);
        btn.classList.add('is-selected');
      }
    } else {
      state[group] = value;
      groupEl.querySelectorAll('.calc-option').forEach(function (b) { b.classList.remove('is-selected'); });
      btn.classList.add('is-selected');
    }
    nextBtn.disabled = !isStepValid(state.step);
  }

  calcBox.querySelectorAll('.calc-options').forEach(function (groupEl) {
    var group = groupEl.dataset.group;
    groupEl.querySelectorAll('.calc-option').forEach(function (btn) {
      btn.addEventListener('click', function () { selectOption(group, btn); });
    });
  });

  nextBtn.addEventListener('click', function () {
    if (!isStepValid(state.step)) return;
    if (state.step === TOTAL_STEPS) {
      showResult();
      return;
    }
    state.step += 1;
    renderStep();
  });

  prevBtn.addEventListener('click', function () {
    if (state.step === 1) return;
    state.step -= 1;
    renderStep();
  });

  function showResult() {
    calcBox.querySelectorAll('.calc-step').forEach(function (el) { el.hidden = true; });
    document.querySelector('.calc-nav').hidden = true;
    document.querySelector('.calc-progress-wrap').hidden = true;
    resultBox.hidden = false;
  }

  function showConfirm() {
    resultBox.hidden = true;
    confirmBox.hidden = false;
  }

  restartBtn.addEventListener('click', function () {
    state = { step: 1, services: [], sector: null, tools: [], web: null, plan: null };
    calcBox.querySelectorAll('.calc-option').forEach(function (b) { b.classList.remove('is-selected'); });
    resultBox.hidden = true;
    confirmBox.hidden = true;
    document.querySelector('.calc-nav').hidden = false;
    document.querySelector('.calc-progress-wrap').hidden = false;
    renderStep();
  });

  var calcForm = document.getElementById('calcForm');
  wireMailtoForm(calcForm, document.getElementById('cq-status'), function () {
    var name = document.getElementById('cq-name').value.trim();
    var email = document.getElementById('cq-email').value.trim();
    var phone = document.getElementById('cq-phone').value.trim();
    var company = document.getElementById('cq-company').value.trim();
    var notes = document.getElementById('cq-notes').value.trim();
    var labelMap = {
      whatsapp: 'Agentes de IA para WhatsApp', email: 'Automatización de email', leads: 'Captura y gestión de leads',
      integraciones: 'Integraciones', informes: 'Informes automáticos',
      clinicas: 'Clínicas y centros de salud', inmobiliarias: 'Inmobiliarias', restaurantes: 'Restaurantes y hostelería', otro: 'Otro sector',
      sheets: 'Google Sheets / Drive', crm: 'CRM', ecommerce: 'Shopify / WooCommerce', calendly: 'Calendly / Acuity', ninguna: 'Empezamos desde cero',
      no: 'No, ya tiene web', si: 'Sí, quiere web o landing'
    };
    var servicesText = state.services.map(function (v) { return labelMap[v] || v; }).join(', ') || '—';
    var toolsText = state.tools.map(function (v) { return labelMap[v] || v; }).join(', ') || '—';
    var lines = [
      'Nombre: ' + name,
      'Email: ' + email,
      phone ? 'Teléfono: ' + phone : '',
      company ? 'Empresa: ' + company : '',
      '',
      '--- Respuestas del calculador ---',
      'Quiere automatizar: ' + servicesText,
      'Sector: ' + (labelMap[state.sector] || state.sector || '—'),
      'Herramientas actuales: ' + toolsText,
      'Web/landing: ' + (labelMap[state.web] || state.web || '—'),
      'Plan preferido: ' + (PLANS[state.plan] ? PLANS[state.plan].label : '—'),
      notes ? ('\nNotas adicionales: ' + notes) : ''
    ].filter(Boolean);
    return { subject: 'Solicitud de presupuesto — ' + name, body: lines.join('\n') };
  }, showConfirm);

  renderStep();
})();
