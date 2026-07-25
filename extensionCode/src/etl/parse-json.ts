import { EtlError } from "../utils/errors.js";

export const parseExtractedJson = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new EtlError("Extracted data is not a JSON object.");
  }

  return value as Record<string, unknown>;
};
