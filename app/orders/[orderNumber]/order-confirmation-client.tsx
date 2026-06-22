"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CheckCircle2, Package } from "lucide-react";
import type { OrderStatus, PublicOrderDetail } from "@/lib/api";
import { formatPrice, parsePrice } from "@/lib/format";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function OrderConfirmationClient({
  order,
  primary,
}: {
  order: PublicOrderDetail | null;
  primary: string;
}) {
  if (!order) return <OrderNotFound primary={primary} />;

  const status = (order.status ?? "PENDING") as OrderStatus;
  const statusClass = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;

  // Subtotal reconstructed from line totals because the public payload only
  // carries the discounted total + discount applied.
  const { subtotal, total } = useMemo(() => {
    const sub = order.items.reduce(
      (sum, item) => sum + parsePrice(item.product_price) * item.quantity,
      0,
    );
    const disc = parsePrice(order.discount_applied);
    return { subtotal: sub, total: parsePrice(order.total_amount) || Math.max(0, sub - disc) };
  }, [order]);
  const discount = parsePrice(order.discount_applied);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: `${primary}1A` }}
          aria-hidden
        >
          <CheckCircle2 className="h-12 w-12" style={{ color: primary }} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Order Placed Successfully!
        </h1>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          Thanks for shopping with us. We&apos;ll be in touch shortly to
          confirm your order and arrange delivery.
        </p>
        <span
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
          style={{ backgroundColor: `${primary}1A`, color: primary }}
        >
          <Package className="h-3.5 w-3.5" aria-hidden />
          {order.order_number}
        </span>
        <span
          className={`mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusClass}`}
        >
          {status}
        </span>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Items</h2>
        <ul className="mt-4 divide-y divide-zinc-200">
          {order.items.map((item) => (
            <li
              key={item.product_code}
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium text-zinc-900">
                  {item.product_name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {formatPrice(item.product_price)} × {item.quantity}
                </p>
              </div>
              <span
                className="shrink-0 text-sm font-semibold"
                style={{ color: primary }}
              >
                {formatPrice(parsePrice(item.product_price) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Subtotal</dt>
            <dd className="font-semibold">{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between text-emerald-700">
              <dt>
                Discount
                {order.coupon_code ? (
                  <span className="ml-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {order.coupon_code}
                  </span>
                ) : null}
              </dt>
              <dd className="font-semibold">− {formatPrice(discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-zinc-200 pt-3 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-bold" style={{ color: primary }}>
              {formatPrice(total)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">
          Customer details
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Name
            </dt>
            <dd className="mt-0.5 text-zinc-900">{order.customer_name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Phone
            </dt>
            <dd className="mt-0.5 text-zinc-900">{order.customer_phone}</dd>
          </div>
          {order.customer_phone_2 ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Secondary phone
              </dt>
              <dd className="mt-0.5 text-zinc-900">
                {order.customer_phone_2}
              </dd>
            </div>
          ) : null}
          <div className={order.customer_phone_2 ? "sm:col-span-2" : ""}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Delivery address
            </dt>
            <dd className="mt-0.5 whitespace-pre-line text-zinc-900">
              {order.delivery_address}
            </dd>
          </div>
        </dl>
      </section>

      <div className="flex justify-center pt-2">
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
          style={{ backgroundColor: primary }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function OrderNotFound({ primary }: { primary: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 px-4 py-16 text-center">
      <Package className="mb-3 h-12 w-12 text-zinc-300" aria-hidden />
      <h1 className="text-xl font-semibold text-zinc-800 sm:text-2xl">
        Order not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        We couldn&apos;t find an order with that number. Double-check the link
        or browse our products.
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
