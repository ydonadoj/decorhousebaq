/**
 * DECORHOUSE BAQ — ASISTENTE VIRTUAL VALENTINA
 * chatbot.js — Flujo 100% determinístico con árbol de decisión
 * Seguridad: inputs sanitizados con textContent, encodeURIComponent en URLs
 */

'use strict';

window.ChatBot = (() => {

  /* ==========================================================================
     CONFIGURACIÓN
  ========================================================================== */

  const PHONE         = '573016094742';
  const SESSION_KEY   = 'dhbaq_chat_v1';
  const TYPING_DELAY  = 700; /* ms antes de mostrar respuesta del bot */

  /* ==========================================================================
     ESTADO
  ========================================================================== */

  let currentState = 'welcome';
  let inputType    = null; /* 'text' | null */

  const userData = {
    nombre:   '',
    servicio: '',
    ciudad:   '',
    fecha:    '',
    detalle:  ''
  };

  /* ==========================================================================
     DOM HELPERS
  ========================================================================== */

  const $ = (id) => document.getElementById(id);

  function scrollToBottom() {
    const msgs = $('chatbotMessages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  /* ==========================================================================
     SANITIZACIÓN (prevención XSS)
     Usar para datos del usuario que se muestran en burbujas del bot.
  ========================================================================== */

  function sanitize(str) {
    const el = document.createElement('span');
    el.textContent = String(str);
    return el.innerHTML;
  }

  /* ==========================================================================
     RENDERIZADO DE MENSAJES
  ========================================================================== */

  function renderBotMessage(htmlText, options, delayBefore) {
    delayBefore = delayBefore || 0;

    return new Promise((resolve) => {
      setTimeout(() => {
        const msgs = $('chatbotMessages');
        if (!msgs) { resolve(); return; }

        /* Typing indicator */
        const typingId = 'typing_' + Date.now();
        const typingEl = document.createElement('div');
        typingEl.className = 'chat-msg chat-msg--bot';
        typingEl.id = typingId;
        typingEl.innerHTML =
          '<div class="chat-msg__avatar" aria-hidden="true">V</div>' +
          '<div class="chat-msg__content">' +
            '<div class="chat-msg__bubble chat-msg__bubble--bot">' +
              '<div class="typing-indicator" aria-label="Valentina está escribiendo">' +
                '<span></span><span></span><span></span>' +
              '</div>' +
            '</div>' +
          '</div>';
        msgs.appendChild(typingEl);
        scrollToBottom();

        setTimeout(() => {
          const typing = document.getElementById(typingId);
          if (typing) typing.remove();

          /* Mensaje real */
          const msgEl = document.createElement('div');
          msgEl.className = 'chat-msg chat-msg--bot';

          const avatarDiv = document.createElement('div');
          avatarDiv.className = 'chat-msg__avatar';
          avatarDiv.setAttribute('aria-hidden', 'true');
          avatarDiv.textContent = 'V';

          const contentDiv = document.createElement('div');
          contentDiv.className = 'chat-msg__content';

          /* Burbuja — bot messages son strings hardcodeados, no input del usuario */
          const bubbleDiv = document.createElement('div');
          bubbleDiv.className = 'chat-msg__bubble chat-msg__bubble--bot';
          bubbleDiv.innerHTML = htmlText;

          contentDiv.appendChild(bubbleDiv);

          /* Botones de opción */
          if (options && options.length) {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'chat-msg__options';

            options.forEach((opt) => {
              const btn = document.createElement('button');
              btn.className = 'chat-option-btn' + (opt.isWa ? ' chat-option-btn--wa' : '');
              btn.type = 'button';
              /* Usar textContent para el label (puede contener emojis, strings seguros) */
              btn.textContent = opt.label;
              btn.addEventListener('click', () => handleOptionClick(btn, opt, optionsDiv));
              optionsDiv.appendChild(btn);
            });

            contentDiv.appendChild(optionsDiv);
          }

          msgEl.appendChild(avatarDiv);
          msgEl.appendChild(contentDiv);
          msgs.appendChild(msgEl);
          scrollToBottom();
          saveSession();
          resolve();

        }, TYPING_DELAY);
      }, delayBefore);
    });
  }

  function renderUserMessage(text) {
    const msgs = $('chatbotMessages');
    if (!msgs) return;

    const msgEl  = document.createElement('div');
    msgEl.className = 'chat-msg chat-msg--user';

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg__bubble chat-msg__bubble--user';
    bubble.textContent = text; /* textContent: NUNCA innerHTML con datos del usuario */

    msgEl.appendChild(bubble);
    msgs.appendChild(msgEl);
    scrollToBottom();
  }

  /* ==========================================================================
     MANEJO DE OPCIONES
  ========================================================================== */

  function handleOptionClick(btn, opt, optionsDiv) {
    /* Deshabilitar todos los botones del grupo */
    if (optionsDiv) {
      optionsDiv.querySelectorAll('.chat-option-btn').forEach((b) => {
        b.disabled = true;
        b.classList.add('is-disabled');
        if (b !== btn) b.style.display = 'none';
      });
    }
    btn.classList.add('is-selected');

    /* Mostrar selección como mensaje del usuario */
    renderUserMessage(opt.label);

    /* Ejecutar acción */
    if (typeof opt.action === 'function') {
      setTimeout(() => opt.action(), 300);
    }
  }

  /* ==========================================================================
     CAMPO DE TEXTO
  ========================================================================== */

  function showTextInput(placeholder) {
    const inputWrap = $('chatbotInput');
    const field     = $('chatbotTextField');
    if (!inputWrap || !field) return;
    inputWrap.hidden = false;
    field.placeholder = placeholder || 'Escribe aquí...';
    field.value = '';
    inputType = 'text';
    setTimeout(() => field.focus(), 150);
  }

  function hideTextInput() {
    const inputWrap = $('chatbotInput');
    if (inputWrap) inputWrap.hidden = true;
    inputType = null;
  }

  function handleTextSubmit() {
    const field = $('chatbotTextField');
    if (!field) return;

    const raw = field.value.trim();
    if (!raw) return;

    /* Limitar longitud máxima */
    const value = raw.substring(0, 300);

    renderUserMessage(value);
    hideTextInput();
    field.value = '';

    switch (currentState) {

      case 'naming':
        /* Validar: solo letras, espacios y caracteres comunes de nombres */
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]{2,60}$/.test(value)) {
          renderBotMessage(
            'Por favor ingresa un nombre válido (solo letras). 😊', null, 200
          ).then(() => showTextInput('Tu nombre...'));
          return;
        }
        userData.nombre = value;
        goState('service');
        break;

      case 'city_text':
        userData.ciudad = value;
        goState('date');
        break;

      case 'detail':
        userData.detalle = value;
        goState('confirm');
        break;
    }
  }

  /* ==========================================================================
     ÁRBOL DE ESTADOS
  ========================================================================== */

  async function goState(state) {
    currentState = state;

    switch (state) {

      /* ---- BIENVENIDA ---- */
      case 'welcome':
        await renderBotMessage(
          '¡Hola! 👋 Soy <strong>Valentina</strong>, asistente de Decorhouse BAQ.<br>¿En qué puedo ayudarte hoy?',
          [
            { label: '🏠 Quiero cotizar un servicio', action: () => goState('naming') },
            { label: '❓ Tengo una pregunta',          action: () => goState('question') },
            { label: '👋 Solo estoy explorando',       action: () => goState('explore') }
          ]
        );
        break;

      /* ---- FLUJO COTIZACIÓN ---- */

      case 'naming':
        await renderBotMessage(
          '¡Con mucho gusto te ayudo! 😊 Para comenzar,<br>¿cuál es tu <strong>nombre</strong>?'
        );
        showTextInput('Tu nombre...');
        break;

      case 'service':
        await renderBotMessage(
          '¡Mucho gusto, <strong>' + sanitize(userData.nombre) + '</strong>! 🌟<br>¿Cuál de nuestros servicios te interesa?',
          [
            { label: '🪟 Cortinas',        action: () => { userData.servicio = 'Cortinas';        goState('city'); } },
            { label: '🔲 Persianas',       action: () => { userData.servicio = 'Persianas';       goState('city'); } },
            { label: '🗂️ Panel Japonés',  action: () => { userData.servicio = 'Panel Japonés';   goState('city'); } },
            { label: '☀️ Sheer & Blackout', action: () => { userData.servicio = 'Sheer & Blackout'; goState('city'); } },
            { label: '🎨 Telas',           action: () => { userData.servicio = 'Telas';           goState('city'); } },
            { label: '🖌️ Papel Colgante', action: () => { userData.servicio = 'Papel Colgante';  goState('city'); } }
          ]
        );
        break;

      case 'city':
        await renderBotMessage(
          '¡Excelente elección! ✨ Trabajamos en toda la región Caribe.<br>¿En qué <strong>ciudad o municipio</strong> necesitas el servicio?',
          [
            { label: '📍 Barranquilla', action: () => { userData.ciudad = 'Barranquilla'; goState('date'); } },
            { label: '📍 Soledad',      action: () => { userData.ciudad = 'Soledad';      goState('date'); } },
            { label: '📍 Malambo',      action: () => { userData.ciudad = 'Malambo';      goState('date'); } },
            { label: '📍 Otra ciudad',  action: () => askCityFreeText() }
          ]
        );
        break;

      case 'date':
        await renderBotMessage(
          '¿Tienes alguna <strong>fecha aproximada</strong> en mente para el servicio?',
          [
            { label: '📅 Este mes',          action: () => { userData.fecha = 'Este mes';           goState('detail'); } },
            { label: '📅 El próximo mes',    action: () => { userData.fecha = 'El próximo mes';     goState('detail'); } },
            { label: '📅 En 2-3 meses',     action: () => { userData.fecha = 'En 2-3 meses';       goState('detail'); } },
            { label: '📅 No tengo fecha aún', action: () => { userData.fecha = 'Sin fecha definida'; goState('detail'); } }
          ]
        );
        break;

      case 'detail':
        await renderBotMessage(
          'Cuéntame un poco más sobre lo que tienes en mente.<br>' +
          '¿Es para un espacio grande o pequeño? ¿Tienes referencia de estilo o colores?'
        );
        showTextInput('Ej: sala de 30m², estilo moderno, colores neutros...');
        break;

      case 'confirm':
        await renderBotMessage(
          '¡Perfecto, <strong>' + sanitize(userData.nombre) + '</strong>! 🎨 Aquí está tu resumen:<br><br>' +
          '✦ <strong>Servicio:</strong> ' + sanitize(userData.servicio) + '<br>' +
          '✦ <strong>Ciudad:</strong> '   + sanitize(userData.ciudad)   + '<br>' +
          '✦ <strong>Fecha:</strong> '    + sanitize(userData.fecha)    + '<br>' +
          '✦ <strong>Detalle:</strong> '  + sanitize(userData.detalle)  + '<br><br>' +
          'Te voy a conectar con nuestro equipo ahora mismo.<br>¡Ellos te darán una cotización personalizada! 🚀',
          [
            { label: '📱 Ir a WhatsApp ahora', isWa: true, action: () => openWhatsApp() }
          ]
        );
        break;

      /* ---- FLUJO PREGUNTAS ---- */

      case 'question':
        await renderBotMessage(
          '¡Claro! Cuéntame. ¿Tu pregunta es sobre...?',
          [
            { label: '💰 Precios y cotizaciones', action: () => goState('q_prices')   },
            { label: '📍 Cobertura y ciudades',   action: () => goState('q_coverage') },
            { label: '⏱️ Tiempos de entrega',     action: () => goState('q_time')    },
            { label: '📋 Proceso de trabajo',      action: () => goState('q_process') }
          ]
        );
        break;

      case 'q_prices':
        await renderBotMessage(
          'Nuestros precios varían según el tipo de proyecto y la magnitud.<br>' +
          'La mejor forma es hacerte una <strong>cotización personalizada sin costo</strong>.<br>' +
          '¿Te gustaría cotizar ahora?',
          [
            { label: '✅ Sí, quiero cotizar', action: () => goState('naming')  },
            { label: '⬅️ Volver al menú',     action: () => goState('welcome') }
          ]
        );
        break;

      case 'q_coverage':
        await renderBotMessage(
          'Atendemos toda la <strong>región Caribe</strong>: Barranquilla, Soledad, Malambo,<br>' +
          'Sabanagrande, Santa Marta y municipios cercanos.<br>¿Tu proyecto está en esa zona?',
          [
            { label: '✅ Sí, está en la región',   action: () => goState('naming')           },
            { label: '🌎 Mi ciudad no está aquí',  action: () => goState('q_coverage_other') }
          ]
        );
        break;

      case 'q_coverage_other':
        await renderBotMessage(
          '¡No te preocupes! Contáctanos directamente y evaluamos si podemos llegar hasta ti.<br>' +
          'Escríbenos por WhatsApp y te confirmamos. 😊',
          [
            { label: '📱 Ir a WhatsApp', isWa: true, action: () => window.open('https://wa.me/' + PHONE, '_blank', 'noopener,noreferrer') },
            { label: '⬅️ Volver al menú', action: () => goState('welcome') }
          ]
        );
        break;

      case 'q_time':
        await renderBotMessage(
          'Depende del proyecto:<br>' +
          '• Decoraciones de <strong>eventos</strong>: 1-3 días<br>' +
          '• Diseños de <strong>interiores</strong>: 2-6 semanas<br><br>' +
          '¿Tienes una fecha límite?',
          [
            { label: '📅 Sí, tengo fecha límite',  action: () => goState('naming') },
            { label: '💬 Hablar con un asesor',    action: () => window.open('https://wa.me/' + PHONE, '_blank', 'noopener,noreferrer') }
          ]
        );
        break;

      case 'q_process':
        await renderBotMessage(
          'Nuestro proceso es simple:<br><br>' +
          '1️⃣ <strong>Consulta gratuita</strong><br>' +
          '2️⃣ <strong>Propuesta y cotización</strong><br>' +
          '3️⃣ <strong>Aprobación</strong><br>' +
          '4️⃣ <strong>Ejecución</strong><br>' +
          '5️⃣ <strong>Entrega y seguimiento</strong><br><br>' +
          '¿Te interesa comenzar?',
          [
            { label: '🚀 ¡Sí, empecemos!', action: () => goState('naming')  },
            { label: '⬅️ Volver al menú', action: () => goState('welcome') }
          ]
        );
        break;

      /* ---- EXPLORAR ---- */

      case 'explore':
        await renderBotMessage(
          '¡Tranquilo/a! Estás en el lugar indicado para inspirarte. 🏡✨<br>' +
          'Si en algún momento quieres cotizar o tienes preguntas, aquí estaré.<br>' +
          '¡Que disfrutes explorar! 😊'
        );
        setTimeout(() => close(), 5000);
        break;
    }

    saveSession();
  }

  async function askCityFreeText() {
    await renderBotMessage('¿En qué ciudad necesitas el servicio?');
    currentState = 'city_text';
    showTextInput('Escribe tu ciudad...');
    saveSession();
  }

  /* ==========================================================================
     WHATSAPP — MENSAJE PRE-LLENADO
  ========================================================================== */

  function openWhatsApp() {
    const lines = [
      '¡Hola Decorhouse BAQ! 👋 Me atendió Valentina en su web.',
      'Mi nombre es *' + userData.nombre + '*.',
      'Estoy interesado/a en: *' + userData.servicio + '*',
      'Ciudad: *' + userData.ciudad + '*',
      'Fecha aproximada: *' + userData.fecha + '*',
      'Detalle: ' + userData.detalle,
      '¡Quedo atento/a a su cotización! 😊'
    ];
    const text = lines.join('\n');
    window.open(
      'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text),
      '_blank',
      'noopener,noreferrer'
    );
  }

  /* ==========================================================================
     ABRIR / CERRAR / REINICIAR
  ========================================================================== */

  function open() {
    const win   = $('chatbotWindow');
    const btn   = $('chatbotBtn');
    const badge = $('chatbotBadge');
    if (!win) return;

    win.hidden = false;
    win.classList.remove('is-closing');
    if (btn)   btn.classList.add('is-open');
    if (badge) badge.classList.remove('is-visible');

    if (!loadSession()) {
      goState('welcome');
    }
    scrollToBottom();
  }

  function close() {
    const win = $('chatbotWindow');
    const btn = $('chatbotBtn');
    if (!win) return;

    win.classList.add('is-closing');
    setTimeout(() => {
      win.hidden = true;
      win.classList.remove('is-closing');
    }, 280);
    if (btn) btn.classList.remove('is-open');
  }

  function reset() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* noop */ }

    const msgs = $('chatbotMessages');
    if (msgs) msgs.innerHTML = '';

    hideTextInput();
    userData.nombre   = '';
    userData.servicio = '';
    userData.ciudad   = '';
    userData.fecha    = '';
    userData.detalle  = '';
    currentState = 'welcome';

    goState('welcome');
  }

  /* ==========================================================================
     SESSION STORAGE
  ========================================================================== */

  function saveSession() {
    const msgs = $('chatbotMessages');
    if (!msgs) return;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        html:      msgs.innerHTML,
        state:     currentState,
        userData:  Object.assign({}, userData),
        inputType: inputType
      }));
    } catch (e) { /* noop */ }
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;

      const saved = JSON.parse(raw);
      const msgs  = $('chatbotMessages');
      if (!msgs || !saved.html) return false;

      /* Restaurar HTML de mensajes */
      msgs.innerHTML = saved.html;

      /* Deshabilitar botones restaurados — no tienen event listeners */
      msgs.querySelectorAll('.chat-option-btn').forEach((b) => {
        b.disabled = true;
        b.classList.add('is-disabled');
      });

      /* Restaurar estado */
      currentState = saved.state || 'welcome';
      if (saved.userData) Object.assign(userData, saved.userData);
      inputType = saved.inputType || null;

      /* Restaurar input si el usuario estaba escribiendo */
      if (inputType === 'text') {
        const placeholders = {
          naming:    'Tu nombre...',
          city_text: 'Escribe tu ciudad...',
          detail:    'Ej: sala de 30m², estilo moderno...'
        };
        showTextInput(placeholders[currentState] || 'Escribe aquí...');
      }

      scrollToBottom();
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ==========================================================================
     APERTURA DESDE TARJETA DE SERVICIO (Fase 2)
     Permite pre-seleccionar un servicio al abrir el chat.
  ========================================================================== */

  function openWithService(service) {
    open();
    const msgs = $('chatbotMessages');
    /* Solo pre-cargar si el chat está vacío (sesión nueva) */
    if (!msgs || msgs.children.length === 0) {
      userData.servicio = service;
      currentState = 'naming';
      renderBotMessage(
        '¡Hola! 👋 Soy <strong>Valentina</strong>, asistente de Decorhouse BAQ.<br>' +
        'Veo que te interesa <strong>' + sanitize(service) + '</strong>. ¡Excelente elección! 🌟<br>' +
        '¿Cuál es tu <strong>nombre</strong> para continuar?'
      ).then(() => showTextInput('Tu nombre...'));
    }
  }

  /* ==========================================================================
     BADGE — aparece a los 5 segundos si el chat está cerrado
  ========================================================================== */

  function initBadge() {
    const badge = $('chatbotBadge');
    const win   = $('chatbotWindow');
    if (!badge) return;

    setTimeout(() => {
      if (win && !win.hidden) return;
      badge.classList.add('is-visible');

      /* Auto-ocultar después de 8 segundos */
      setTimeout(() => badge.classList.remove('is-visible'), 8000);
    }, 5000);
  }

  /* ==========================================================================
     INICIALIZACIÓN
  ========================================================================== */

  function init() {
    const openBtn    = $('chatbotBtn');
    const closeBtn   = $('chatbotClose');
    const restartBtn = $('chatbotRestart');
    const sendBtn    = $('chatbotSend');
    const textField  = $('chatbotTextField');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        const win = $('chatbotWindow');
        if (win && !win.hidden) { close(); } else { open(); }
      });
    }

    if (closeBtn)   closeBtn.addEventListener('click', close);
    if (restartBtn) restartBtn.addEventListener('click', reset);

    if (sendBtn) sendBtn.addEventListener('click', handleTextSubmit);

    if (textField) {
      textField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleTextSubmit();
        }
      });
    }

    initBadge();
  }

  /* API pública */
  return { init, open, close, reset, openWithService };

})();

document.addEventListener('DOMContentLoaded', () => {
  ChatBot.init();
});
