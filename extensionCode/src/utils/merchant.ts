export const detectMerchant = (url: string): string => {
  const lower = url.toLowerCase();

  if (lower.includes("mercadolibre")) {
    return "MercadoLibre";
  }

  return "Unknown";
};
