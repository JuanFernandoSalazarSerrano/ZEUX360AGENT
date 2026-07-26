import type { CanonicalProduct } from "../types/product-event.js";
import { parse } from "node-html-parser";
import { EtlError } from "../utils/errors.js";
import { cleanRecursively } from "./clean.js";
import { extractLargestProductJson } from "./extract-largest-product-json.js";
import { flattenObject } from "./flatten.js";
import { normalizeObjectKeys } from "./normalize.js";
import { parseExtractedJson } from "./parse-json.js";
import { selectImportantFields } from "./select-important-fields.js";
import { toCanonicalProduct } from "./to-canonical-product.js";

export interface EtlDebugArtifacts {
  cleaned: Record<string, unknown>;
  flattened: Record<string, unknown>;
  selected: Record<string, unknown>;
}

export interface EtlResult {
  product: CanonicalProduct;
  artifacts: EtlDebugArtifacts;
}

const parseHtmlPrice = (raw: string | null | undefined): number | undefined => {
  if (!raw) {
    return undefined;
  }

  const normalized = raw.replace(/\u00A0/g, " ").trim();
  const digits = normalized.replace(/[^\d.,]/g, "").replace(/\s+/g, "");
  if (!digits) {
    return undefined;
  }

  const parsed = Number(digits.replace(/\./g, "").replace(/,/g, "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const extractPriceFromHtml = (documentHtml: string): number | undefined => {
  const root = parse(documentHtml);
  const priceContainer = root.querySelector("div.ui-pdp-container__row.ui-pdp-container__row--price");

  const candidates = [
    priceContainer?.querySelector('[itemprop="price"]'),
    root.querySelector('[itemprop="price"]'),
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const value = parseHtmlPrice(candidate.getAttribute("content") ?? candidate.textContent);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
};

export const runMercadoLibreEtl = (documentHtml: string): EtlResult => {
  // 1) Extract product-related JSON from HTML scripts.
  const extracted = extractLargestProductJson(documentHtml);

  // 2) Parse and validate JSON shape.
  const parsed = parseExtractedJson(extracted);

  // 3) Normalize vendor-specific keys into generic names.
  const normalized = normalizeObjectKeys(parsed) as Record<string, unknown>;

  // 4) Remove nulls, empty values, and other noise recursively.
  const cleaned = cleanRecursively(normalized) as Record<string, unknown>;

  // 5) Flatten nested branches to simplify traceability and diagnostics.
  const flattened = flattenObject(cleaned);

  // 6) Keep only a business-oriented whitelist of fields.
  const selected = selectImportantFields(cleaned);

  // 7) Create the canonical product object used by all merchants.
  const product = toCanonicalProduct(selected);

  if (product.price === undefined || product.price <= 0) {
    const fallbackPrice = extractPriceFromHtml(documentHtml);
    if (fallbackPrice === undefined) {
      throw new EtlError("Could not determine product price from JSON or HTML fallback.");
    }

    product.price = fallbackPrice;
  }

  return {
    product,
    artifacts: {
      cleaned,
      flattened,
      selected,
    },
  };
};
