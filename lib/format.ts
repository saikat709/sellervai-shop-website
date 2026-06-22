/** Money + discount helpers shared across storefront surfaces. */

const BDT_PREFIX = "৳";

function toFiniteNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : null;
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
