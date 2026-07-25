import { parse } from "node-html-parser";
import { EtlError } from "../utils/errors.js";

const PRODUCT_RELEVANT_KEYS = new Set([
  "id",
  "item_id",
  "title",
  "brand",
  "price",
  "original_price",
  "currency",
  "currency_id",
  "sold_quantity",
  "available_quantity",
  "item_condition",
  "installments",
  "seller",
  "reviews",
  "rating",
  "category",
  "category_path",
]);

interface Candidate {
  raw: string;
  parsed: unknown;
  size: number;
  score: number;
}

const extractBalancedJsonObjects = (source: string): string[] => {
  // Stateful scan avoids brittle regex and correctly handles nested braces and strings.
  const candidates: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let quote = "";
  let escaped = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === quote) {
        inString = false;
        quote = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      if (depth > 0) {
        depth -= 1;
      }

      if (depth === 0 && start >= 0) {
        candidates.push(source.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return candidates;
};

const scoreObjectRelevance = (value: unknown): number => {
  if (!value || typeof value !== "object") {
    return 0;
  }

  if (Array.isArray(value)) {
    return value.reduce((acc, item) => acc + scoreObjectRelevance(item), 0);
  }

  return Object.entries(value as Record<string, unknown>).reduce((acc, [key, nested]) => {
    const keyScore = PRODUCT_RELEVANT_KEYS.has(key) ? 10 : 0;
    return acc + keyScore + scoreObjectRelevance(nested);
  }, 0);
};

const toCandidate = (raw: string): Candidate | null => {
  try {
    const parsed = JSON.parse(raw);
    return {
      raw,
      parsed,
      size: raw.length,
      score: scoreObjectRelevance(parsed),
    };
  } catch {
    return null;
  }
};

export const extractLargestProductJson = (documentHtml: string): unknown => {
  // Parse the DOM and inspect only script contents because MercadoLibre embeds data there.
  const root = parse(documentHtml);
  const scripts = root.querySelectorAll("script");

  const ranked: Candidate[] = [];

  for (const script of scripts) {
    const scriptText = script.textContent;
    if (!scriptText) {
      continue;
    }

    const objects = extractBalancedJsonObjects(scriptText);
    for (const objectText of objects) {
      const candidate = toCandidate(objectText);
      if (!candidate) {
        continue;
      }
      ranked.push(candidate);
    }
  }

  if (!ranked.length) {
    throw new EtlError("No valid JSON object candidate found in HTML scripts.");
  }

  // We prioritize product relevance first and size second; biggest alone is often noisy.
  ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.size - a.size;
  });

  const best = ranked[0];
  if (!best || best.score === 0) {
    throw new EtlError("Could not locate a product-related JSON object in HTML scripts.");
  }

  return best.parsed;
};
