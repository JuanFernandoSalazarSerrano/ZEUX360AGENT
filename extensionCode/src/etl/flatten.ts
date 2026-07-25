export const flattenObject = (
  value: unknown,
  prefix = "",
  output: Record<string, unknown> = {},
): Record<string, unknown> => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      flattenObject(item, `${prefix}[${index}]`, output);
    });
    return output;
  }

  if (!value || typeof value !== "object") {
    if (prefix) {
      output[prefix] = value;
    }
    return output;
  }

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    const next = prefix ? `${prefix}.${key}` : key;
    flattenObject(nested, next, output);
  }

  return output;
};
