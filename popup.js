const app = document.getElementById("app");

// Chrome sizes the popup window to fit its content on first paint, but it
// only auto-grows afterwards — it does not shrink the window back down when
// a later screen is shorter (e.g. idle/loading, shown right after the tall
// "Iniciar sesión"/"Términos" screens on a first-time login). Briefly
// collapsing <html> to 0 height and letting it re-expand on the next frame
// forces Chrome to re-measure the popup and shrink it to the new, shorter
// content instead of keeping the old, taller size.
function fitPopupToContent() {
  const root = document.documentElement;
  root.style.height = "0px";
  requestAnimationFrame(() => {
    root.style.height = "";
  });
}

new MutationObserver(() => {
  requestAnimationFrame(fitPopupToContent);
}).observe(app, { childList: true, subtree: true });

// ---- Persistencia de sesión / consentimiento ----
const STORAGE_KEYS = {
  loggedIn: "colsubsidio_logged_in",
  termsAccepted: "colsubsidio_terms_accepted",
  userName: "colsubsidio_user_name",
  numeroDocumento: "numero_documento_usuario",
  tipoDocumento: "tipo_documento_usuario"
};

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("[v0] No se pudo leer localStorage:", error);
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn("[v0] No se pudo escribir en localStorage:", error);
  }
}

function isLoggedIn() {
  return safeGet(STORAGE_KEYS.loggedIn) === "true";
}

function hasAcceptedTerms() {
  return safeGet(STORAGE_KEYS.termsAccepted) === "true";
}

function getUserName() {
  return safeGet(STORAGE_KEYS.userName) || "";
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

const MERCADOLIBRE_DEFAULT_PRODUCT = {
  category: "Deporte y recreaci\u00f3n",
  name: "Bicicleta Mtb Gw Aluminio Scorpion Shimano 7 Monta\u00f1a Color Gris Tama\u00f1o Del Marco 17\"",
  image:
    "https://http2.mlstatic.com/D_NQ_NP_2X_791332-MLA109640286585_032026-F.webp",
  price: "COP 789.900",
};

function normalizeMercadolibreText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function firstDefinedValue(values) {
  return values.find((value) => normalizeMercadolibreText(value)) || "";
}

function truncateMercadolibreName(value, maxWords = 2) {
  const words = normalizeMercadolibreText(value).split(" ").filter(Boolean);
  return words.slice(0, maxWords).join(" ");
}

function formatMercadolibrePrice(value) {
  const text = normalizeMercadolibreText(value)
    .replace(/\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\s*%\s*OFF\b/gi, "")
    .replace(/\b\d+(?:[.,]\d+)?\s*%\s*OFF\b/gi, "")
    .trim();

  const moneyPattern = /(?:COP|USD|EUR|MXN|ARS|CLP|PEN|BRL)?\s*\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)/gi;
  const matches = [...text.matchAll(moneyPattern)].map((match) =>
    normalizeMercadolibreText(match[1]),
  );

  if (matches.length > 0) {
    return matches[matches.length - 1];
  }

  return text;
}

function parseMercadolibreAmount(value) {
  const text = normalizeMercadolibreText(value);
  const match = text.match(/\d[\d.,]*/);
  if (!match) {
    return null;
  }

  const digitsOnly = match[0].replace(/\D/g, "");
  if (!digitsOnly) {
    return null;
  }

  return Number(digitsOnly);
}

function formatCopAmount(amount) {
  const numericAmount = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `COP ${new Intl.NumberFormat("es-CO").format(numericAmount)}`;
}

function calculateCashbackAmount(priceAmount, cashbackRate = 0.1) {
  return Math.round(priceAmount * cashbackRate);
}

function calculateMonthlyInstallment(priceAmount, months = 12) {
  return Math.round(priceAmount / months);
}

// Decide qué pantalla mostrar según el estado guardado.
function startFlow() {
  if (!isLoggedIn()) {
    renderLoginScreen();
    return;
  }
  if (!hasAcceptedTerms()) {
    renderTermsScreen();
    return;
  }
  renderIdleScreen();
}

