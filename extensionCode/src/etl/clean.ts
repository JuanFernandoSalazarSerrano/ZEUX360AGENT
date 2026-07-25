const IMPORTANT_FALSE_FIELDS = new Set(["freeShipping"]);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isEmptyObject = (value: unknown): boolean =>
  isPlainObject(value) && Object.keys(value).length === 0;

const isEmptyArray = (value: unknown): boolean => Array.isArray(value) && value.length === 0;

const shouldDropPrimitive = (key: string | null, value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" || trimmed === "not_apply";
  }

  if (value === false && key && !IMPORTANT_FALSE_FIELDS.has(key)) {
    return true;
  }

  return false;
};

export const cleanRecursively = (value: unknown, currentKey: string | null = null): unknown => {
  if (Array.isArray(value)) {
    // Arrays are cleaned element-by-element, then compacted to reduce ETL payload volume.
    const cleaned = value
      .map((item) => cleanRecursively(item, currentKey))
      .filter((item) => !shouldDropPrimitive(currentKey, item) && !isEmptyObject(item) && !isEmptyArray(item));
    return cleaned;
  }

  if (!value || typeof value !== "object") {
    return shouldDropPrimitive(currentKey, value) ? undefined : value;
  }

  const output: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    // Objects are rebuilt immutably so each ETL stage remains side-effect free.
    const cleanedValue = cleanRecursively(nested, key);
    if (shouldDropPrimitive(key, cleanedValue) || isEmptyObject(cleanedValue) || isEmptyArray(cleanedValue)) {
      continue;
    }
    output[key] = cleanedValue;
  }

  return output;
};
