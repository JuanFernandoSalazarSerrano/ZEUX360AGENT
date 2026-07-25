// service-worker.js — MV3 background worker for MercadoLibre product page capture.
// Strategy: read the real tab's DOM via chrome.scripting.executeScript, waiting for
// actual product content — NOT just the <head> meta tags, which are present even on
// MercadoLibre's bot-challenge interstitial and so aren't a valid "loaded" signal.

const BACKEND_ENDPOINT = 'http://localhost:8000/datastream';
const PRODUCT_URL_MARKERS = ['articulo', '/p/'];

// Verify/adjust via DevTools on your target page — this must be something that only
// exists once the REAL product page has replaced the bot-challenge shell.
const READY_SELECTOR = '.ui-pdp-title';

const WAIT_TIMEOUT_MS = 10000; // bot-challenge PoW can take several seconds to resolve
const POLL_INTERVAL_MS = 200;

// Guards against concurrent duplicate runs for the same navigation. Cleared after
// each attempt (success or failure) so a post-challenge reload can still be retried —
// unlike a permanent blocklist, which would silently eat that retry.
const inFlight = new Set();

function isProductPage(url) {
  return !!url && PRODUCT_URL_MARKERS.some((m) => url.includes(m));
}

// Registered synchronously at top level, as required for MV3 service worker wake-up.
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    if (details.frameId !== 0) return; // main frame only
    if (!isProductPage(details.url)) return;

    const key = `${details.tabId}:${details.url}`;
    if (inFlight.has(key)) return;
    inFlight.add(key);

    handleProductPageDetected(details.url, details.tabId)
      .catch((error) => console.error('[MercadoLibre Tracker] Error:', error))
      .finally(() => inFlight.delete(key));
  },
  { url: PRODUCT_URL_MARKERS.map((m) => ({ urlContains: m })) }
);

async function handleProductPageDetected(url, tabId) {
  const documentHtml = await getHtmlFromTab(tabId);
  if (documentHtml === null) {
    console.warn(`[MercadoLibre Tracker] Skipping "${url}": ready selector never appeared (likely still on the bot-challenge page).`);
    return;
  }

  const extensionStorage = await chrome.storage.local.get(null).catch((error) => {
    console.error('[MercadoLibre Tracker] storage.local read failed:', error);
    return {};
  });

  await sendToBackend({
    url,
    timestamp: new Date().toISOString(),
    extensionStorage,
    documentHtml,
  });
}

// Injected into the tab itself — must be self-contained, no outer-scope references.
function waitForContentAndCaptureHtml(selector, maxWaitMs, pollIntervalMs) {
  const started = Date.now();
  return new Promise((resolve) => {
    (function check() {
      if (document.querySelector(selector)) {
        resolve(document.documentElement.outerHTML);
      } else if (Date.now() - started >= maxWaitMs) {
        resolve(null); // real content never showed up in time
      } else {
        setTimeout(check, pollIntervalMs);
      }
    })();
  });
}

async function getHtmlFromTab(tabId) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      func: waitForContentAndCaptureHtml,
      args: [READY_SELECTOR, WAIT_TIMEOUT_MS, POLL_INTERVAL_MS],
    });
    return result?.result ?? null;
  } catch (error) {
    console.error(`[MercadoLibre Tracker] executeScript failed for tab ${tabId}:`, error);
    return null;
  }
}

async function sendToBackend(payload) {
  try {
    const response = await fetch(BACKEND_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      console.error(`[MercadoLibre Tracker] Backend HTTP ${response.status} for "${payload.url}"`);
    }
  } catch (error) {
    console.error(`[MercadoLibre Tracker] POST failed for "${payload.url}":`, error);
  }
}