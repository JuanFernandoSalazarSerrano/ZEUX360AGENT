const app = document.getElementById("app");

function renderIdleScreen() {
  app.innerHTML = `
    <div class="screen screen-compact">
      <img class="logo" src="LogoV1.png" alt="Colsubsidio" />
      <h1 class="title">Smart Cashback Modo Desarrollador</h1>
      <p class="subtitle">Visualizacion del algoritmo de hiperpersonalizacion</p>
      <div class="divider"></div>
      <button id="draw-lines">Iniciar simulaci&oacute;n</button>
    </div>
  `;
}

function renderLoadingScreen() {
  app.innerHTML = `
    <div class="screen">
      <img class="logo" src="LogoV1.png" alt="Colsubsidio" />
      <h1 class="title">Procesando</h1>
      <p class="subtitle">Preparando tu simulaci&oacute;n personalizada.</p>
      <div class="divider"></div>
      <div class="spacer"></div>
      <div class="status" style="margin-bottom: 16px;">
        <span class="spinner" aria-hidden="true"></span>
        <span id="status">Un momento, por favor...</span>
      </div>
      <button disabled>Procesando...</button>
    </div>
  `;
}

function renderCompleteScreen() {
  app.innerHTML = `
    <div class="screen opportunity">
      <div class="logo-wrap">
        <img class="logo logo-lg" src="LogoV1.png" alt="Colsubsidio" />
      </div>

      <h1 class="opportunity-title">Encontramos una oportunidad para ti</h1>

      <div class="product-summary">
        <img class="product-thumb" src="https://http2.mlstatic.com/D_NQ_NP_2X_791332-MLA109640286585_032026-F.webp" alt="Bicicleta Rockrider MTB" />
        <div class="product-info">
          <div class="product-name">Bicicleta Mtb Gw Aluminio Scorpion Shimano 7 Montaña Color Gris Tamaño Del Marco 17&quot;</div>
          <div class="product-price">COP 789.900</div>
          <span class="product-tag">Deporte y recreaci&oacute;n</span>
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
          <strong>COP 71.667</strong>
        </div>
        <div class="stat">
          <span>Tasa de inter&eacute;s</span>
          <strong>Personalizada</strong>
        </div>
        <div class="stat accent">
          <span>Cashback</span>
          <strong>5% &middot; COP 115.000</strong>
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
          <span>Participas frecuentemente en programas de recreaci&oacute;n</span>
        </div>
        <div class="reason">
          <span class="reason-icon"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span>
          <span>Excelente historial de pagos</span>
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

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      const overlayId = "optin-important-lines-overlay";
      const existing = document.getElementById(overlayId);
      if (existing) existing.remove();

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
        "Notificación push de la app móvil",
        "Mensaje dentro de la app",
        "Notificación del portal web",
        "Cita en sucursal física",
        "Llamada del gestor de relación",
        "Videollamada",
        "Chatbot",
        "Chat en vivo",
        "Facebook Messenger",
        "Mensaje directo de Instagram",
        "Mensajería empresarial RCS",
        "Correo directo",
        "Comunicación de RRHH del empleador",
        "Centro de contacto",
        "Respuesta de voz interactiva (IVR)",
        "Evento presencial / Feria financiera",
      ];

      const randomFrom = (list) => list[Math.floor(Math.random() * list.length)];

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
          { label: randomFrom(communicationChannels).toUpperCase(), ...channelChange },
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
          h1: 100, h2: 95, h3: 90, h4: 85, h5: 80, h6: 75,
          img: 70, p: 60, button: 58, a: 56, input: 54,
          textarea: 54, select: 54, article: 52, main: 51,
          section: 50, nav: 45,
        };

        let score = baseScores[tag] ?? 10;
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
            "h1", "h2", "h3", "h4", "h5", "h6",
            "p", "img", "button", "a", "input",
            "textarea", "select", "main", "article",
            "section", "nav", "[aria-label]",
            "[role='button']", "[role='img']", "[role='main']",
          ].join(",")
        )
      )
        .filter((element) => visible(element))
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
        if (unique.length >= 5) break;
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
      svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.overflow = "visible";

      overlay.appendChild(svg);
      document.documentElement.appendChild(overlay);

      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const infoRepresentationDuration = 200;
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
        { x: window.innerWidth - bracketMargin, y: bracketMargin, dx: -1, dy: 1 },
        { x: bracketMargin, y: window.innerHeight - bracketMargin, dx: 1, dy: -1 },
        { x: window.innerWidth - bracketMargin, y: window.innerHeight - bracketMargin, dx: -1, dy: -1 },
      ];
      corners.forEach(({ x, y, dx, dy }) => {
        const bracket = document.createElementNS(svgNS, "path");
        bracket.setAttribute(
          "d",
          `M ${x} ${y + bracketSize * dy} L ${x} ${y} L ${x + bracketSize * dx} ${y}`
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
        const endX = Math.max(0, Math.min(window.innerWidth, rect.left + rect.width / 2));
        const endY = Math.max(0, Math.min(window.innerHeight, rect.top + rect.height / 2));
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
          flowDot.setAttribute("fill", dotIndex % 2 === 0 ? "#E8F2FF" : "#FFE100");
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
        const labelWidth = Math.min(360, Math.max(150, longestLine * charWidth + 28));
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
        labelText.setAttribute("x", String(boxX + tickWidth + (labelWidth - tickWidth) / 2));
        labelText.setAttribute("y", String(boxY + 10));
        labelText.setAttribute("text-anchor", "middle");
        labelText.setAttribute("dominant-baseline", "hanging");
        labelText.setAttribute("fill", "#FFFFFF");
        labelText.setAttribute("font-family", "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace");
        labelText.setAttribute("font-size", String(labelFontSize));
        labelText.setAttribute("font-weight", "600");
        labelText.setAttribute("letter-spacing", "0.8");

        lines.forEach((line, index) => {
          const tspan = document.createElementNS(svgNS, "tspan");
          tspan.setAttribute("x", String(boxX + tickWidth + (labelWidth - tickWidth) / 2));
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
        const tickerWidth = Math.min(300, Math.max(170, longestLabel * 5.6 + 70));

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
          rowLabel.setAttribute("font-family", "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace");
          rowLabel.setAttribute("font-size", "8.5");
          rowLabel.setAttribute("font-weight", "600");
          rowLabel.setAttribute("letter-spacing", "0.4");
          const maxChars = 24;
          rowLabel.textContent =
            kpi.label.length > maxChars ? kpi.label.slice(0, maxChars - 1) + "…" : kpi.label;

          const rowValue = document.createElementNS(svgNS, "text");
          rowValue.setAttribute("x", String(tickerX + tickerWidth - 8));
          rowValue.setAttribute("y", String(rowY));
          rowValue.setAttribute("text-anchor", "end");
          rowValue.setAttribute("dominant-baseline", "central");
          rowValue.setAttribute("fill", kpi.color);
          rowValue.setAttribute("font-family", "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace");
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
              const progress = Math.min(1, Math.max(0, (now - startTime) / duration));
              const eased = progress * progress * (3 - 2 * progress);
              const currentX = endX + (startX - endX) * eased;
              const currentY = endY + (startY - endY) * eased;

              flowDot.setAttribute("cx", String(currentX));
              flowDot.setAttribute("cy", String(currentY));
              flowDot.setAttribute("opacity", progress < 0.01 ? "0" : String(0.55 + (1 - Math.abs(0.5 - progress) * 2) * 0.45));

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
    },
  });

  setStatus("Simulación completada.");
}

app.addEventListener("click", async (event) => {
  const button = event.target.closest("#draw-lines");
  if (!button || button.disabled) {
    return;
  }

  renderLoadingScreen();
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));

  try {
    await drawImportantLines();
    renderCompleteScreen();
  } catch (error) {
    console.error(error);
    renderErrorScreen(error instanceof Error ? error.message : "No se pudo completar la simulación.");
  }
});

renderIdleScreen();
