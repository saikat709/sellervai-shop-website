"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { formatPrice, discountedPrice, unitPriceOf } from "@/lib/format";
import { createPublicOrder } from "@/lib/api";
import { Breadcrumb, EmptyCartState } from "@/components/storefront";

type FieldErrors = Partial<
  Record<"customer_name" | "customer_phone" | "delivery_address", string>
>;

export function CheckoutClient({
  storeId,
  primary,
}: {
  storeId: string;
  primary: string;
}) {
  const router = useRouter();
  const { items, subtotal, total, discount, clearCart } = useCart();
  const { pushToast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return <EmptyCartState primary={primary} />;
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!name.trim()) e.customer_name = "Please enter your full name.";
    if (!phone.trim()) e.customer_phone = "Please enter a phone number.";
    else if (!/^[+0-9\-\s()]{6,20}$/.test(phone.trim()))
      e.customer_phone = "Enter a valid phone number.";
    if (!address.trim()) e.delivery_address = "Please enter a delivery address.";
    return e;
  }

  async function handlePlaceOrder() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      pushToast("Please fix the highlighted fields", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        store_id: storeId,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_phone_2: phone2.trim() || null,
        delivery_address: address.trim(),
        items: items.map((i) => ({
          product_code: i.productCode,
          product_name: i.name,
          product_price: unitPriceOf(i).toFixed(2),
          quantity: i.quantity,
        })),
        coupon_code: discount?.code ?? null,
        discount_applied: (discount?.amount ?? 0).toFixed(2),
        total_amount: total.toFixed(2),
      };
      const orderNumber = await createPublicOrder(payload);
      clearCart();
      router.push(`/orders/${orderNumber}`);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Failed to place order", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">
            Customer details
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            We&apos;ll use these to confirm your order and arrange delivery.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              required
              error={errors.customer_name}
              value={name}
              onChange={setName}
              placeholder="Your full name"
              className="sm:col-span-2"
            />
            <Field
              label="Phone number"
              required
              error={errors.customer_phone}
              value={phone}
              onChange={setPhone}
              placeholder="01XXXXXXXXX"
              inputMode="tel"
            />
            <Field
              label="Secondary phone"
              value={phone2}
              onChange={setPhone2}
              placeholder="Optional"
              inputMode="tel"
            />
            <Field
              label="Delivery address"
              required
              error={errors.delivery_address}
              value={address}
              onChange={setAddress}
              placeholder="House, road, area, city"
              multiline
              className="sm:col-span-2"
            />
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">
              Order summary
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((i) => {
                const unit =
                  discountedPrice(i.price, i.discount) ?? formatPrice(i.price);
                return (
                  <li
                    key={i.productId}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="line-clamp-1 text-zinc-700">
                      {i.name} <span className="text-zinc-400">×{i.quantity}</span>
                    </span>
                    <span className="shrink-0 text-zinc-700">{unit}</span>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Subtotal</dt>
                <dd className="font-semibold">{formatPrice(subtotal)}</dd>
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
                <dd className="font-bold" style={{ color: primary }}>
                  {formatPrice(total)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: primary }}
            >
              {submitting ? "Placing order…" : "Place Order"}
            </button>
            <p className="mt-2 text-center text-xs text-zinc-500">
              By placing this order you agree to share your contact details with
              the store.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  multiline,
  inputMode,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  inputMode?: "text" | "tel" | "email" | "numeric";
  className?: string;
}) {
  const ring = error ? "border-red-400 focus:ring-red-200" : "border-zinc-200";
  return (
    <div className={className}>
      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${ring}`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className={`mt-1 block h-11 w-full rounded-lg border bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 ${ring}`}
        />
      )}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}