"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Tag, Trash2 } from "lucide-react";
import { useCart, type CartItem } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import {
  discountedPrice,
  formatPrice,
  unitPriceOf,
} from "@/lib/format";
import { validateCoupon } from "@/lib/api";
import { EmptyCartState } from "@/components/storefront";

export function CartClient({
  storeId,
  primary,
  displayName,
}: {
  storeId: string;
  primary: string;
  displayName: string;
}) {
  const {
    items,
    updateQty,
    removeItem,
    subtotal,
    total,
    discount,
    applyDiscount,
    clearCart,
  } = useCart();
  const { pushToast } = useToast();

  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (items.length === 0) {
    return <EmptyCartState primary={primary} />;
  }

  async function handleApplyCoupon() {
    if (!code.trim()) {
      setCouponError("Enter a coupon code");
      return;
    }
    setApplying(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(code.trim(), storeId, subtotal);
      if (result.valid) {
        applyDiscount({ code: code.trim().toUpperCase(), amount: result.discount_amount });
        pushToast(result.message, "success");
      } else {
        applyDiscount(null);
        setCouponError(result.message);
      }
    } catch {
      setCouponError("Could not validate coupon");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.productId}>
            <CartItemRow item={item} primary={primary} />
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => {
              clearCart();
              pushToast("Cart cleared", "info");
            }}
            className="text-xs text-zinc-500 underline-offset-4 transition hover:text-zinc-700 hover:underline"
          >
            Clear cart
          </button>
        </li>
      </ul>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Order Summary</h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd className="font-semibold text-zinc-900">
                {formatPrice(subtotal)}
              </dd>
            </div>
            {discount ? (
              <div className="flex justify-between text-emerald-700">
                <dt>
                  Discount
                  <span className="ml-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {discount.code}
                  </span>
                </dt>
                <dd className="font-semibold">− {formatPrice(discount.amount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-zinc-200 pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd
                className="font-bold"
                style={{ color: primary }}
              >
                {formatPrice(total)}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Coupon
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCouponError(null);
                }}
                placeholder="Enter code"
                className="h-10 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2"
                aria-label="Coupon code"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={applying}
                className="inline-flex h-10 items-center gap-1 rounded-lg border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                <Tag className="h-3.5 w-3.5" />
                {applying ? "…" : "Apply"}
              </button>
            </div>
            {couponError ? (
              <p className="mt-2 text-xs text-red-600">{couponError}</p>
            ) : null}
          </div>

          <Link
            href="/checkout"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
            style={{ backgroundColor: primary }}
          >
            Proceed to Checkout
          </Link>

          <p className="mt-3 text-center text-xs text-zinc-500">
            Ordering from <span className="font-semibold">{displayName}</span>
          </p>
        </div>
      </aside>
    </div>
  );

  function CartItemRow({ item, primary }: { item: CartItem; primary: string }) {
    const unit = discountedPrice(item.price, item.discount) ?? formatPrice(item.price);
    const lineTotal = formatPrice(unitPriceOf(item) * item.quantity);
    const cap = item.available_count ?? Infinity;
    return (
      <div className="flex items-stretch gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
        <Link
          href={`/products/${item.productId}`}
          className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-28 sm:w-28"
        >
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
        </Link>
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/products/${item.productId}`}
              className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:underline sm:text-base"
            >
              {item.name}
            </Link>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              aria-label={`Remove ${item.name}`}
              className="rounded p-1 text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-0.5 text-sm text-zinc-500">{unit}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="inline-flex h-9 items-center rounded-full border border-zinc-200">
              <button
                type="button"
                onClick={() => updateQty(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="h-full w-8 rounded-l-full text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40"
                aria-label="Decrease"
              >
                <Minus className="mx-auto h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQty(item.productId, item.quantity + 1)}
                disabled={item.quantity >= cap}
                className="h-full w-8 rounded-r-full text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40"
                aria-label="Increase"
              >
                <Plus className="mx-auto h-3.5 w-3.5" />
              </button>
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: primary }}
            >
              {lineTotal}
            </span>
          </div>
        </div>
      </div>
    );
  }
}