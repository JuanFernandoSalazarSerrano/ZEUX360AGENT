const IMPORTANT_SOURCE_KEYS = new Set([
  "id",
  "itemId",
  "title",
  "brand",
  "category",
  "categoryPath",
  "price",
  "originalPrice",
  "currency",
  "seller",
  "reviews",
  "rating",
  "rate",
  "quantity",
  "sold",
  "freeShipping",
  "condition",
  "installments",
  "discount",
]);

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const collectByKey = (value: unknown, target: string, output: unknown[]): void => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectByKey(item, target, output));
    return;
  }

  if (!isObject(value)) {
    return;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (key === target) {
      output.push(nested);
    }
    collectByKey(nested, target, output);
  }
};

const firstNonEmpty = (values: unknown[]): unknown => {
  return values.find((value) => {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "object") {
      return Object.keys(value as Record<string, unknown>).length > 0;
    }

    return true;
  });
};

export const selectImportantFields = (normalized: Record<string, unknown>): Record<string, unknown> => {
  const selected: Record<string, unknown> = {};

  // Field-level extraction from the full tree allows us to survive vendor nesting changes.
  for (const key of IMPORTANT_SOURCE_KEYS) {
    const values: unknown[] = [];
    collectByKey(normalized, key, values);
    const candidate = firstNonEmpty(values);
    if (candidate !== undefined) {
      selected[key] = candidate;
    }
  }

  return selected;
};
