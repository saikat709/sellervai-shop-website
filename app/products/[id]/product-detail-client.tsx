"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, CheckCircle2 } from "lucide-react";
import type { PublicProductDetail } from "@/lib/api";
import { formatPrice, discountedPrice, unitPriceOf } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";

export function ProductDetailClient({
  product,
  primary,
}: {
  product: PublicProductDetail;
  primary: string;
}) {
  const images = [product.image_url, ...(product.other_images ?? [])].filter(
    (x): x is string => Boolean(x),
  );
  const [activeImage, setActiveImage] = useState(images[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { pushToast } = useToast();

  const outOfStock = product.available_count <= 0;
  const max = product.available_count;
  const safeQty = Math.max(1, Math.min(quantity, Math.max(1, max)));
  const unitBase = formatPrice(product.price);
  const discount = product.discount ? formatPrice(product.discount) : null;
  const finalUnit = discountedPrice(product.price, product.discount);
  const lineTotal = formatPrice(unitPriceOf(product) * safeQty);

  function handleAddToCart() {
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
      safeQty,
    );
    pushToast(`Added ${safeQty} × ${product.name} to cart`, "success");
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* Image gallery */}
      <div>
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
          {activeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              No image
            </div>
          )}
        </div>
        {images.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActiveImage(src)}
                aria-label={`Show image ${i + 1}`}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  activeImage === src
                    ? "border-zinc-900"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
                style={
                  activeImage === src
                    ? { borderColor: primary }
                    : undefined
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Details */}
      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {product.name}
          </h1>
          {discount ? (
            <span className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
              {discount} off
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <span
            className="text-2xl font-bold"
            style={{ color: finalUnit ? primary : undefined }}
          >
            {finalUnit ?? unitBase}
          </span>
          {discount ? (
            <span className="text-base text-zinc-400 line-through">{unitBase}</span>
          ) : null}
        </div>

        {product.description ? (
          <p className="mt-4 leading-relaxed text-zinc-600">
            {product.description}
          </p>
        ) : null}

        <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
          {outOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
              Out of stock
            </span>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              <span>{product.available_count} in stock</span>
            </>
          )}
        </div>

        {/* Quantity + add to cart (desktop) */}
        <div className="mt-6 hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
          <div className="inline-flex h-11 items-center rounded-full border border-zinc-200 bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={outOfStock}
              className="h-full w-10 rounded-l-full text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="mx-auto h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-semibold">
              {safeQty}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(max, q + 1))}
              disabled={outOfStock}
              className="h-full w-10 rounded-r-full text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="mx-auto h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: primary }}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>

        {/* Quantity + add to cart (mobile sticky bar) */}
        <MobileStickyBar
          primary={primary}
          outOfStock={outOfStock}
          quantity={safeQty}
          onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          onIncrease={() => setQuantity((q) => Math.min(max, q + 1))}
          onAdd={handleAddToCart}
          lineTotal={lineTotal}
        />
      </div>
    </div>
  );
}

function MobileStickyBar({
  primary,
  outOfStock,
  quantity,
  onDecrease,
  onIncrease,
  onAdd,
  lineTotal,
}: {
  primary: string;
  outOfStock: boolean;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onAdd: () => void;
  lineTotal: string;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden"
      role="region"
      aria-label="Add to cart"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500">Total</span>
          <span
            className="text-base font-bold"
            style={{ color: primary }}
          >
            {lineTotal}
          </span>
        </div>
        <div className="flex flex-1 items-center gap-2">
          <div className="inline-flex h-10 items-center rounded-full border border-zinc-200">
            <button
              type="button"
              onClick={onDecrease}
              disabled={outOfStock}
              className="h-full w-9 rounded-l-full text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="mx-auto h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={outOfStock}
              className="h-full w-9 rounded-r-full text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="mx-auto h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={outOfStock}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: primary }}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}