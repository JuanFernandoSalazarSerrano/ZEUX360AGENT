const KEY_MAPPING: Record<string, string> = {
  item_id: "id",
  currency_id: "currency",
  original_price: "originalPrice",
  sold_quantity: "sold",
  item_condition: "condition",
  available_quantity: "quantity",
  free_shipping_benefit: "freeShipping",
  review_count: "reviews",
  rate: "rating",
  category_path: "category",
};

const toCamelCase = (value: string): string =>
  value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

const mapKey = (key: string): string => {
  if (KEY_MAPPING[key]) {
    return KEY_MAPPING[key];
  }
  return toCamelCase(key);
};

export const normalizeObjectKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeObjectKeys);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const normalized: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    normalized[mapKey(key)] = normalizeObjectKeys(nestedValue);
  }

  return normalized;
};
