import type { CanonicalProduct } from "../types/product-event.js";

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const asString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const asBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }
    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return undefined;
};

const toCategory = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const parsed = value
      .map((item) => asString(item))
      .filter((item): item is string => Boolean(item));
    return parsed.length ? parsed : undefined;
  }

  if (typeof value === "string") {
    const pieces = value
      .split(/[>/|]/g)
      .map((piece) => piece.trim())
      .filter((piece) => piece.length > 0);
    return pieces.length ? pieces : [value];
  }

  return undefined;
};

const toInstallments = (value: unknown): CanonicalProduct["installments"] => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const asRecord = value as Record<string, unknown>;
  const count = asNumber(asRecord["count"] ?? asRecord["quantity"]);
  const amount = asNumber(asRecord["amount"] ?? asRecord["value"]);

  if (count === undefined || amount === undefined) {
    return undefined;
  }

  return { count, amount };
};

const computeDiscount = (price: number | undefined, originalPrice: number | undefined, provided?: number): number | undefined => {
  if (provided !== undefined) {
    return provided;
  }

  if (price === undefined || originalPrice === undefined || originalPrice <= 0 || originalPrice <= price) {
    return undefined;
  }

  const discount = ((originalPrice - price) / originalPrice) * 100;
  return Number(discount.toFixed(2));
};

export const toCanonicalProduct = (selected: Record<string, unknown>): CanonicalProduct => {
  const price = asNumber(selected["price"]);
  const originalPrice = asNumber(selected["originalPrice"]);
  const providedDiscount = asNumber(selected["discount"]);

  const canonical: CanonicalProduct = {};

  const id = asString(selected["id"] ?? selected["itemId"]);
  if (id !== undefined) {
    canonical.id = id;
  }

  const title = asString(selected["title"]);
  if (title !== undefined) {
    canonical.title = title;
  }

  const brand = asString(selected["brand"]);
  if (brand !== undefined) {
    canonical.brand = brand;
  }

  const category = toCategory(selected["category"] ?? selected["categoryPath"]);
  if (category !== undefined) {
    canonical.category = category;
  }

  if (price !== undefined) {
    canonical.price = price;
  }

  if (originalPrice !== undefined) {
    canonical.originalPrice = originalPrice;
  }

  const currency = asString(selected["currency"]);
  if (currency !== undefined) {
    canonical.currency = currency;
  }

  const discount = computeDiscount(price, originalPrice, providedDiscount);
  if (discount !== undefined) {
    canonical.discount = discount;
  }

  const seller = asString(selected["seller"]);
  if (seller !== undefined) {
    canonical.seller = seller;
  }

  const rating = asNumber(selected["rating"] ?? selected["rate"]);
  if (rating !== undefined) {
    canonical.rating = rating;
  }

  const reviews = asNumber(selected["reviews"]);
  if (reviews !== undefined) {
    canonical.reviews = reviews;
  }

  const quantity = asNumber(selected["quantity"]);
  if (quantity !== undefined) {
    canonical.quantity = quantity;
  }

  const sold = asNumber(selected["sold"]);
  if (sold !== undefined) {
    canonical.sold = sold;
  }

  const freeShipping = asBoolean(selected["freeShipping"]);
  if (freeShipping !== undefined) {
    canonical.freeShipping = freeShipping;
  }

  const condition = asString(selected["condition"]);
  if (condition !== undefined) {
    canonical.condition = condition;
  }

  const installments = toInstallments(selected["installments"]);
  if (installments !== undefined) {
    canonical.installments = installments;
  }

  return canonical;
};
