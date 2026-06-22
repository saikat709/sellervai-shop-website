"use client";

import Link from "next/link";
import { ChevronRight, Eye, ShoppingBag, ShoppingCart } from "lucide-react";
import type { PublicProduct } from "@/lib/api";
import { formatPrice, discountedPrice } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";

/** Product card with hover-lift, discount badge, and View Details + Add to Cart actions. */
export function ProductCard({
  product,
  primary,
}: {
  product: PublicProduct;
  primary: string;
}) {
  const { addItem } = useCart();
  const { pushToast } = useToast();

  const price = formatPrice(product.price);
  const discount = product.discount ? formatPrice(product.discount) : null;
  const finalPrice = discountedPrice(product.price, product.discount);
  const outOfStock = product.available_count <= 0;

  function handleAddToCart(e: React.MouseEvent) {
    // The card itself can have nested links/buttons — stop the parent
    // navigation from firing when the user explicitly clicks "Add to Cart".
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        productCode: product.product_code,
        name: product.name,
        image_url: product.image_url,
        price: product.price,
        discount: product.discount,
        available_count: product.available_count,
      },
      1,
    );
    pushToast(`Added ${product.name} to cart`, "success");
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-square w-full overflow-hidden bg-zinc-100"
        aria-label={`View ${product.name} details`}
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            No image
          </div>
        )}
        {discount ? (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
            {discount} off
          </span>
        ) : null}
        {outOfStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-zinc-900/80 px-2.5 py-1 text-xs font-semibold text-white shadow">
            Out of stock
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product.id}`} className="line-clamp-1 hover:underline">
          <h3 className="line-clamp-1 text-base font-semibold text-zinc-900">
            {product.name}
          </h3>
        </Link>
        {product.description ? (
          <p className="line-clamp-2 text-sm text-zinc-500">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span
            className="text-lg font-bold"
            style={{ color: finalPrice ? primary : undefined }}
          >
            {finalPrice ?? price}
          </span>
          {discount ? (
            <span className="text-sm text-zinc-400 line-through">{price}</span>
          ) : null}
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            <Eye className="h-4 w-4" aria-hidden />
            View Details
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: primary }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

/** Dark, three-column footer with bottom copyright bar. */
export function SiteFooter({
  displayName,
  description,
}: {
  displayName: string;
  description: string | null;
}) {
  return (
    <footer className="mt-12 bg-[#1a1a2e] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <span className="text-lg font-semibold tracking-tight">
            {displayName}
          </span>
          {description ? (
            <p className="mt-2 max-w-xs text-sm text-white/70">
              {description}
            </p>
          ) : null}
        </div>

        <nav className="text-sm" aria-label="Footer">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Explore
          </h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/" className="text-white/85 transition hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="text-white/85 transition hover:text-white"
              >
                Products
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-white/85 transition hover:text-white">
                Cart
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Powered by
          </h3>
          <Link
            href="https://sellervai.com"
            className="mt-3 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 transition hover:bg-white/20"
          >
            SellerVai
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-white/60 sm:px-6">
          © {new Date().getFullYear()} {displayName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/**
 * Renders when the subdomain header is missing or the backend can't find the
 * store. Used by every storefront page's server component.
 */
export function ShopNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
        This shop doesn&apos;t exist or is not published yet.
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-500">
        Double-check the URL or come back later.
      </p>
    </div>
  );
}

/** Empty-cart placeholder used by both `/cart` and `/checkout`. */
export function EmptyCartState({ primary }: { primary: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 px-4 py-16 text-center">
      <ShoppingBag className="mb-3 h-12 w-12 text-zinc-300" aria-hidden />
      <h2 className="text-lg font-semibold text-zinc-700">Your cart is empty</h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        Add a few items before proceeding to checkout.
      </p>
      <Link
        href="/products"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
        style={{ backgroundColor: primary }}
      >
        Browse Products
      </Link>
    </div>
  );
}

/**
 * Breadcrumb nav. Last item is treated as the current page (no link).
 * Earlier items render as links to `href`.
 */
export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      className="mb-6 flex items-center gap-1 text-sm text-zinc-500"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-zinc-700">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-zinc-700" : undefined}>
                {item.label}
              </span>
            )}
            {!isLast ? <ChevronRight className="h-3.5 w-3.5" aria-hidden /> : null}
          </span>
        );
      })}
    </nav>
  );
}