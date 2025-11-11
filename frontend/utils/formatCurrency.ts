const DEFAULT_CURRENCY = "GBP"; // 💷 Change this to USD, EUR, etc if needed
const DEFAULT_LOCALE = "en-GB"; // en-US for $, en-GB for £

export function formatCurrency(
  value: number | string,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  if (value === null || value === undefined || value === "") return "—";

  const num = Number(value);
  if (isNaN(num)) return value.toString();

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    // minimumFractionDigits: 2,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // remove decimals
  }).format(num);
}
