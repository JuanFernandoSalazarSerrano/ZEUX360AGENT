import type { CanonicalProduct } from "../types/product-event.js";
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

  return {
    product,
    artifacts: {
      cleaned,
      flattened,
      selected,
    },
  };
};
