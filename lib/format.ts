/** Money + discount helpers shared across storefront surfaces. */

const BDT_PREFIX = "৳";

function toFiniteNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : null;
}

/** Decimal-as-string price with a guaranteed finite numeric fallback (0). */
export function parsePrice(value: string | number | null | undefined): number {
  const n = toFiniteNumber(value);
  return n ?? 0;
}

/**
 * Discounted unit price for any object with `price` + optional `discount`,
 * clamped at zero so UI never displays a negative number.
 */
export function unitPriceOf({
  price,
  discount,
}: {
  price: string | number;
  discount?: string | number | null;
}): number {
  const base = parsePrice(price);
  const disc = discount ? parsePrice(discount) : 0;
  return Math.max(0, base - disc);
}

/** Format a price string ("4500.00") or number as BDT. */
export function formatPrice(value: string | number | null | undefined): string {
  const n = toFiniteNumber(value);
  if (n === null) return String(value ?? "");
  return `${BDT_PREFIX}${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Compute the discounted price as a formatted BDT string, or `null` when the
 * discount is missing/invalid (i.e. caller should fall back to `formatPrice`).
 */
export function discountedPrice(
  price: string | number,
  discount: string | number | null | undefined,
): string | null {
  if (discount == null) return null;
  const p = toFiniteNumber(price);
  const d = toFiniteNumber(discount);
  if (p === null || d === null || d <= 0 || d >= p) return null;
  return formatPrice(p - d);
}