function renderLoginScreen() {
  app.innerHTML = `
    <div class="screen auth">
      <div class="logo-wrap">
        <img class="logo" src="LogoV1.png" alt="Colsubsidio" />
      </div>

      <h1 class="auth-title">Bienvenido a Colsubsidio Virtual</h1>

      <div class="auth-intro">
        <span class="intro-icon">
          <svg viewBox="0 0 24 24"><path d="m3 11 15-7v16l-6-2.8"/><path d="M3 11v4a2 2 0 0 0 2 2h1.5"/><path d="M7 17v3a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2"/></svg>
        </span>
        <p>Para mejorar la experiencia y proteger tus datos ahora debes crear tu cuenta, si ya tienes una inicia sesi&oacute;n.</p>
      </div>

      <form id="login-form" novalidate>
        <div class="field">
          <label for="nombre">Nombre</label>
          <input
            id="nombre"
            class="input"
            type="text"
            autocomplete="name"
            placeholder="Nombre completo"
          />
        </div>

        <div class="field">
          <label for="doc-type">Tipo de documento</label>
          <select id="doc-type" class="select">
            <option value="CC" selected>C&eacute;dula de Ciudadan&iacute;a</option>
            <option value="CE">C&eacute;dula de Extranjer&iacute;a</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PA">Pasaporte</option>
          </select>
        </div>

        <div class="field">
          <label for="cedula">N&uacute;mero de documento</label>
          <input
            id="cedula"
            class="input"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            placeholder="N&uacute;mero de documento"
          />
        </div>

        <div class="field">
          <label for="password">Contrase&ntilde;a</label>
          <div class="password-wrap">
            <input
              id="password"
              class="input"
              type="password"
              autocomplete="current-password"
              placeholder="Contrase&ntilde;a"
            />
            <button type="button" id="toggle-pass" class="toggle-pass" aria-label="Mostrar contrase&ntilde;a">
              <svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <div class="field-error" id="login-error" role="alert"></div>

        <div class="actions">
          <button type="submit">&rsaquo; Ingresar</button>
        </div>

        <div class="auth-links">
          <button type="button" class="link">&iquest;Olvidaste tu contrase&ntilde;a?</button>
          <span class="signup">&iquest;No tienes una cuenta? <button type="button" class="link accent">Crea una cuenta</button></span>
        </div>
      </form>
    </div>
  `;

  const form = document.getElementById("login-form");
  const nombre = document.getElementById("nombre");
  const cedula = document.getElementById("cedula");
  const password = document.getElementById("password");
  const errorEl = document.getElementById("login-error");
  const toggle = document.getElementById("toggle-pass");

  nombre.addEventListener("input", () => {
    if (errorEl.textContent) errorEl.textContent = "";
  });

  // La cédula solo admite enteros: se eliminan caracteres no numéricos al escribir.
  cedula.addEventListener("input", () => {
    const cleaned = cedula.value.replace(/\D/g, "");
    if (cleaned !== cedula.value) {
      cedula.value = cleaned;
    }
    if (errorEl.textContent) errorEl.textContent = "";
  });

  toggle.addEventListener("click", () => {
    const willShow = password.type === "password";
    password.type = willShow ? "text" : "password";
    toggle.setAttribute(
      "aria-label",
      willShow ? "Ocultar contrase\u00f1a" : "Mostrar contrase\u00f1a",
    );
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nombre.value.trim();
    const doc = cedula.value.trim();
    const pass = password.value;

    if (!name) {
      errorEl.textContent = "Ingresa tu nombre.";
      nombre.focus();
      return;
    }
    if (!doc) {
      errorEl.textContent = "Ingresa tu n\u00famero de documento.";
      cedula.focus();
      return;
    }
    if (!/^\d+$/.test(doc)) {
      errorEl.textContent = "La c\u00e9dula solo puede contener n\u00fameros.";
      cedula.focus();
      return;
    }
    if (!pass) {
      errorEl.textContent = "Ingresa tu contrase\u00f1a.";
      password.focus();
      return;
    }

    // Login simulado: cualquier contraseña es válida.
    errorEl.textContent = "";
    safeSet(STORAGE_KEYS.loggedIn, "true");
    safeSet(STORAGE_KEYS.userName, name);
    startFlow();
  });
}

function renderTermsScreen() {
  app.innerHTML = `
    <div class="screen terms">
      <div class="logo-wrap">
        <img class="logo" src="LogoV1.png" alt="Colsubsidio" />
      </div>

      <h1 class="terms-title">T&eacute;rminos y condiciones</h1>
      <p class="terms-sub">Antes de continuar, revisa y acepta nuestros t&eacute;rminos de uso y pol&iacute;tica de tratamiento de datos.</p>

      <div class="terms-box" tabindex="0">
        <h3>1. Aceptaci&oacute;n</h3>
        <p>Al utilizar Colsubsidio Virtual aceptas los presentes t&eacute;rminos y condiciones, as&iacute; como las pol&iacute;ticas asociadas al uso de la plataforma y sus servicios.</p>

        <h3>2. Tratamiento de datos personales</h3>
        <p>Autorizas el tratamiento de tus datos personales conforme a la Ley 1581 de 2012 y dem&aacute;s normas aplicables, con la finalidad de ofrecerte productos, beneficios y una experiencia personalizada.</p>

        <h3>3. Uso de la plataforma</h3>
        <p>Te comprometes a utilizar la plataforma de manera responsable, proporcionando informaci&oacute;n veraz y actualizada. El uso indebido podr&aacute; conllevar la suspensi&oacute;n del servicio.</p>

        <h3>4. Ofertas y financiaci&oacute;n</h3>
        <p>Las ofertas, cupos de cr&eacute;dito y beneficios mostrados son informativos y est&aacute;n sujetos a estudio, aprobaci&oacute;n y disponibilidad. No constituyen una oferta comercial vinculante.</p>

        <h3>5. Seguridad</h3>
        <p>Nos comprometemos a proteger tu informaci&oacute;n mediante medidas t&eacute;cnicas y organizativas. T&uacute; eres responsable de mantener la confidencialidad de tus credenciales de acceso.</p>

        <h3>6. Cambios</h3>
        <p>Podemos actualizar estos t&eacute;rminos en cualquier momento. Te notificaremos los cambios relevantes a trav&eacute;s de los canales oficiales.</p>
      </div>

      <label class="terms-check" for="terms-accept">
        <input type="checkbox" id="terms-accept" />
        <span class="checkbox"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span>
        <span>He le&iacute;do y acepto los t&eacute;rminos y condiciones</span>
      </label>

      <div class="actions">
        <button type="button" id="accept-terms" disabled>Aceptar y continuar</button>
      </div>
    </div>
  `;

  const check = document.getElementById("terms-accept");
  const acceptBtn = document.getElementById("accept-terms");

  check.addEventListener("change", () => {
    acceptBtn.disabled = !check.checked;
  });

  acceptBtn.addEventListener("click", () => {
    if (!check.checked) return;
    safeSet(STORAGE_KEYS.termsAccepted, "true");
    startFlow();
  });
}

function renderIdleScreen() {
  app.innerHTML = `
    <div class="screen screen-compact">
      <img class="logo" src="LogoV1.png" alt="Colsubsidio" />
      <h1 class="title">Smart Cashback Modo Desarrollador</h1>
      <p class="subtitle">Visualizacion del algoritmo de Hyper-personalizaci&oacute;n</p>
      <div class="divider"></div>
      <button id="draw-lines" style="margin-bottom: 8px;">Iniciar simulaci&oacute;n</button>
    </div>
  `;
}

function renderLoadingScreen() {
  app.innerHTML = `
    <div class="screen screen-loading">
      <img class="logo" src="LogoV1.png" alt="Colsubsidio" />
      <h1 class="title">Procesando</h1>
      <p class="subtitle">Preparando tu credito hyper-personalizado.</p>
      <div class="divider"></div>
      <div class="status">
        <span class="spinner" aria-hidden="true"></span>
        <span id="status">Un momento, por favor...</span>
      </div>
      <button disabled>Procesando...</button>
    </div>
  `;
}

function renderCompleteScreen(product = MERCADOLIBRE_DEFAULT_PRODUCT) {
  const name = getUserName();
  const firstName = name.split(/\s+/)[0] || "";
  const greeting = firstName ? `, ${escapeHtml(firstName)}` : "";
  const category = escapeHtml(
    product.category || MERCADOLIBRE_DEFAULT_PRODUCT.category,
  );
  const productName = escapeHtml(
    truncateMercadolibreName(
      product.name || MERCADOLIBRE_DEFAULT_PRODUCT.name,
      2,
    ),
  );
  const rawPrice = product.price || MERCADOLIBRE_DEFAULT_PRODUCT.price;
  const priceAmount =
    parseMercadolibreAmount(rawPrice) ??
    parseMercadolibreAmount(MERCADOLIBRE_DEFAULT_PRODUCT.price) ??
    0;
  const productPrice = escapeHtml(formatCopAmount(priceAmount));
  const monthlyInstallment = escapeHtml(
    formatCopAmount(calculateMonthlyInstallment(priceAmount)),
  );
  const cashbackAmount = escapeHtml(
    formatCopAmount(calculateCashbackAmount(priceAmount)),
  );
  const productImage =
    product.image || MERCADOLIBRE_DEFAULT_PRODUCT.image;

  app.innerHTML = `
    <div class="screen opportunity">
      <div class="logo-wrap">
        <img class="logo logo-sm" src="LogoV1.png" alt="Colsubsidio" />
      </div>

      <h1 class="opportunity-title" style="margin-bottom: 18px;">Encontramos una oportunidad muy especial solo para ti${greeting}!</h1>

      <div class="product-summary">
        <img class="product-thumb" src="${productImage}" alt="${productName}" />
        <div class="product-info">
          <div class="product-name">${productName}</div>
          <div class="product-price">${productPrice}</div>
          <span class="product-tag">${category}</span>
        </div>
      </div>

      <div class="confidence">
        <span>Nivel de confianza</span>
        <div class="confidence-track"><div class="confidence-fill"></div></div>
        <strong>98%</strong>
      </div>

      <div class="financing-label">Financiaci&oacute;n recomendada</div>
      <div class="financing-title">Cr&eacute;dito de consumo</div>

      <div class="stat-grid">
        <div class="stat">
          <span>Cuota mensual</span>
          <strong>${monthlyInstallment}</strong>
        </div>
        <div class="stat">
          <span>Tasa de inter&eacute;s</span>
          <strong>Personalizada</strong>
        </div>
        <div class="stat accent">
          <span>Cashback</span>
          <strong>10% &middot; ${cashbackAmount}</strong>
        </div>
        <div class="stat">
          <span>Aprobaci&oacute;n</span>
          <strong>Muy alta</strong>
        </div>
      </div>

            <div class="actions">
        <button>Aplicar en 30 segundos</button>
        <button class="button-ghost">Quiz&aacute;s despu&eacute;s</button>
      </div>

      <div class="section-label">&iquest;Por qu&eacute; ves esta oferta?</div>
      <div class="reason-list">
        <div class="reason">
          <span class="reason-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg></span>
          <span>Excelente historial de pagos</span>
          </div>
        <div class="reason">
          <span class="reason-icon"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span>
                  <span>Participas frecuentemente en programas de recreaci&oacute;n</span>
          </div>
        <div class="reason">
          <span class="reason-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg></span>
          <span>Calificas para este cr&eacute;dito</span>
        </div>
        <div class="reason">
          <span class="reason-icon"><svg viewBox="0 0 24 24"><path d="M20.8 8.6a5.5 5.5 0 0 0-8.8-1.5 5.5 5.5 0 0 0-8.8 1.5c-1.5 3.5 1.2 7 8.8 12.4 7.6-5.4 10.3-8.9 8.8-12.4z"/></svg></span>
          <span>Coincide con tus intereses</span>
        </div>
        <div class="reason urgent">
          <span class="reason-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></span>
          <span>La oferta expira en <strong>48 horas</strong></span>
        </div>
      </div>

      <div class="section-label">Otros beneficios disponibles</div>
      <div class="benefit-grid">
        <div class="benefit">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M8.2 12.5 7 21l5-3 5 3-1.2-8.5"/></svg>
          <strong>Puntos de recreaci&oacute;n</strong>
          <span>Usa 1.240 pts</span>
        </div>
        <div class="benefit">
          <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <strong>Seguro deportivo</strong>
          <span>15% dcto</span>
        </div>
        <div class="benefit">
          <svg viewBox="0 0 24 24"><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18v3h3l5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3 3.7-3.7z"/></svg>
          <strong>Mantenimiento de bici</strong>
          <span>Cup&oacute;n gratis</span>
        </div>
        <div class="benefit">
          <svg viewBox="0 0 24 24"><path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
          <strong>Descuento en casco</strong>
          <span>20% dcto</span>
        </div>
        <div class="benefit">
          <svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>
          <strong>Protecci&oacute;n de pagos</strong>
          <span>Primer mes</span>
        </div>
        <div class="benefit">
          <svg viewBox="0 0 24 24"><path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/></svg>
          <strong>Impulso de lealtad</strong>
          <span>+2&times; puntos</span>
        </div>
      </div>

      <div class="section-label">Para ti <span class="meta">IA curada &middot; Cliente 360</span></div>
      <div class="foryou-card">
        <div class="foryou-hero">
          <span class="foryou-hero-icon"><svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg></span>
          <span class="foryou-hero-tag">Vivienda</span>
        </div>
        <div class="foryou-body">
          <h2 class="foryou-title">Nuevo subsidio de vivienda</h2>
          <p class="foryou-desc">Seg&uacute;n tu perfil financiero, podr&iacute;as calificar para un subsidio de vivienda Colsubsidio.</p>
          <div class="foryou-actions">
            <button class="btn-primary">Conocer m&aacute;s</button>
            <button class="btn-save">Guardar</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

function renderErrorScreen(message) {
  app.innerHTML = `
    <div class="screen">
      <img class="logo" src="LogoV1.png" alt="Colsubsidio" />
      <h1 class="title">Algo sali&oacute; mal</h1>
      <p class="subtitle" id="status">${message}</p>
      <div class="divider"></div>
      <div class="spacer"></div>
      <button id="draw-lines">Volver a intentar</button>
    </div>
  `;
}

function setStatus(message) {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.textContent = message;
  }
}

async function drawImportantLines() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    throw new Error("No se encontró una pestaña activa.");
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      const overlayId = "optin-important-lines-overlay";
      const existing = document.getElementById(overlayId);
      if (existing) existing.remove();

      const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();

      const toElement = (candidate) => {
        if (!candidate) return null;
        if (candidate instanceof Element) return candidate;
        if (candidate.element instanceof Element) return candidate.element;
        if (candidate.node instanceof Element) return candidate.node;
        if (candidate.target instanceof Element) return candidate.target;
        if (typeof candidate === "string") return document.querySelector(candidate);
        if (candidate.selector) return document.querySelector(candidate.selector);
        if (candidate.query) return document.querySelector(candidate.query);
        return null;
      };

      const readText = (element) => normalize(element?.textContent);
      const readPriceValue = (element) => {
        if (!element) return "";
        const content = element.getAttribute?.("content") || "";
        const text = normalize(element.textContent);
        return content || text || "";
      };
      const readImageSrc = (element) => {
        if (!element) return "";
        if (element.tagName?.toLowerCase() === "img") {
          return element.currentSrc || element.src || element.getAttribute("src") || "";
        }
        const image = element.querySelector?.("img");
        if (image) {
          return image.currentSrc || image.src || image.getAttribute("src") || "";
        }
        return element.getAttribute?.("src") || "";
      };

      const mercadolibreCandidates = Array.isArray(window.candidatesMercadolibre)
        ? window.candidatesMercadolibre
        : [];
      const mercadolibreElements = mercadolibreCandidates.map(toElement).filter(Boolean);

      const findDisplayElement = (selectors) => {
        for (const selector of selectors) {
          const fromCandidates = mercadolibreElements.find((element) => {
            try {
              return element.matches(selector);
            } catch {
              return false;
            }
          });
          if (fromCandidates) return fromCandidates;

          try {
            const fallback = document.querySelector(selector);
            if (fallback) return fallback;
          } catch {
            // Ignore invalid selectors.
          }
        }
        return null;
      };

      const product = {
        category: readText(
          findDisplayElement([".andes-breadcrumb", "[class*='andes-breadcrumb']"]),
        ),
        name: readText(
          findDisplayElement([".ui-pdp-title", "[class*='ui-pdp-title']"]),
        ),
        image: readImageSrc(
          findDisplayElement([
            ".ui-pdp-image.ui-pdp-gallery__figure__image",
            ".ui-pdp-gallery__figure__image",
            ".ui-pdp-image",
            "img.ui-pdp-image",
          ]),
        ),
        price: (() => {
          const priceContainer = document.querySelector(
            ".ui-pdp-container__row.ui-pdp-container__row--price",
          );
          const priceElement = priceContainer?.querySelector(
            "[itemprop='price']",
          );
          return (
            readPriceValue(priceElement) ||
            readPriceValue(
              findDisplayElement([
                "[itemprop='price']",
                ".ui-pdp-price__price-breakdown-inline",
                "[class*='ui-pdp-price__price-breakdown-inline']",
              ]),
            ) ||
            "0"
          );
        })(),
      };

      const displayElements = [
        findDisplayElement([".andes-breadcrumb", "[class*='andes-breadcrumb']"]),
        findDisplayElement([".ui-pdp-title", "[class*='ui-pdp-title']"]),
        findDisplayElement([
          ".ui-pdp-image.ui-pdp-gallery__figure__image",
          ".ui-pdp-gallery__figure__image",
          ".ui-pdp-image",
          "img.ui-pdp-image",
        ]),
        findDisplayElement([
          ".ui-pdp-price__price-breakdown-inline",
          "[class*='ui-pdp-price__price-breakdown-inline']",
        ]),
      ].filter(Boolean);
      const displayElementSet = new Set(displayElements);

      // ---- Spanish data sources for the KPI ticker ----
      const creditTypes = [
        "Cupo de crédito",
        "Crédito de consumo",
        "Crédito de vivienda",
        "Crédito Mujeres",
        "Crédito educativo",
      ];

      const communicationChannels = [
        "WhatsApp",
        "Llamada telefónica",
        "SMS",
        "Correo electrónico",
        "Notificación app móvil",
        "Mensaje dentro de la app",
        "Notificación del portal web",
        "Cita en sucursal física",
        "Llamada del gestor de relación",
        "Videollamada",
        "Chatbot",
        "Chat en vivo",
        "Facebook Messenger",
        "Instagram",
        "Mensajería empresarial",
        "Correo directo",
        "Comunicación de RRHH",
        "Centro de contacto",
        "Respuesta de voz interactiva",
        "Evento presencial",
      ];

      const randomFrom = (list) =>
        list[Math.floor(Math.random() * list.length)];

      const randomChange = () => {
        const magnitude = Math.random();
        const isPositive = Math.random() < 0.5;
        const sign = isPositive ? "+" : "-";
        const color = isPositive ? "#00D964" : "#FF3B3B";
        const arrow = isPositive ? "▲" : "▼";
        return { display: `${arrow} ${sign}${magnitude.toFixed(2)}`, color };
      };

      const buildKPIs = () => {
        const creditChange = randomChange();
        const riskChange = randomChange();
        const channelChange = randomChange();
        return [
          { label: randomFrom(creditTypes).toUpperCase(), ...creditChange },
          { label: "RIESGO DE IMPAGO", ...riskChange },
          {
            label: randomFrom(communicationChannels).toUpperCase(),
            ...channelChange,
          },
        ];
      };

      const visible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          rect.bottom >= 0 &&
          rect.right >= 0 &&
          rect.top <= window.innerHeight &&
          rect.left <= window.innerWidth
        );
      };

      const scoreElement = (element) => {
        const tag = element.tagName.toLowerCase();
        const baseScores = {
          h1: 40,
          h2: 38,
          h3: 36,
          h4: 34,
          h5: 32,
          h6: 30,
          img: 28,
          p: 26,
          button: 25,
          a: 24,
          input: 23,
          textarea: 23,
          select: 23,
          article: 22,
          main: 21,
          section: 20,
          nav: 18,
        };

        let score = baseScores[tag] ?? 10;
        const className = element.className?.toString() || "";

        const classBoosts = [
          ["andes-money-amount__fraction", 70],
          ["andes-money-amount__discount", 68],
          ["ui-pdp-price", 55],
          ["ui-pdp-title", 50],
          ["ui-pdp-buybox", 90],
          ["ui-pdp-gallery", 40],
          ["ui-pdp-seller-summary", 36],
          ["ui-pdp-price__subtitles", 30],
          ["shipping", 32],
          ["delivery", 31],
          ["review", 30],
          ["rating", 29],
          ["stars", 28],
          ["specification", 27],
          ["attribute", 26],
          ["breadcrumb", 25],
          ["promotion", 24],
          ["discount", 23],
          ["offer", 22],
          ["price", 21],
          ["money", 20],
          ["amount", 19],
          ["gallery", 18],
          ["carousel", 17],
          ["seller", 16],
          ["buybox", 15],
        ];

        for (const [classToken, boost] of classBoosts) {
          if (className.includes(classToken)) score += boost;
        }

        const attributeBoosts = [
          ["data-andes-button", 10],
          ["data-testid", 9],
          ["data-js", 8],
          ["data-id", 7],
          ["data-name", 6],
          ["data-state", 5],
          ["data-role", 4],
        ];

        for (const [attributeName, boost] of attributeBoosts) {
          if (element.hasAttribute(attributeName)) score += boost;
        }

        if (element.getAttribute("aria-label")) score += 8;
        if (element.getAttribute("role")) score += 5;
        if (tag === "img" && element.alt) score += 8;
        if (tag === "a" && element.href) score += 4;
        return score;
      };

      const extractLabel = (element) => {
        const tag = element.tagName.toLowerCase();
        const text = element.textContent?.replace(/\s+/g, " ").trim();
        const ariaLabel = element.getAttribute("aria-label")?.trim();
        const title = element.getAttribute("title")?.trim();
        const alt = element.getAttribute("alt")?.trim();
        const src = element.getAttribute("src")?.trim();

        if (ariaLabel) return ariaLabel;
        if (title) return title;
        if (tag === "img" && alt) return alt;
        if (text) return text.slice(0, 80);
        if (src) return src.split("/").pop() || src;
        return tag.toUpperCase();
      };

      const candidates = Array.from(
        document.querySelectorAll(
          [
            // Product Detail Page containers
            "[class*='ui-pdp-']",
            ".andes-money-amount__fraction",
            ".andes-money-amount__discount ui-pdp-family--SEMIBOLD ui-pdp-color--WHITE ui-pdp-background-color--GREEN ui-pdp-size--XSMALL ui-pdp-price__discount--with-bg-color",
            ".ui-pdp-price__subtitles",
            // Main product container
            ".ui-pdp-container",
            ".ui-pdp",

            // Product title
            ".ui-pdp-title",

            // Price
            ".ui-pdp-price",
            "[class*='price']",
            "[class*='money']",
            "[class*='amount']",

            // Buy box
            ".ui-pdp-buybox",
            "[class*='buybox']",

            // Product images
            ".ui-pdp-gallery",
            "[class*='gallery']",
            "[class*='carousel']",

            // Seller
            ".ui-pdp-seller-summary",
            "[class*='seller']",

            // Shipping
            "[class*='shipping']",
            "[class*='delivery']",

            // Reviews / ratings
            "[class*='review']",
            "[class*='rating']",
            "[class*='stars']",

            // Specifications
            "[class*='specification']",
            "[class*='attribute']",

            // Breadcrumbs
            "[class*='breadcrumb']",

            // Promotions
            "[class*='promotion']",
            "[class*='discount']",
            "[class*='offer']",

            // Buttons
            "[data-andes-button]",
            ".andes-button",

            // Images
            "picture",
            "figure",

            // Forms
            "form",

            // Schema.org
            "[itemprop]",
            "[itemscope]",
            "[itemtype]",

            // Common metadata
            "script[type='application/ld+json']",

            // Test IDs
            "[data-testid]",

            // Generic data attributes
            "[data-js]",
            "[data-id]",
            "[data-name]",
            "[data-state]",
            "[data-role]",
          ].join(","),
        ),
      )
        .filter((element) => visible(element))
        .filter((element) => !displayElementSet.has(element))
        .sort((left, right) => {
          const scoreDelta = scoreElement(right) - scoreElement(left);
          if (scoreDelta !== 0) return scoreDelta;
          const leftRect = left.getBoundingClientRect();
          const rightRect = right.getBoundingClientRect();
          return leftRect.top - rightRect.top || leftRect.left - rightRect.left;
        });

      const unique = [];
      const seen = new Set();
      for (const element of candidates) {
        if (seen.has(element)) continue;
        seen.add(element);
        unique.push(element);
        // amount of lines drawn! change here!!
        if (unique.length >= 68) break;
      }

      if (unique.length === 0) {
        throw new Error("No fue posible iniciar la simulación en esta página.");
      }

      const svgNS = "http://www.w3.org/2000/svg";
      const overlay = document.createElement("div");
      overlay.id = overlayId;
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "2147483647";

      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", String(window.innerWidth));
      svg.setAttribute("height", String(window.innerHeight));
      svg.setAttribute(
        "viewBox",
        `0 0 ${window.innerWidth} ${window.innerHeight}`,
      );
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.overflow = "visible";

      overlay.appendChild(svg);
      document.documentElement.appendChild(overlay);

      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const infoRepresentationDuration = 100;
      const startX = Math.max(0, window.innerWidth - 300);
      const startY = 10;

      const defs = document.createElementNS(svgNS, "defs");

      const glowFilter = document.createElementNS(svgNS, "filter");
      glowFilter.setAttribute("id", "optin-line-glow");
      glowFilter.setAttribute("x", "-50%");
      glowFilter.setAttribute("y", "-50%");
      glowFilter.setAttribute("width", "200%");
      glowFilter.setAttribute("height", "200%");

      const blur = document.createElementNS(svgNS, "feGaussianBlur");
      blur.setAttribute("in", "SourceGraphic");
      blur.setAttribute("stdDeviation", "2.5");
      blur.setAttribute("result", "blurred");

      const merge = document.createElementNS(svgNS, "feMerge");
      const mergeNodeBlur = document.createElementNS(svgNS, "feMergeNode");
      mergeNodeBlur.setAttribute("in", "blurred");
      const mergeNodeSource = document.createElementNS(svgNS, "feMergeNode");
      mergeNodeSource.setAttribute("in", "SourceGraphic");

      merge.appendChild(mergeNodeBlur);
      merge.appendChild(mergeNodeSource);
      glowFilter.appendChild(blur);
      glowFilter.appendChild(merge);
      defs.appendChild(glowFilter);
      svg.appendChild(defs);

      const gridGroup = document.createElementNS(svgNS, "g");
      gridGroup.setAttribute("opacity", "0.05");
      const gridSpacing = 48;
      for (let gx = 0; gx < window.innerWidth; gx += gridSpacing) {
        const vLine = document.createElementNS(svgNS, "line");
        vLine.setAttribute("x1", String(gx));
        vLine.setAttribute("y1", "0");
        vLine.setAttribute("x2", String(gx));
        vLine.setAttribute("y2", String(window.innerHeight));
        vLine.setAttribute("stroke", "#0056B3");
        vLine.setAttribute("stroke-width", "1");
        gridGroup.appendChild(vLine);
      }
      for (let gy = 0; gy < window.innerHeight; gy += gridSpacing) {
        const hLine = document.createElementNS(svgNS, "line");
        hLine.setAttribute("x1", "0");
        hLine.setAttribute("y1", String(gy));
        hLine.setAttribute("x2", String(window.innerWidth));
        hLine.setAttribute("y2", String(gy));
        hLine.setAttribute("stroke", "#0056B3");
        hLine.setAttribute("stroke-width", "1");
        gridGroup.appendChild(hLine);
      }
      svg.appendChild(gridGroup);

      const bracketSize = 22;
      const bracketMargin = 14;
      const corners = [
        { x: bracketMargin, y: bracketMargin, dx: 1, dy: 1 },
        {
          x: window.innerWidth - bracketMargin,
          y: bracketMargin,
          dx: -1,
          dy: 1,
        },
        {
          x: bracketMargin,
          y: window.innerHeight - bracketMargin,
          dx: 1,
          dy: -1,
        },
        {
          x: window.innerWidth - bracketMargin,
          y: window.innerHeight - bracketMargin,
          dx: -1,
          dy: -1,
        },
      ];
      corners.forEach(({ x, y, dx, dy }) => {
        const bracket = document.createElementNS(svgNS, "path");
        bracket.setAttribute(
          "d",
          `M ${x} ${y + bracketSize * dy} L ${x} ${y} L ${x + bracketSize * dx} ${y}`,
        );
        bracket.setAttribute("stroke", "#FFE100");
        bracket.setAttribute("stroke-width", "2");
        bracket.setAttribute("fill", "none");
        bracket.setAttribute("opacity", "0.7");
        svg.appendChild(bracket);
      });

      const originPulse = document.createElementNS(svgNS, "circle");
      originPulse.setAttribute("cx", String(startX));
      originPulse.setAttribute("cy", String(startY));
      originPulse.setAttribute("r", "6");
      originPulse.setAttribute("fill", "none");
      originPulse.setAttribute("stroke", "#FFE100");
      originPulse.setAttribute("stroke-width", "1.5");
      originPulse.style.transformOrigin = `${startX}px ${startY}px`;
      originPulse.style.animation = "optin-pulse 1.8s ease-out infinite";
      svg.appendChild(originPulse);

      const originDot = document.createElementNS(svgNS, "circle");
      originDot.setAttribute("cx", String(startX));
      originDot.setAttribute("cy", String(startY));
      originDot.setAttribute("r", "3.5");
      originDot.setAttribute("fill", "#FFE100");
      originDot.setAttribute("filter", "url(#optin-line-glow)");
      svg.appendChild(originDot);

      if (!document.getElementById("optin-keyframes")) {
        const styleTag = document.createElement("style");
        styleTag.id = "optin-keyframes";
        styleTag.textContent = `
          @keyframes optin-pulse {
            0% { transform: scale(1); opacity: 0.9; }
            100% { transform: scale(3.2); opacity: 0; }
          }
        `;
        document.head.appendChild(styleTag);
      }

      for (const element of unique) {
        const rect = element.getBoundingClientRect();
        const endX = Math.max(
          0,
          Math.min(window.innerWidth, rect.left + rect.width / 2),
        );
        const endY = Math.max(
          0,
          Math.min(window.innerHeight, rect.top + rect.height / 2),
        );
        const label = extractLabel(element).toUpperCase();
        // Anchor labels at 85% of the line (15% away from the end point)
        const midX = startX + (endX - startX) * 0.85;
        const midY = startY + (endY - startY) * 0.85;

        const reticle = document.createElementNS(svgNS, "rect");
        const rw = Math.max(rect.width, 24);
        const rh = Math.max(rect.height, 24);
        reticle.setAttribute("x", String(rect.left - 4));
        reticle.setAttribute("y", String(rect.top - 4));
        reticle.setAttribute("width", String(rw + 8));
        reticle.setAttribute("height", String(rh + 8));
        reticle.setAttribute("fill", "none");
        reticle.setAttribute("stroke", "#FFE100");
        reticle.setAttribute("stroke-width", "1.5");
        reticle.setAttribute("rx", "2");
        reticle.setAttribute("opacity", "0");
        reticle.style.transition = "opacity 140ms ease-out";

        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", String(startX));
        line.setAttribute("y1", String(startY));
        line.setAttribute("x2", String(endX));
        line.setAttribute("y2", String(endY));
        line.setAttribute("stroke", "#0056B3");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("filter", "url(#optin-line-glow)");
        line.setAttribute("opacity", "0");

        const leadDot = document.createElementNS(svgNS, "circle");
        leadDot.setAttribute("cx", String(endX));
        leadDot.setAttribute("cy", String(endY));
        leadDot.setAttribute("r", "3.8");
        leadDot.setAttribute("fill", "#FFD000");
        leadDot.setAttribute("filter", "url(#optin-line-glow)");
        leadDot.setAttribute("opacity", "0");
        leadDot.style.transition = "opacity 140ms ease-out";

        const flowDots = [];
        const flowDotCount = Math.floor(Math.random() * 7);

        for (let dotIndex = 0; dotIndex < flowDotCount; dotIndex += 1) {
          const flowDot = document.createElementNS(svgNS, "circle");
          flowDot.setAttribute("r", String(2.8 + Math.random() * 1.4));
          flowDot.setAttribute(
            "fill",
            dotIndex % 2 === 0 ? "#E8F2FF" : "#FFE100",
          );
          flowDot.setAttribute("filter", "url(#optin-line-glow)");
          flowDot.setAttribute("opacity", "0");
          flowDots.push(flowDot);
        }

        // ---- Tooltip label (now correctly centered) ----
        const labelGroup = document.createElementNS(svgNS, "g");
        const tickWidth = 3;
        const maxLabelWidth = 320;
        const labelFontSize = 10.5;
        const charWidth = 6.7;
        const words = label.split(/\s+/).filter(Boolean);
        const lines = [];
        let currentLine = "";

        for (const word of words) {
          const candidate = currentLine ? `${currentLine} ${word}` : word;
          if (candidate.length * charWidth <= maxLabelWidth || !currentLine) {
            currentLine = candidate;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }

        if (currentLine) lines.push(currentLine);
        if (lines.length === 0) lines.push(label);

        const longestLine = Math.max(...lines.map((line) => line.length));
        const labelWidth = Math.min(
          360,
          Math.max(150, longestLine * charWidth + 28),
        );
        const lineHeight = 14;
        const labelHeight = Math.max(26, lines.length * lineHeight + 14);
        const boxX = midX - 8;
        const boxY = midY - labelHeight / 2 + 6;

        const labelBox = document.createElementNS(svgNS, "rect");
        labelBox.setAttribute("rx", "3");
        labelBox.setAttribute("ry", "3");
        labelBox.setAttribute("fill", "rgba(5, 15, 34, 0.92)");
        labelBox.setAttribute("stroke", "#0056B3");
        labelBox.setAttribute("stroke-width", "1.25");
        labelBox.setAttribute("x", String(boxX));
        labelBox.setAttribute("y", String(boxY));
        labelBox.setAttribute("width", String(labelWidth));
        labelBox.setAttribute("height", String(labelHeight));

        const accentTick = document.createElementNS(svgNS, "rect");
        accentTick.setAttribute("x", String(boxX));
        accentTick.setAttribute("y", String(boxY));
        accentTick.setAttribute("width", String(tickWidth));
        accentTick.setAttribute("height", String(labelHeight));
        accentTick.setAttribute("fill", "#FFE100");

        const labelText = document.createElementNS(svgNS, "text");
        labelText.setAttribute(
          "x",
          String(boxX + tickWidth + (labelWidth - tickWidth) / 2),
        );
        labelText.setAttribute("y", String(boxY + 10));
        labelText.setAttribute("text-anchor", "middle");
        labelText.setAttribute("dominant-baseline", "hanging");
        labelText.setAttribute("fill", "#FFFFFF");
        labelText.setAttribute(
          "font-family",
          "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        );
        labelText.setAttribute("font-size", String(labelFontSize));
        labelText.setAttribute("font-weight", "600");
        labelText.setAttribute("letter-spacing", "0.8");

        lines.forEach((line, index) => {
          const tspan = document.createElementNS(svgNS, "tspan");
          tspan.setAttribute(
            "x",
            String(boxX + tickWidth + (labelWidth - tickWidth) / 2),
          );
          tspan.setAttribute("dy", index === 0 ? "0" : String(lineHeight));
          tspan.textContent = line;
          labelText.appendChild(tspan);
        });

        svg.appendChild(reticle);
        svg.appendChild(line);
        svg.appendChild(leadDot);
        flowDots.forEach((flowDot) => svg.appendChild(flowDot));
        labelGroup.appendChild(labelBox);
        labelGroup.appendChild(accentTick);
        labelGroup.appendChild(labelText);
        svg.appendChild(labelGroup);

        // ---- Stock-exchange style KPI ticker, next to the tooltip ----
        const kpis = buildKPIs();
        const rowHeight = 16;
        const tickerPaddingV = 8;
        const tickerHeight = tickerPaddingV * 2 + rowHeight * 3;
        const longestLabel = Math.max(...kpis.map((k) => k.label.length));
        const tickerWidth = Math.min(
          300,
          Math.max(170, longestLabel * 5.6 + 70),
        );

        let tickerX = boxX + labelWidth + 10;
        if (tickerX + tickerWidth > window.innerWidth - 8) {
          tickerX = boxX - tickerWidth - 10;
        }
        const tickerY = boxY + labelHeight / 2 - tickerHeight / 2;

        const tickerGroup = document.createElementNS(svgNS, "g");

        const tickerBox = document.createElementNS(svgNS, "rect");
        tickerBox.setAttribute("rx", "3");
        tickerBox.setAttribute("ry", "3");
        tickerBox.setAttribute("x", String(tickerX));
        tickerBox.setAttribute("y", String(tickerY));
        tickerBox.setAttribute("width", String(tickerWidth));
        tickerBox.setAttribute("height", String(tickerHeight));
        tickerBox.setAttribute("fill", "rgba(5, 15, 34, 0.92)");
        tickerBox.setAttribute("stroke", "#0056B3");
        tickerBox.setAttribute("stroke-width", "1.25");
        tickerGroup.appendChild(tickerBox);

        const tickerTopBar = document.createElementNS(svgNS, "rect");
        tickerTopBar.setAttribute("x", String(tickerX));
        tickerTopBar.setAttribute("y", String(tickerY));
        tickerTopBar.setAttribute("width", String(tickerWidth));
        tickerTopBar.setAttribute("height", "2.5");
        tickerTopBar.setAttribute("fill", "#FFE100");
        tickerGroup.appendChild(tickerTopBar);

        kpis.forEach((kpi, i) => {
          const rowY = tickerY + tickerPaddingV + rowHeight * i + rowHeight / 2;

          const rowLabel = document.createElementNS(svgNS, "text");
          rowLabel.setAttribute("x", String(tickerX + 8));
          rowLabel.setAttribute("y", String(rowY));
          rowLabel.setAttribute("text-anchor", "start");
          rowLabel.setAttribute("dominant-baseline", "central");
          rowLabel.setAttribute("fill", "#9FB6D9");
          rowLabel.setAttribute(
            "font-family",
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          );
          rowLabel.setAttribute("font-size", "8.5");
          rowLabel.setAttribute("font-weight", "600");
          rowLabel.setAttribute("letter-spacing", "0.4");
          const maxChars = 24;
          rowLabel.textContent =
            kpi.label.length > maxChars
              ? kpi.label.slice(0, maxChars - 1) + "…"
              : kpi.label;

          const rowValue = document.createElementNS(svgNS, "text");
          rowValue.setAttribute("x", String(tickerX + tickerWidth - 8));
          rowValue.setAttribute("y", String(rowY));
          rowValue.setAttribute("text-anchor", "end");
          rowValue.setAttribute("dominant-baseline", "central");
          rowValue.setAttribute("fill", kpi.color);
          rowValue.setAttribute(
            "font-family",
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          );
          rowValue.setAttribute("font-size", "9");
          rowValue.setAttribute("font-weight", "700");
          rowValue.textContent = kpi.display;

          tickerGroup.appendChild(rowLabel);
          tickerGroup.appendChild(rowValue);
        });

        tickerGroup.style.opacity = "0";
        tickerGroup.style.transition = "opacity 140ms ease-out";
        svg.appendChild(tickerGroup);

        line.style.transition = "opacity 140ms ease-out";
        labelGroup.style.opacity = "0";
        labelGroup.style.transition = "opacity 140ms ease-out";
        labelGroup.style.transformOrigin = `${midX}px ${midY}px`;
        labelGroup.style.transform = "scale(0.985)";

        requestAnimationFrame(() => {
          line.style.opacity = "1";
          leadDot.style.opacity = "1";
          reticle.style.opacity = "1";
          labelGroup.style.opacity = "1";
          labelGroup.style.transform = "scale(1)";
          tickerGroup.style.opacity = "1";

          flowDots.forEach((flowDot, dotIndex) => {
            const delay = dotIndex * 120;
            const duration = infoRepresentationDuration;
            const baseRadius = Number(flowDot.getAttribute("r")) || 2;
            const startTime = performance.now() + delay;

            const animateDot = (now) => {
              const progress = Math.min(
                1,
                Math.max(0, (now - startTime) / duration),
              );
              const eased = progress * progress * (3 - 2 * progress);
              const currentX = endX + (startX - endX) * eased;
              const currentY = endY + (startY - endY) * eased;

              flowDot.setAttribute("cx", String(currentX));
              flowDot.setAttribute("cy", String(currentY));
              flowDot.setAttribute(
                "opacity",
                progress < 0.01
                  ? "0"
                  : String(0.55 + (1 - Math.abs(0.5 - progress) * 2) * 0.45),
              );

              if (progress < 1) {
                requestAnimationFrame(animateDot);
              } else {
                flowDot.setAttribute("opacity", "0");
              }
            };

            flowDot.setAttribute("cx", String(endX));
            flowDot.setAttribute("cy", String(endY));
            flowDot.setAttribute("r", String(baseRadius));
            requestAnimationFrame(animateDot);
          });
        });

        await sleep(infoRepresentationDuration);
        line.style.opacity = "0";
        leadDot.style.opacity = "0";
        flowDots.forEach((flowDot) => flowDot.setAttribute("opacity", "0"));
        reticle.style.opacity = "0";
        labelGroup.style.opacity = "0";
        tickerGroup.style.opacity = "0";
        await sleep(140);
        line.remove();
        leadDot.remove();
        flowDots.forEach((flowDot) => flowDot.remove());
        reticle.remove();
        labelGroup.remove();
        tickerGroup.remove();
      }

      originPulse.remove();
      originDot.remove();
      gridGroup.remove();
      overlay.remove();

      return product;
    },
  });

  setStatus("Simulación completada.");
  return result?.result || null;
}

app.addEventListener("click", async (event) => {
  const button = event.target.closest("#draw-lines");
  if (!button || button.disabled) {
    return;
  }

  renderLoadingScreen();
  fitPopupToContent();
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));

  try {
    const product = await drawImportantLines();
    renderCompleteScreen(product || MERCADOLIBRE_DEFAULT_PRODUCT);
  } catch (error) {
    console.error(error);
    renderErrorScreen(
      error instanceof Error
        ? error.message
        : "No se pudo completar la simulación.",
    );
  }
});

startFlow();
